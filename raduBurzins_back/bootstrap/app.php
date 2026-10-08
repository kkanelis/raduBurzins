<?php

use App\Http\Middleware\EnsureUserIsApproved;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Broadcast;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        health: '/up',
        then: function (): void {
            Broadcast::routes(['middleware' => ['auth:sanctum', EnsureUserIsApproved::class]]);
            require base_path('routes/channels.php');
        },
    )
    ->withCommands([
        App\Console\Commands\ServeWithMigrations::class,
    ])
    ->withMiddleware(function (Middleware $middleware): void {})
    ->withExceptions(function (Exceptions $exceptions): void {})
    ->create();
