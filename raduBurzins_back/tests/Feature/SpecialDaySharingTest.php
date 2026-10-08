<?php

namespace Tests\Feature;

use App\Models\SpecialDay;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SpecialDaySharingTest extends TestCase
{
    use RefreshDatabase;

    public function test_private_event_is_visible_only_to_its_owner_and_shared_users(): void
    {
        $owner = User::factory()->create(['is_approved' => true]);
        $sharedUser = User::factory()->create(['is_approved' => true]);
        $otherUser = User::factory()->create(['is_approved' => true]);
        $publicEvent = SpecialDay::create([
            'user_id' => $owner->id,
            'title' => 'Publisks pasākums',
            'date' => now()->addDays(2)->toDateString(),
            'is_public' => true,
            'shared_with_user_ids' => [],
        ]);

        $createResponse = $this->actingAs($owner)
            ->postJson('/api/special-days', [
                'title' => 'Ģimenes vakars',
                'date' => now()->addWeek()->toDateString(),
                'is_public' => false,
                'shared_with_user_ids' => [$sharedUser->id],
            ])
            ->assertCreated();
        $eventId = $createResponse->json('special_day.id');

        $this->actingAs($owner)
            ->getJson('/api/special-days')
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonFragment(['id' => $eventId])
            ->assertJsonFragment(['id' => $publicEvent->id]);

        $this->actingAs($sharedUser)
            ->getJson('/api/special-days')
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonFragment(['id' => $eventId])
            ->assertJsonFragment(['id' => $publicEvent->id]);

        $this->actingAs($otherUser)
            ->getJson('/api/special-days')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['id' => $publicEvent->id])
            ->assertJsonMissing(['id' => $eventId]);
    }
}
