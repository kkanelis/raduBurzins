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
    }

    public function updateStatus(Request $request)
    {
        $userId = $request->user()->id;

        return response()->json(["message" => "Status Update"]);
    }

    public function getUsers(Request $request) 
    {
        $users = User::All();

        return $users;
    }
}