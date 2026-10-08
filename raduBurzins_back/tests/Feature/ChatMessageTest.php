<?php

namespace Tests\Feature;

use App\Events\FamilyChatMessageCreated;
use App\Models\FamilyChatMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class ChatMessageTest extends TestCase
{
    use RefreshDatabase;

    public function test_retrying_a_chat_message_does_not_create_a_duplicate(): void
    {
        Event::fake();
        $user = User::factory()->create(['is_approved' => true]);
        $payload = [
            'client_message_id' => 'client-message-1',
            'text' => 'Sveiki!',
        ];

        $firstResponse = $this->actingAs($user)->postJson('/api/chat-messages', $payload)
            ->assertCreated();
        $messageId = $firstResponse->json('message.id');

        $this->postJson('/api/chat-messages', $payload)
            ->assertOk()
            ->assertJsonPath('message.id', $messageId);

        $this->assertDatabaseCount('family_chat_messages', 1);
        Event::assertDispatchedTimes(FamilyChatMessageCreated::class, 1);
    }

    public function test_incremental_fetch_returns_only_new_messages_in_order(): void
    {
        $user = User::factory()->create(['is_approved' => true]);
        $messages = collect(['Pirma', 'Otrā', 'Trešā'])->map(fn ($text) => FamilyChatMessage::create([
            'user_id' => $user->id,
            'text' => $text,
        ]));

        $response = $this->actingAs($user)
            ->getJson('/api/chat-messages?after_id='.$messages[0]->id)
            ->assertOk();

        self::assertSame(
            [$messages[1]->id, $messages[2]->id],
            array_column($response->json(), 'id'),
        );
    }

    public function test_chat_message_without_text_or_photo_is_rejected(): void
    {
        $user = User::factory()->create(['is_approved' => true]);

        $this->actingAs($user)
            ->postJson('/api/chat-messages', ['text' => '   '])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Ziņai vajag tekstu vai attēlu.');

        $this->assertDatabaseCount('family_chat_messages', 0);
    }
}
