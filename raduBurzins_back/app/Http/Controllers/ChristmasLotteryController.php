<?php

namespace App\Http\Controllers;

use App\Models\ChristmasLottery;
use Illuminate\Http\JsonResponse;

class ChristmasLotteryController extends Controller
{
    public function index(): JsonResponse
    {
        $year = now()->year;
        $lotteryAssignments = ChristmasLottery::with(['user:id,first_name,last_name', 'givingToUser:id,first_name,last_name'])
            ->where('year', $year)
            ->get()
            ->map(fn (ChristmasLottery $assignment) => [
                'id' => $assignment->id,
                'giver' => [
                    'id' => $assignment->user->id,
                    'name' => $assignment->user->full_name,
                ],
                'recipient' => [
                    'id' => $assignment->givingToUser->id,
                    'name' => $assignment->givingToUser->full_name,
                ],
                'year' => $assignment->year,
            ]);

        return response()->json([
            'status' => 'success',
            'year' => $year,
            'assignments' => $lotteryAssignments
        ]);
    }
}