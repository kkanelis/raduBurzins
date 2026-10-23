<?php

namespace Tests\Feature;

use App\Models\Album;
use App\Models\AlbumPhoto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AlbumCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_a_photo_album(): void
    {
        $user = User::factory()->create(['is_approved' => true]);

        $response = $this->actingAs($user)
            ->postJson('/api/albums', [
                'title' => 'Vasaras svētki',
                'description' => 'Kopīgās ģimenes atmiņas',
                'is_public' => true,
            ])
            ->assertOk()
            ->assertJsonPath('album.title', 'Vasaras svētki');

        $this->assertDatabaseHas('albums', [
            'id' => $response->json('album.id'),
            'user_id' => $user->id,
            'title' => 'Vasaras svētki',
        ]);
    }

    public function test_album_list_is_paginated_and_returns_only_each_albums_cover_photo(): void
    {
        $user = User::factory()->create(['is_approved' => true]);

        for ($albumIndex = 0; $albumIndex < 13; $albumIndex++) {
            $album = Album::create([
                'user_id' => $user->id,
                'title' => 'Albums '.$albumIndex,
                'is_public' => true,
            ]);

            for ($photoIndex = 0; $photoIndex < 3; $photoIndex++) {
                AlbumPhoto::create([
                    'album_id' => $album->id,
                    'title' => 'Foto '.$photoIndex,
                    'image_path' => 'albums/'.$album->id.'/photo-'.$photoIndex.'.jpg',
                    'reactions' => [],
                    'likes_count' => 0,
                ]);
            }
        }

        $response = $this->actingAs($user)
            ->getJson('/api/albums')
            ->assertOk()
            ->assertJsonPath('current_page', 1)
            ->assertJsonPath('last_page', 2)
            ->assertJsonPath('total', 13);

        $this->assertCount(12, $response->json('data'));
        $this->assertCount(1, $response->json('data.0.photos'));
        $this->assertSame(3, $response->json('data.0.photos_count'));

        $this->actingAs($user)
            ->getJson('/api/albums/'.$response->json('data.0.id'))
            ->assertOk()
            ->assertJsonCount(3, 'photos')
            ->assertJsonPath('photos_pagination.total', 3);
    }

    public function test_album_details_paginate_large_photo_collections(): void
    {
        $user = User::factory()->create(['is_approved' => true]);
        $album = Album::create([
            'user_id' => $user->id,
            'title' => 'Liels albums',
            'is_public' => true,
        ]);

        for ($photoIndex = 0; $photoIndex < 25; $photoIndex++) {
            AlbumPhoto::create([
                'album_id' => $album->id,
                'title' => 'Foto '.$photoIndex,
                'image_path' => 'albums/'.$album->id.'/photo-'.$photoIndex.'.jpg',
                'reactions' => [],
                'likes_count' => 0,
            ]);
        }

        $this->actingAs($user)
            ->getJson('/api/albums/'.$album->id)
            ->assertOk()
            ->assertJsonCount(24, 'photos')
            ->assertJsonPath('photos_pagination.last_page', 2)
            ->assertJsonPath('photos_pagination.total', 25);

        $this->actingAs($user)
            ->getJson('/api/albums/'.$album->id.'?photos_page=2')
            ->assertOk()
            ->assertJsonCount(1, 'photos')
            ->assertJsonPath('photos_pagination.current_page', 2);
    }

    public function test_uploaded_album_photo_is_stored_in_private_storage(): void
    {
        Storage::fake('private');
        Storage::fake('public');

        $user = User::factory()->create(['is_approved' => true]);

        $albumResponse = $this->actingAs($user)
            ->postJson('/api/albums', [
                'title' => 'Privāts albums',
                'is_public' => false,
                'photos' => [[
                    'title' => 'Privāts foto',
                    'image' => UploadedFile::fake()->image('family.png', 200, 200),
                ]],
            ])
            ->assertOk();

        $photoUrl = $albumResponse->json('album.photos.0.image_path');
        $this->assertNotNull($photoUrl);
        $this->assertStringNotContainsString('/storage/', $photoUrl);

        $album = Album::find($albumResponse->json('album.id'));
        $photo = $album->photos()->first();

        $this->assertNotNull($photo);
        $this->assertTrue(Storage::disk('private')->exists($photo->image_path));
        $this->assertFalse(Storage::disk('public')->exists($photo->image_path));
    }

    public function test_added_photo_file_is_removed_if_photo_record_creation_fails(): void
    {
        Storage::fake('private');

        $user = User::factory()->create(['is_approved' => true]);
        $album = Album::create([
            'user_id' => $user->id,
            'title' => 'Albums',
            'is_public' => true,
        ]);

        AlbumPhoto::creating(function () {
            throw new \RuntimeException('Photo record could not be created.');
        });

        $response = $this->actingAs($user)
            ->postJson('/api/albums/'.$album->id.'/photos', [
                'title' => 'Foto',
                'image' => UploadedFile::fake()->image('photo.png', 200, 200),
            ]);

        $response->assertStatus(500);
        $this->assertDatabaseCount('album_photos', 0);
        $this->assertSame([], Storage::disk('private')->allFiles('albums/'.$album->id));
    }

    public function test_photo_reactions_and_likes_count_stay_in_sync_for_multiple_users(): void
    {
        $firstUser = User::factory()->create(['is_approved' => true]);
        $secondUser = User::factory()->create(['is_approved' => true]);
        $album = Album::create([
            'user_id' => $firstUser->id,
            'title' => 'Publisks albums',
            'is_public' => true,
        ]);
        $photo = AlbumPhoto::create([
            'album_id' => $album->id,
            'title' => 'Foto',
            'image_path' => 'albums/'.$album->id.'/photo.jpg',
            'reactions' => [],
            'likes_count' => 0,
        ]);

        $this->actingAs($firstUser)
            ->postJson('/api/albums/'.$album->id.'/photos/'.$photo->id.'/react', ['emoji' => '❤️'])
            ->assertOk()
            ->assertJsonPath('photo.likes_count', 1);

        $secondReaction = $this->actingAs($secondUser)
            ->postJson('/api/albums/'.$album->id.'/photos/'.$photo->id.'/react', ['emoji' => '👏'])
            ->assertOk()
            ->assertJsonPath('photo.likes_count', 2);

        $this->assertSame([
            (string) $firstUser->id => '❤️',
            (string) $secondUser->id => '👏',
        ], $secondReaction->json('photo.reactions'));

        $this->actingAs($firstUser)
            ->deleteJson('/api/albums/'.$album->id.'/photos/'.$photo->id.'/react')
            ->assertOk()
            ->assertJsonPath('photo.likes_count', 1)
            ->assertJsonPath('photo.reactions.'.(string) $secondUser->id, '👏');
    }

    public function test_failed_photo_creation_rolls_back_album_and_cleans_uploaded_files(): void
    {
        Storage::fake('private');

        $user = User::factory()->create(['is_approved' => true]);

        $photoCreationCount = 0;
        AlbumPhoto::creating(function () use (&$photoCreationCount) {
            $photoCreationCount++;

            if ($photoCreationCount === 2) {
                throw new \RuntimeException('Photo record could not be created.');
            }
        });

        $response = $this->actingAs($user)
            ->postJson('/api/albums', [
                'title' => 'Nepilnīgs albums',
                'photos' => [[
                    'title' => 'Pirmais foto',
                    'image' => UploadedFile::fake()->image('first.png', 200, 200),
                ], [
                    'title' => 'Otrais foto',
                    'image' => UploadedFile::fake()->image('second.png', 200, 200),
                ]],
            ]);

        $response->assertStatus(500);
        $this->assertDatabaseCount('albums', 0);
        $this->assertDatabaseCount('album_photos', 0);
        $this->assertSame([], Storage::disk('private')->allFiles('albums'));
    }

    public function test_previous_album_photo_is_not_deleted_if_the_database_update_fails(): void
    {
        Storage::fake('private');

        $user = User::factory()->create(['is_approved' => true]);
        $album = Album::create([
            'user_id' => $user->id,
            'title' => 'Vecais albums',
            'description' => 'Pārbaude',
            'is_public' => false,
        ]);

        $previousPath = 'albums/'.$album->id.'/old-photo.jpg';
        Storage::disk('private')->put($previousPath, 'old-content');

        $photo = AlbumPhoto::create([
            'album_id' => $album->id,
            'title' => 'Vecais foto',
            'image_path' => $previousPath,
            'reactions' => [],
            'likes_count' => 0,
        ]);

        AlbumPhoto::saving(function () {
            throw new \RuntimeException('Database save failed');
        });

        $response = $this->actingAs($user)
            ->putJson('/api/albums/'.$album->id.'/photos/'.$photo->id, [
                'image' => UploadedFile::fake()->image('new-photo.jpg', 200, 200),
            ]);

        $response->assertStatus(500);

        $this->assertTrue(Storage::disk('private')->exists($previousPath));
    }

    public function test_previous_avatar_is_not_deleted_if_profile_save_fails(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'is_approved' => true,
            'avatar_path' => 'avatars/old-avatar.jpg',
        ]);
        $previousAvatarPath = $user->avatar_path;
        Storage::disk('public')->put($previousAvatarPath, 'old-avatar');

        User::saving(function () {
            throw new \RuntimeException('Profile save failed');
        });

        $response = $this->actingAs($user)
            ->postJson('/api/profile/avatar', [
                'avatar' => UploadedFile::fake()->image('new-avatar.jpg', 200, 200),
            ]);

        $response->assertStatus(500);

        $this->assertTrue(Storage::disk('public')->exists($previousAvatarPath));
    }
}