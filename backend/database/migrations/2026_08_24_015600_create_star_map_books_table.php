<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('star_map_books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('star_map_id')
                ->unique()
                ->constrained()
                ->cascadeOnDelete();
            $table->string('custom_text', 120)->nullable();
            $table->timestamps();
        });

        Schema::create('star_map_book_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('star_map_book_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('label', 80);
            $table->text('body');
            $table->unsignedTinyInteger('position')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('star_map_book_entries');
        Schema::dropIfExists('star_map_books');
    }
};
