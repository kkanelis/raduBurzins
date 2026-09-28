<?php

namespace App\Http\Controllers;

use App\Models\User;

class UserStatusController extends Controller
{
    public function index()
    {
        $users = User::where('is_approved', 1)
            ->select('id', 'first_name', 'last_name', 'date_of_birth', 'is_admin')
            ->get();

        return response()->json([
            'users' => $users,
        ]);
    }

    public function getUsers()
    {
        $users = User::All();

        return $users;
    }
}
