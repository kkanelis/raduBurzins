<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('albums', function (Blueprint $table) {
            $table->json('shared_with_user_ids')->nullable()->after('is_public');
        });

        Schema::table('album_photos', function (Blueprint $table) {
            $table->json('reactions')->nullable()->after('note');
            $table->unsignedInteger('likes_count')->default(0)->after('reactions');
        });
    }

    public function down(): void
    {
        Schema::table('album_photos', function (Blueprint $table) {
            $table->dropColumn(['reactions', 'likes_count']);
        });

        Schema::table('albums', function (Blueprint $table) {
            $table->dropColumn('shared_with_user_ids');
        });
    }
};
