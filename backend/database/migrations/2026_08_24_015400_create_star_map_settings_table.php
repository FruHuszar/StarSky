<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('star_map_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('star_map_id')
                ->unique()
                ->constrained()
                ->cascadeOnDelete();

            $table->boolean('show_constellations')->default(true);
            $table->boolean('show_constellation_names')->default(false);
            $table->boolean('show_star_names')->default(false);
            $table->boolean('show_planets')->default(true);
            $table->boolean('show_sun')->default(true);
            $table->boolean('show_moon')->default(true);
            $table->boolean('show_milky_way')->default(true);
            $table->boolean('show_ecliptic')->default(false);
            $table->boolean('show_grid')->default(false);
            $table->boolean('show_circumpolar')->default(false);
            $table->boolean('show_cardinals')->default(true);

            $table->decimal('magnitude_limit', 3, 1)->default(5.2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('star_map_settings');
    }
};
