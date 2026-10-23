<?php

namespace Tests\Feature;

use App\Events\FamilyChatMessageCreated;
use App\Models\FamilyChatMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FamilyChatMessageCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_sent_chat_message_is_saved_to_the_database(): void
    {
        Event::fake([FamilyChatMessageCreated::class]);
        $user = User::factory()->create(['is_approved' => true]);

        $response = $this->actingAs($user)
            ->postJson('/api/chat-messages', ['text' => 'Sveiki, ģimene!'])
            ->assertCreated()
            ->assertJsonPath('message.text', 'Sveiki, ģimene!');

        $this->assertDatabaseHas('family_chat_messages', [
            'id' => $response->json('message.id'),
            'user_id' => $user->id,
            'text' => 'Sveiki, ģimene!',
        ]);
    }

    public function test_chat_photo_is_stored_on_the_private_disk(): void
    {
        Storage::fake('private');
        Storage::fake('public');

        Event::fake([FamilyChatMessageCreated::class]);
        $user = User::factory()->create(['is_approved' => true]);

        $response = $this->actingAs($user)
            ->postJson('/api/chat-messages', [
                'text' => 'Attēls',
                'photo' => UploadedFile::fake()->image('chat.png', 200, 200),
                'photo_name' => 'chat.png',
            ])
            ->assertCreated();

        $photoUrl = $response->json('message.photo');
        $message = FamilyChatMessage::find($response->json('message.id'));

        $this->assertNotNull($photoUrl);
        $this->assertStringNotContainsString('/storage/', $photoUrl);
        $this->assertStringContainsString('chat', $photoUrl);
        $this->assertNotNull($message?->photo_path);
        $this->assertTrue(Storage::disk('private')->exists($message->photo_path));
    }

    public function test_another_approved_chat_member_can_view_a_chat_photo(): void
    {
        Storage::fake('private');

        $owner = User::factory()->create(['is_approved' => true]);
        $viewer = User::factory()->create(['is_approved' => true]);
        $photoPath = UploadedFile::fake()->image('chat.png', 200, 200)->store('family-chat', 'private');

        $message = FamilyChatMessage::create([
            'user_id' => $owner->id,
            'client_message_id' => 'shared-chat-photo',
            'text' => 'Attēls ģimenei',
            'photo_path' => $photoPath,
            'photo_name' => 'chat.png',
        ]);

        $this->actingAs($viewer)
            ->get('/api/chat-messages/'.$message->id.'/photo')
            ->assertOk();
    }

    public function test_duplicate_client_message_id_conflict_returns_existing_message_and_cleans_photo(): void
    {
        Storage::fake('private');
        Event::fake([FamilyChatMessageCreated::class]);

        $user = User::factory()->create(['is_approved' => true]);
        $insertedConcurrentMessage = false;

        FamilyChatMessage::creating(function () use ($user, &$insertedConcurrentMessage) {
            if ($insertedConcurrentMessage) {
                return;
            }

            $insertedConcurrentMessage = true;

            DB::table('family_chat_messages')->insert([
                'user_id' => $user->id,
                'client_message_id' => 'client-race-1',
                'text' => 'Uzvarējis paralēlais pieprasījums',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        $response = $this->actingAs($user)
            ->postJson('/api/chat-messages', [
                'client_message_id' => 'client-race-1',
                'text' => 'Vēl viens ziņojums',
                'photo' => UploadedFile::fake()->image('chat.png', 200, 200),
            ])
            ->assertOk()
            ->assertJsonPath('message.text', 'Uzvarējis paralēlais pieprasījums');

        $this->assertDatabaseCount('family_chat_messages', 1);
        $this->assertSame([], Storage::disk('private')->allFiles('family-chat'));
        Event::assertNotDispatched(FamilyChatMessageCreated::class);
    }
}