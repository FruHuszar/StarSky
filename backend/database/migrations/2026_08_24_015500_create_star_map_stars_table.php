<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('star_map_stars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('star_map_id')->constrained()->cascadeOnDelete();
            $table->string('name', 60);
            $table->unsignedTinyInteger('position')->default(0);
            $table->timestamps();

            $table->unique(['star_map_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('star_map_stars');
    }
};
