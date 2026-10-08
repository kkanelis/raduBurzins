<?php

namespace Tests\Feature;

use App\Models\Album;
use App\Models\AlbumPhoto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AlbumPhotoReactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_add_and_remove_a_photo_reaction(): void
    {
        $owner = User::factory()->create(['is_approved' => true]);
        $viewer = User::factory()->create(['is_approved' => true]);
        $album = Album::create([
            'user_id' => $owner->id,
            'title' => 'Ģimenes albums',
            'is_public' => true,
            'shared_with_user_ids' => [],
        ]);
        $photo = AlbumPhoto::create([
            'album_id' => $album->id,
            'title' => 'Kopbilde',
            'image_path' => 'albums/'.$album->id.'/family.jpg',
            'reactions' => [],
            'likes_count' => 0,
        ]);

        $this->actingAs($viewer)
            ->postJson('/api/albums/'.$album->id.'/photos/'.$photo->id.'/react', ['emoji' => '❤️'])
            ->assertOk()
            ->assertJsonPath('photo.reactions.'.$viewer->id, '❤️')
            ->assertJsonPath('photo.likes_count', 1);

        $this->deleteJson('/api/albums/'.$album->id.'/photos/'.$photo->id.'/react')
            ->assertOk()
            ->assertJsonPath('photo.reactions', [])
            ->assertJsonPath('photo.likes_count', 0);

        $this->assertSame([], $photo->fresh()->reactions);
    }
}
