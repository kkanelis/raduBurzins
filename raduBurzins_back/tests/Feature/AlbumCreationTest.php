<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}