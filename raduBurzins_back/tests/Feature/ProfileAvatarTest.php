<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileAvatarTest extends TestCase
{
    use RefreshDatabase;

    public function test_avatar_upload_replaces_the_previous_file_and_updates_the_profile(): void
    {
        Storage::fake('public');
        $previousPath = UploadedFile::fake()->image('previous.jpg')->store('avatars', 'public');
        $user = User::factory()->create([
            'is_approved' => true,
            'avatar_path' => $previousPath,
        ]);

        $response = $this->actingAs($user)
            ->post('/api/profile/avatar', [
                'avatar' => UploadedFile::fake()->image('new-avatar.jpg'),
            ])
            ->assertOk();

        $newPath = $response->json('user.avatar_path');

        self::assertNotSame($previousPath, $newPath);
        Storage::disk('public')->assertMissing($previousPath);
        Storage::disk('public')->assertExists($newPath);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'avatar_path' => $newPath,
        ]);
    }

    public function test_avatar_upload_rejects_non_image_files(): void
    {
        Storage::fake('public');
        $user = User::factory()->create(['is_approved' => true]);

        $this->actingAs($user)
            ->postJson('/api/profile/avatar', [
                'avatar' => UploadedFile::fake()->create('notes.txt', 10, 'text/plain'),
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('avatar');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'avatar_path' => null,
        ]);
    }
}
