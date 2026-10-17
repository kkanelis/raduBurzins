<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SpecialDayCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_event_is_saved_to_the_database(): void
    {
        $user = User::factory()->create(['is_approved' => true]);

        $response = $this->actingAs($user)
            ->postJson('/api/special-days', [
                'title' => 'Ģimenes vakars',
                'date' => now()->addWeek()->toDateString(),
                'is_public' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('special_day.title', 'Ģimenes vakars');

        $this->assertDatabaseHas('special_days', [
            'id' => $response->json('special_day.id'),
            'user_id' => $user->id,
            'title' => 'Ģimenes vakars',
        ]);
    }
}