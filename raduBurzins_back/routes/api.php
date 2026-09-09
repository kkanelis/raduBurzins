<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\SpecialDayController;
use App\Http\Controllers\ChatMessageController;
use App\Http\Controllers\ChristmasLotteryController;
use App\Http\Controllers\UserStatusController;
use App\Http\Controllers\NamedaysController;
use App\Http\Controllers\SurnamedaysController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AlbumController;

Route::post('/register', [RegisteredUserController::class, 'store']);
Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // AUTH routes

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'avatar']);

    // Calendar days, namedays, surnames, special days routes
    Route::get('/namedays', [NamedaysController::class, 'index']);
    Route::get('/surnames', [SurnamedaysController::class, 'index']);

    Route::get('/special-days', [SpecialDayController::class, 'index']);
    Route::post('/special-days', [SpecialDayController::class, 'store']);
    Route::get('/user/special-days', [SpecialDayController::class, 'userSpecialDays']);
    Route::put('/special-days/{specialDay}', [SpecialDayController::class, 'update']);
    Route::delete('/special-days/{specialDay}', [SpecialDayController::class, 'destroy']);

    // User routes
    Route::get('/users', [UserStatusController::class, 'getUsers']);
    Route::get('/users/status', [UserStatusController::class, 'index']);
    Route::post('/users/status', [UserStatusController::class, 'updateStatus']);

    // Album routes
    Route::get('/albums', [AlbumController::class, 'index']);
    Route::post('/albums', [AlbumController::class, 'store']);
    Route::get('/albums/{album}', [AlbumController::class, 'show']);
    Route::put('/albums/{album}', [AlbumController::class, 'update']);
    Route::post('/albums/{album}/photos', [AlbumController::class, 'addPhoto']);
    Route::put('/albums/{album}/photos/{photo}', [AlbumController::class, 'updatePhoto']);
    Route::post('/albums/{album}/photos/{photo}/react', [AlbumController::class, 'reactToPhoto']);
    Route::delete('/albums/{album}/photos/{photo}/react', [AlbumController::class, 'removeReaction']);
    Route::delete('/albums/{album}/photos/{photo}', [AlbumController::class, 'destroyPhoto']);
    Route::delete('/albums/{album}', [AlbumController::class, 'destroy']);

    // Christmas lottery routes
    Route::get('/christmas-lottery', [ChristmasLotteryController::class, 'index']);
});
