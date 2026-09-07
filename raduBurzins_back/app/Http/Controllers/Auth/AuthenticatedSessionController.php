<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request)
    {
        $validated = $request->validate([
            "email" => ['required'],
            "password" => ["required"]
        ]);


        if (!Auth::attempt($validated)) {
            throw ValidationException::withMessages([
                "email" => "Parole vai epasts nav pareizs",
                "password" => "Parole vai epasts nav pareizs",
              ]);
        }
    
        $user = Auth::user();
    
        if (!$user->is_approved) {
            Auth::logout();
            throw ValidationException::withMessages([
                'email' => ['Tavs lietotāja konts vēl nav apstiprināts.'],
            ]);
        }


        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Esi piereģistrējies veiksmīgi',
            'user' => $user,
            'token' => $token
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Esi izreģistrējies veiksmīgi'
        ]);
    }
}
