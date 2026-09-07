<?php

namespace App\Filament\Resources\SpecialDayResource\Pages;

use App\Filament\Resources\SpecialDayResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateSpecialDay extends CreateRecord
{
    protected static string $resource = SpecialDayResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['user_id'] = auth()->id();
        return $data;
    }
}
