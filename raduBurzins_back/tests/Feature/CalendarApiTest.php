<?php

namespace Tests\Feature;

use App\Models\Nameday;
use App\Models\User;
use App\Models\Surnameday;
use Database\Seeders\NamedaySeeder;
use Database\Seeders\SurnamedaySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
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

    public function test_calendar_seeders_can_be_run_repeatedly_without_duplicate_dates(): void
    {
        $namedays = json_decode(File::get(database_path('seeders/Namedays.json')), true);
        $surnamedays = json_decode(File::get(database_path('seeders/Surnameday.json')), true);

        $this->seed(NamedaySeeder::class);
        $this->seed(SurnamedaySeeder::class);
        $this->seed(NamedaySeeder::class);
        $this->seed(SurnamedaySeeder::class);

        $this->assertSame(count($namedays), Nameday::query()->count());
        $this->assertSame(count($surnamedays), Surnameday::query()->count());
        $this->assertSame(count($namedays), Nameday::query()->distinct('date')->count('date'));
        $this->assertSame(count($surnamedays), Surnameday::query()->distinct('date')->count('date'));
    }
}