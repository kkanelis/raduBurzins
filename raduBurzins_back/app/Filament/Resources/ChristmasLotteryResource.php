<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ChristmasLotteryResource\Pages;
use App\Models\ChristmasLottery;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Collection;

class ChristmasLotteryResource extends Resource
{
    protected static ?string $model = ChristmasLottery::class;

    protected static ?string $navigationIcon = 'heroicon-o-gift';

    protected static ?string $navigationLabel = 'Ziemassvētku Loterija';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('year')
                    ->options(fn () => [
                        date('Y') => date('Y'),
                        date('Y') + 1 => date('Y') + 1,
                    ])
                    ->required(),
                Forms\Components\Select::make('participants')
                    ->multiple()
                    ->options(fn () => User::where('is_approved', true)
                        ->get()
                        ->mapWithKeys(fn ($user) => [$user->id => $user->full_name]))
                    ->required()
                    ->label('Select Participants'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Dāvinātājs')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('year')
                    ->label('Gads')
                    ->sortable(),
            ])
            ->filters([
                //
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListChristmasLottery::route('/'),
            'create' => Pages\CreateChristmasLottery::route('/create'),
        ];
    }
}