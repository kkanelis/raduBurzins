<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->removeDuplicateDates('namedays');
        $this->removeDuplicateDates('surnamedays');

        Schema::table('namedays', function (Blueprint $table) {
            $table->unique('date', 'namedays_date_unique');
        });

        Schema::table('surnamedays', function (Blueprint $table) {
            $table->unique('date', 'surnamedays_date_unique');
        });
    }

    public function down(): void
    {
        Schema::table('namedays', function (Blueprint $table) {
            $table->dropUnique('namedays_date_unique');
        });

        Schema::table('surnamedays', function (Blueprint $table) {
            $table->dropUnique('surnamedays_date_unique');
        });
    }

    private function removeDuplicateDates(string $tableName): void
    {
        $duplicateDates = DB::table($tableName)
            ->select('date')
            ->groupBy('date')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('date');

        foreach ($duplicateDates as $date) {
            $latestId = DB::table($tableName)
                ->where('date', $date)
                ->max('id');

            DB::table($tableName)
                ->where('date', $date)
                ->where('id', '<', $latestId)
                ->delete();
        }
    }
};