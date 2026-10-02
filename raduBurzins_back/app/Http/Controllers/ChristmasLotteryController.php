<?php

namespace App\Http\Controllers;

use App\Models\ChristmasLottery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChristmasLotteryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $year = now()->year;
        $lotteryAssignments = ChristmasLottery::with(['user:id,first_name,last_name', 'givingToUser:id,first_name,last_name'])
            ->where('year', $year)
            ->where('user_id', $request->user()->getKey())
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
            'assignments' => $lotteryAssignments,
        ]);
    }
}
