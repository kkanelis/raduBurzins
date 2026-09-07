<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\TernaryFilter;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $navigationLabel = 'Lietotāji';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('first_name')
                    ->required()
                    ->label('Vārds'),
                Forms\Components\TextInput::make('last_name')
                    ->required()
                    ->label('Uzvārds'),
                Forms\Components\TextInput::make('nickname')
                    ->label('Iesauka'),
                Forms\Components\TextInput::make('phone')
                    ->tel()
                    ->label('Telefons'),
                Forms\Components\DatePicker::make('date_of_birth')
                    ->required()
                    ->maxDate(now())
                    ->label('Dzimšanas diena'),
                Forms\Components\TextInput::make('email')
                    ->email()
                    ->label('E-Pasts')
                    ->required(),
                Forms\Components\Toggle::make('is_approved')
                    ->label('Vai ir apstiprināts?')
                    ->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('full_name')
                    ->label('Pilnais vārds')
                    ->getStateUsing(fn (User $record) => $record->full_name)
                    ->searchable(query: function ($query, string $search) {
                        return $query->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('nickname', 'like', "%{$search}%");
                    }),
                TextColumn::make('nickname')
                    ->label('Lietotājvārds')
                    ->searchable(),
                TextColumn::make('date_of_birth')
                    ->label('Dzimšanas datums')
                    ->date(),
                TextColumn::make('phone')
                    ->label('Telefons')
                    ->searchable(),
                TextColumn::make('email')
                    ->label('E-pasts')
                    ->searchable(),
                ToggleColumn::make('is_approved')
                    ->label('Apstiprināts'),
                TextColumn::make('created_at')
                    ->label('Profils izveidots')
                    ->dateTime(),
            ])
            ->filters([
                TernaryFilter::make('is_approved'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\DeleteBulkAction::make(),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
