<?php

namespace Tests\Feature;

use App\Events\FamilyChatMessageCreated;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
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
}