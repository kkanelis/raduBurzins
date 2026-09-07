<?php

namespace App\Filament\Resources\SpecialDayResource\Pages;

use App\Filament\Resources\SpecialDayResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListSpecialDays extends ListRecords
{
    protected static string $resource = SpecialDayResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
