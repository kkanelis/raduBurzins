<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class UserStatusController extends Controller
{
    public function index(Request $request)
    {
        $users = User::where('is_approved', true)
            ->select('id', 'first_name', 'last_name', 'date_of_birth', 'is_admin')
            ->get();

        $currentUserId = $request->user()?->id;
        $online = [];
        $offline = [];

        foreach ($users as $user) {
            $cacheKey = 'user-online-' . $user->id;
            $lastSeenKey = $cacheKey . '-last-seen';
            

            $lastSeen = Cache::get($lastSeenKey);
            
            // If user has activity in the last 2 minutes, they're online
            $isOnline = $lastSeen && Carbon::parse($lastSeen)->diffInMinutes(now()) < 2;

            // Force current user to be shown as online
            if ($currentUserId === $user->id) {
                $isOnline = true;
                $this->updateStatus($request);
            }

            $userData = [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'date_of_birth' => $user->date_of_birth,
                'is_admin' => $user->is_admin,
            ];

            if ($isOnline) {
                $online[] = $userData;
            } else {
                $userData['last_seen'] = $lastSeen ?? Carbon::now()->subMinutes(5)->toDateTimeString();
                $offline[] = $userData;
            }
        }

        return response()->json([
            'online' => $online,
            'offline' => $offline
        ]);
    }

    public function updateStatus(Request $request)
    {
        $userId = $request->user()->id;
        $cacheKey = 'user-online-' . $userId;
        $lastSeenKey = $cacheKey . '-last-seen';
        
        $now = Carbon::now();
        
        // Update last seen time
        Cache::put($lastSeenKey, $now->toDateTimeString(), $now->addDays(1));
        
        // Cache the user's online status
        Cache::put($cacheKey, true, $now->addMinutes(2));

        return response()->json(['message' => 'Status updated']);
    }
}