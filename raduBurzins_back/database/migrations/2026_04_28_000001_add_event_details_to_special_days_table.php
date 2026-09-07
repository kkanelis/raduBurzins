<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('special_days', function (Blueprint $table) {
            $table->string('location')->nullable()->after('description');
            $table->string('event_time')->nullable()->after('date');
            $table->string('image_path')->nullable()->after('event_time');
            $table->boolean('is_public')->default(true)->after('image_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('special_days', function (Blueprint $table) {
            $table->dropColumn(['location', 'event_time', 'image_path', 'is_public']);
        });
    }
};
