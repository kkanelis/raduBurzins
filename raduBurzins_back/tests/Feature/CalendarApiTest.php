<?php

namespace Tests\Feature;

use App\Models\Nameday;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CalendarApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_calendar_api_returns_nameday_data(): void
    {
        $user = User::factory()->create(['is_approved' => true]);
        Nameday::create([
            'date' => '10-17',
            'names' => ['Līga', 'Ligita'],
        ]);

        $this->actingAs($user)
            ->getJson('/api/namedays')
            ->assertOk()
            ->assertJsonFragment([
                'date' => '10-17',
                'names' => ['Līga', 'Ligita'],
            ]);
    }
}