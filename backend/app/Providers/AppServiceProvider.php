<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
    }

    public function boot(): void
    {
        // Az API sima tömböt ad vissza, nem "data" kulccsal burkolva.
        JsonResource::withoutWrapping();
    }
}
