<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $duplicateGroups = DB::table('family_chat_messages')
            ->select('user_id', 'client_message_id')
            ->whereNotNull('client_message_id')
            ->groupBy('user_id', 'client_message_id')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($duplicateGroups as $duplicateGroup) {
            $latestMessageId = DB::table('family_chat_messages')
                ->where('user_id', $duplicateGroup->user_id)
                ->where('client_message_id', $duplicateGroup->client_message_id)
                ->max('id');

            DB::table('family_chat_messages')
                ->where('user_id', $duplicateGroup->user_id)
                ->where('client_message_id', $duplicateGroup->client_message_id)
                ->where('id', '<>', $latestMessageId)
                ->update(['client_message_id' => null]);
        }

        Schema::table('family_chat_messages', function (Blueprint $table) {
            $table->unique(
                ['user_id', 'client_message_id'],
                'family_chat_messages_user_client_message_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::table('family_chat_messages', function (Blueprint $table) {
            $table->dropUnique('family_chat_messages_user_client_message_unique');
        });
    }
};