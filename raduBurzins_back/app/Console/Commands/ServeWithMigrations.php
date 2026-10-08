<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class ServeWithMigrations extends Command
{
    protected $signature = 'serve:migrations
        {--host=127.0.0.1 : The host address to bind to}
        {--port=8000 : The port to bind to}
    ';

    protected $description = 'Run database migrations and start the development server';

    public function handle(): int
    {
        $exitCode = $this->call('migrate');

        if ($exitCode !== self::SUCCESS) {
            return $exitCode;
        }

        $this->info('Starting Laravel development server...');

        $process = new Process([
            PHP_BINARY,
            base_path('artisan'),
            'serve',
            '--host='.$this->option('host'),
            '--port='.$this->option('port'),
        ], base_path());

        $process->start(function (string $type, string $data): void {
            $this->output->write($data);
        });

        return $process->wait();
    }
}
