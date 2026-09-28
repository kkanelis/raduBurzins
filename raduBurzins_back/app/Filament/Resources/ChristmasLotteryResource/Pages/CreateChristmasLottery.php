<?php

namespace App\Filament\Resources\ChristmasLotteryResource\Pages;

use App\Filament\Resources\ChristmasLotteryResource;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use App\Models\ChristmasLottery;

class CreateChristmasLottery extends CreateRecord
{
    protected static string $resource = ChristmasLotteryResource::class;

    protected function handleRecordCreation(array $data): Model
    {
        $participants = collect($data['participants']);
        $year = $data['year'];

        $assignments = $this->createGiftAssignments($participants, $year);
        ChristmasLottery::insert($assignments->toArray());

        return ChristmasLottery::where('year', $year)->first();
    }

    protected function createGiftAssignments(Collection $participants, $year): Collection
    {
        $assignments = collect();
        $available_recipients = $participants->toArray();

        foreach ($participants as $giver) {
            $potential_recipients = array_values(array_filter($available_recipients, function ($recipient) use ($giver) {
                return $recipient !== $giver;
            }));

            if (empty($potential_recipients)) {
                $lastAssignment = $assignments->pop();
                $assignments->push([
                    'user_id' => $lastAssignment['user_id'],
                    'giving_to_user_id' => $giver,
                    'year' => $year,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $assignments->push([
                    'user_id' => $giver,
                    'giving_to_user_id' => $lastAssignment['giving_to_user_id'],
                    'year' => $year,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                continue;
            }

            $recipient_index = array_rand($potential_recipients);
            $recipient = $potential_recipients[$recipient_index];

            $available_recipients = array_values(array_filter($available_recipients, function ($r) use ($recipient) {
                return $r !== $recipient;
            }));

            $assignments->push([
                'user_id' => $giver,
                'giving_to_user_id' => $recipient,
                'year' => $year,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return $assignments;
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
