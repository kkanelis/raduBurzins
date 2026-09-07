<?php

namespace App\Filament\Resources\SpecialDayResource\Pages;

use App\Filament\Resources\SpecialDayResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditSpecialDay extends EditRecord
{
    protected static string $resource = SpecialDayResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
