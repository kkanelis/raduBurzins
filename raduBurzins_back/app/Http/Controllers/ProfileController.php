<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $user->fill($validated);

        if ($request->hasFile('avatar')) {
            $this->replaceAvatar($user, $request);
        }

        $user->save();

        return response()->json([
            'message' => 'Profils saglabāts.',
            'user' => $user->fresh(),
        ]);
    }

    // Avatar funkcijas

    public function avatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['nullable', 'image', 'max:2048'],
        ]);

        $user = $request->user();
        if ($request->hasFile('avatar')) {
            $this->replaceAvatar($user, $request);
        }
        $user->save();

        return response()->json([
            'message' => 'Avatar updated successfully.',
            'user' => $user->fresh(),
        ]);
    }

    private function replaceAvatar(User $user, Request $request): void
    {
        $previousPath = $user->avatar_path;
        $newPath = $request->file('avatar')->store('avatars', 'public');

        if (! $newPath) {
            return;
        }

        $user->avatar_path = $newPath;

        if ($previousPath) {
            Storage::disk('public')->delete($previousPath);
        }
    }
}
