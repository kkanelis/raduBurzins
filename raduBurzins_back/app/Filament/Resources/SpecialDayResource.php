<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SpecialDayResource\Pages;
use App\Filament\Resources\SpecialDayResource\RelationManagers;
use App\Models\SpecialDay;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Filament\Tables\Filters\TernaryFilter;

class SpecialDayResource extends Resource
{
    protected static ?string $model = SpecialDay::class;

    protected static ?string $navigationIcon = 'heroicon-o-calendar';

    protected static ?string $navigationLabel = 'Notikumi';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'first_name', fn ($query) => $query->orderBy('first_name'))
                    ->getOptionLabelFromRecordUsing(fn ($record) => "{$record->first_name} {$record->last_name}")
                    ->required(),
                Forms\Components\TextInput::make('title')
                    ->required(),
                Forms\Components\Textarea::make('description'),
                Forms\Components\DatePicker::make('date')
                    ->required(),
                Forms\Components\Toggle::make('repeats')
                    ->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.first_name')
                    ->formatStateUsing(fn ($record) => "{$record->user->first_name} {$record->user->last_name}")
                    ->label('User'),
                Tables\Columns\TextColumn::make('title'),
                Tables\Columns\TextColumn::make('date')
                    ->date(),
                Tables\Columns\ToggleColumn::make('repeats'),
            ])
            ->filters([
                TernaryFilter::make('repeats'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\DeleteBulkAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSpecialDays::route('/'),
            'create' => Pages\CreateSpecialDay::route('/create'),
            'edit' => Pages\EditSpecialDay::route('/{record}/edit'),
        ];
    }
}
