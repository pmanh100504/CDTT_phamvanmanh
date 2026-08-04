<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        try {
            if (config('database.default') === 'sqlite') {
                \Illuminate\Support\Facades\DB::connection()->getPdo()->sqliteCreateFunction('lower_utf8', 'mb_strtolower', 1);
            }
        } catch (\Exception $e) {
            // Ignore if no connection
        }

        \Illuminate\Support\Facades\Event::listen(
            \Illuminate\Database\Events\ConnectionEstablished::class,
            function ($event) {
                $connection = $event->connection;
                if ($connection instanceof \Illuminate\Database\SQLiteConnection) {
                    $connection->getPdo()->sqliteCreateFunction('lower_utf8', 'mb_strtolower', 1);
                }
            }
        );
    }
}
