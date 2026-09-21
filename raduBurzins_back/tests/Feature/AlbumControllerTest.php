<?php

namespace Tests\Feature;

use App\Models\Album;
use App\Models\User;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AlbumControllerTest extends TestCase
{
    use WithFaker;

    private function makeUser(array $attributes = []): User
    {
        return User::create(array_merge([
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->unique()->numerify('2########'),
            'password' => 'password',
            'is_approved' => true,
            'is_admin' => false,
            'terms' => true,
            'rules' => true,
        ], $attributes));
    }

    public function test_store_saves_shared_users_and_photo_metadata(): void
    {
        Storage::fake('public');
        $owner = $this->makeUser();
        $sharedUser = $this->makeUser();

        $response = $this->actingAs($owner, 'sanctum')->post('/api/albums', [
            'title' => 'Ģimenes pasākums',
            'is_public' => '0',
            'shared_with_user_ids' => [$sharedUser->id],
            'photos' => [[
                'title' => 'Pirmais foto',
                'note' => 'Svarīga piezīme',
                'image' => UploadedFile::fake()->image('photo.jpg'),
            ]],
        ]);

        $response->assertCreated()->assertJsonPath('album.shared_with_user_ids.0', $sharedUser->id);
        $this->assertDatabaseHas('albums', [
            'user_id' => $owner->id,
            'is_public' => 0,
        ]);
        $this->assertDatabaseHas('album_photos', ['title' => 'Pirmais foto', 'note' => 'Svarīga piezīme', 'likes_count' => 0]);
        $this->assertStringStartsWith('http', $response->json('album.photos.0.image_path'));
    }

    public function test_update_persists_all_album_fields_for_owner(): void
    {
        $owner = $this->makeUser();
        $sharedUser = $this->makeUser();
        $album = Album::create([
            'user_id' => $owner->id,
            'title' => 'Vecais nosaukums',
            'is_public' => true,
            'shared_with_user_ids' => [],
        ]);

        $response = $this->actingAs($owner, 'sanctum')->putJson("/api/albums/{$album->id}", [
            'title' => 'Jaunais nosaukums',
            'description' => 'Jauns apraksts',
            'category' => 'Svētki',
            'emoji' => '🎉',
            'is_public' => false,
            'shared_with_user_ids' => [$sharedUser->id],
        ]);

        $response->assertOk()->assertJsonPath('album.title', 'Jaunais nosaukums');
        $this->assertDatabaseHas('albums', [
            'id' => $album->id,
            'title' => 'Jaunais nosaukums',
            'description' => 'Jauns apraksts',
            'category' => 'Svētki',
            'emoji' => '🎉',
            'is_public' => 0,
        ]);
        $this->assertSame([$sharedUser->id], $album->fresh()->shared_with_user_ids);
    }

    public function test_shared_user_can_view_private_album_but_cannot_edit_it(): void
    {
        $owner = $this->makeUser();
        $sharedUser = $this->makeUser();
        $album = Album::create([
            'user_id' => $owner->id,
            'title' => 'Privāts albums',
            'is_public' => false,
            'shared_with_user_ids' => [$sharedUser->id],
        ]);

        $this->actingAs($sharedUser, 'sanctum')->getJson("/api/albums/{$album->id}")->assertOk();
        $this->actingAs($sharedUser, 'sanctum')->putJson("/api/albums/{$album->id}", ['title' => 'Nedrīkst'])->assertForbidden();
    }
}
