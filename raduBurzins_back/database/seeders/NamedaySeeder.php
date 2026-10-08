<?php

namespace Database\Seeders;

use App\Models\Nameday;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class NamedaySeeder extends Seeder
{
    public function run(): void
    {
        $json = File::get(database_path('seeders/Nameday.json'));
        $namedays = json_decode($json, true);

        foreach ($namedays as $date => $names) {
            Nameday::create([
                'date' => $date,
                'surnames' => $names,
            ]);
        }
    }
}
