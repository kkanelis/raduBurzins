<?php

namespace App\Filament\Resources\ChristmasLotteryResource\Pages;

use App\Filament\Resources\ChristmasLotteryResource;
use App\Models\ChristmasLottery;
use App\Models\User;
use App\Services\ChristmasLotteryAssignmentGenerator;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateChristmasLottery extends CreateRecord
{
    protected static string $resource = ChristmasLotteryResource::class;

    protected function handleRecordCreation(array $data): Model
    {
        $participants = array_values(array_unique(array_map('intval', $data['participants'] ?? [])));
        $year = (int) $data['year'];

        if (ChristmasLottery::query()->where('year', $year)->exists()) {
            throw ValidationException::withMessages([
                'year' => 'Šim gadam loterija jau ir izveidota.',
            ]);
        }

        $approvedCount = User::query()
            ->where('is_approved', true)
            ->whereIn('id', $participants)
            ->count();

        if (count($participants) < 2 || $approvedCount !== count($participants)) {
            throw ValidationException::withMessages([
                'participants' => 'Izvēlies vismaz divus apstiprinātus dalībniekus.',
            ]);
        }

        $previousAssignments = ChristmasLottery::query()
            ->where('year', '<', $year)
            ->whereIn('user_id', $participants)
            ->get(['user_id', 'giving_to_user_id'])
            ->toArray();

        $assignments = app(ChristmasLotteryAssignmentGenerator::class)->generate(
            $participants,
            $year,
            $previousAssignments,
        );

        return DB::transaction(function () use ($assignments, $participants, $year): Model {
            ChristmasLottery::query()->insert($assignments);

            return ChristmasLottery::query()
                ->where('year', $year)
                ->where('user_id', $participants[0])
                ->firstOrFail();
        });
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
