<?php

namespace Database\Seeders;

use App\Models\SpecialDay;
use App\Models\User;
use Illuminate\Database\Seeder;

class SpecialDayDemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::query()->pluck('id', 'email')->toArray();

        $events = [
            [
                'user_email' => 'anna@example.com',
                'title' => 'Ģimenes pikniks mežā',
                'description' => 'Kopīga sēdēšana pie ezera ar grilēšanu, dzērieniem un bērnu rotaļām.',
                'date' => '2026-10-18',
                'event_time' => '15:00',
                'location' => 'Rīgas mežs, Bolderāja',
                'repeats' => false,
                'is_public' => true,
                'shared_with_user_ids' => ['janis@example.com', 'liga@example.com'],
            ],
            [
                'user_email' => 'janis@example.com',
                'title' => 'Dzimšanas dienas vakars',
                'description' => 'Vakariņas ar draugiem, mūziku un torti. Viesi aicināti no pulksten 19:00.',
                'date' => '2026-10-24',
                'event_time' => '19:30',
                'location' => 'Rīga, Vecrīga',
                'repeats' => false,
                'is_public' => true,
                'shared_with_user_ids' => ['anna@example.com', 'liga@example.com'],
            ],
            [
                'user_email' => 'liga@example.com',
                'title' => 'Mājas svētki',
                'description' => 'Kopīga vakariņu ballīte ar gaismu, saldumiem un spēlēm.',
                'date' => '2026-11-02',
                'event_time' => '18:00',
                'location' => 'Līgas māja, Ķengarags',
                'repeats' => false,
                'is_public' => true,
                'shared_with_user_ids' => ['anna@example.com', 'janis@example.com'],
            ],
            [
                'user_email' => 'martins@example.com',
                'title' => 'Bērnu dzimšanas diena',
                'description' => 'Ziemassvētku klasika, kešatmiņas uzdevumi un saldumu stends.',
                'date' => '2026-12-12',
                'event_time' => '17:00',
                'location' => 'Jurmala, ģimenes villa',
                'repeats' => false,
                'is_public' => true,
                'shared_with_user_ids' => ['anna@example.com', 'liga@example.com'],
            ],
            [
                'user_email' => 'elina@example.com',
                'title' => 'Saulgriežu ballīte',
                'description' => 'Pavasara svinēšana ar ugunskuru, ziediem un muzikālu programmu.',
                'date' => '2027-03-21',
                'event_time' => '20:00',
                'location' => 'Sēlija, lauku māja',
                'repeats' => false,
                'is_public' => true,
                'shared_with_user_ids' => ['anna@example.com', 'martins@example.com'],
            ],
            [
                'user_email' => 'anna@example.com',
                'title' => 'Kopīgā foto sesija',
                'description' => 'Foto sesija ar ģimeni un draugiem dabā. Pēc tam būs kafijas pauze.',
                'date' => '2026-10-30',
                'event_time' => '12:30',
                'location' => 'Rīga, Kronvalda parks',
                'repeats' => false,
                'is_public' => false,
                'shared_with_user_ids' => ['janis@example.com'],
            ],
            [
                'user_email' => 'janis@example.com',
                'title' => 'Sporta diena ar draugiem',
                'description' => 'Kopīga joga, tad pusdienas un brīvlaika aktivitātes.',
                'date' => '2026-11-07',
                'event_time' => '09:00',
                'location' => 'Rīga, Vērmanes dārzs',
                'repeats' => false,
                'is_public' => true,
                'shared_with_user_ids' => [],
            ],
            [
                'user_email' => 'martins@example.com',
                'title' => 'Muzeju diena',
                'description' => 'Ekskursija pa muzejiem un restorāna vakariņas pēc tam.',
                'date' => '2026-10-20',
                'event_time' => '11:00',
                'location' => 'Rīga, Mākslas muzejs',
                'repeats' => false,
                'is_public' => true,
                'shared_with_user_ids' => ['elina@example.com'],
            ],
        ];

        foreach ($events as $event) {
            $userId = $users[$event['user_email']] ?? null;

            if (! $userId) {
                continue;
            }

            $sharedUserIds = collect($event['shared_with_user_ids'] ?? [])
                ->map(fn (string $email) => $users[$email] ?? null)
                ->filter()
                ->map(fn ($id) => (int) $id)
                ->values()
                ->all();

            SpecialDay::query()->updateOrCreate(
                [
                    'user_id' => $userId,
                    'title' => $event['title'],
                    'date' => $event['date'],
                ],
                [
                    'description' => $event['description'],
                    'location' => $event['location'],
                    'event_time' => $event['event_time'],
                    'repeats' => $event['repeats'],
                    'is_public' => $event['is_public'],
                    'shared_with_user_ids' => $sharedUserIds,
                ]
            );
        }
    }
}
