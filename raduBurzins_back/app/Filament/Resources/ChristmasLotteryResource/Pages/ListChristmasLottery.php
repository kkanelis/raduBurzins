<?php

namespace App\Filament\Resources\ChristmasLotteryResource\Pages;

use App\Filament\Resources\ChristmasLotteryResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListChristmasLottery extends ListRecords
{
    protected static string $resource = ChristmasLotteryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}