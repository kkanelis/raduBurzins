<?php

namespace Database\Seeders;

use App\Models\Surnameday;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class SurnamedaySeeder extends Seeder
{
    public function run(): void
    {
        $json = File::get(database_path('seeders/Surnameday.json'));
        $surnamedays = json_decode($json, true);
        
        foreach ($surnamedays as $date => $surnames) {
            Surnameday::create([
                'date' => $date,
                'surnames' => $surnames,
            ]);
        }
    }
}
