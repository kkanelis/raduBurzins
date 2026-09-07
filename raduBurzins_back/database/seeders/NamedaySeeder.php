<?php

namespace Database\Seeders;

use App\Models\Nameday;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;

class NamedaySeeder extends Seeder
{
    public function run(): void
    {
        $namedays = Http::get("https://gist.githubusercontent.com/laacz/5cccb056a533dffb2165/raw/5af9c97ef0b7c0256cbbf393bc45822aeb9ceba9/namedays.json")->json();
        
        foreach ($namedays as $date => $names) {
            Nameday::create([
                'date' => $date,
                'names' => $names,
            ]);
        }
    }
}
