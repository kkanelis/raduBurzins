<?php

namespace App\Http\Controllers;

use App\Models\ChristmasLottery;
use Illuminate\Http\Request;

class ChristmasLotteryController extends Controller
{
    public function index()
    {
        $lotteryAssignments = ChristmasLottery::with(['user:id,first_name,last_name', 'givingToUser:id,first_name,last_name'])
            ->where('year', date('Y'))
            ->get()
            ->map(function ($assignment) {
                return [
                    'id' => $assignment->id,
                    'giver' => [
                        'id' => $assignment->user->id,
                        'name' => $assignment->user->first_name . ' ' . $assignment->user->last_name
                    ],
                    'recipient' => [
                        'id' => $assignment->givingToUser->id,
                        'name' => $assignment->givingToUser->first_name . ' ' . $assignment->givingToUser->last_name
                    ],
                    'year' => $assignment->year
                ];
            });

        return response()->json([
            'status' => 'success',
            'year' => date('Y'),
            'assignments' => $lotteryAssignments
        ]);
    }

    // Keep this method for individual user queries
    public function getMyGiftRecipient(Request $request)
    {
        $assignment = ChristmasLottery::where('user_id', auth()->id())
            ->where('year', date('Y'))
            ->with('givingToUser:id,first_name,last_name')
            ->first();

        if (!$assignment) {
            return response()->json([
                'message' => 'Ziemassvētki tasnība, drīz viņi būs ne?'
            ], 404);
        }

        return response()->json([
            'recipient' => [
                'name' => $assignment->givingToUser->first_name . ' ' . $assignment->givingToUser->last_name
            ]
        ]);
    }
}