<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('christmas_lottery', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('giving_to_user_id')->constrained('users')->onDelete('cascade');
            $table->year('year');
            $table->timestamps();
            
            // Ensure unique combinations
            $table->unique(['user_id', 'year']);
            $table->unique(['giving_to_user_id', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('christmas_lottery');
    }
};