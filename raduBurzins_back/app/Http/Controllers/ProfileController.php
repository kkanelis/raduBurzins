<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'nickname' => 'nullable|string|max:100',
            'phone' => 'nullable|integer|max:8',
            'date_of_birth' => 'nullable|date',
        ]);

        $user->fill($validated);

        if ($request->hasFile('avatar')) {
            $this->replaceAvatar($user, $request);
        }
        
        $user->save();

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Profils saglabāts.',
                'user' => $user->fresh(),
            ]);
        }

        return redirect()->route('profile.edit');
    }

    public function avatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['nullable', 'image', 'max:2048'],
        ]);

        $user = $request->user();
        $this->replaceAvatar($user, $request);
        $user->save();

        return response()->json([
            'message' => 'Avatar updated successfully.',
            'user' => $user->fresh(),
        ]);
    }

    private function replaceAvatar(User $user, Request $request): void
    {
        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $user->avatar_path = $request->file('avatar')->store('avatars', 'public');
    }
}
