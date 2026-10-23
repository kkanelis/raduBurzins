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

        $previousAvatarPath = $user->avatar_path;

        $user->fill($validated);

        if ($request->hasFile('avatar')) {
            $newPath = $this->replaceAvatar($user, $request);

            try {
                $user->save();
            } catch (\Throwable $e) {
                if ($newPath && Storage::disk('public')->exists($newPath)) {
                    Storage::disk('public')->delete($newPath);
                }

                throw $e;
            }

            if ($previousAvatarPath && $previousAvatarPath !== $newPath) {
                Storage::disk('public')->delete($previousAvatarPath);
            }

            return response()->json([
                'message' => 'Profils saglabāts.',
                'user' => $user->fresh(),
            ]);
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
        $previousAvatarPath = $user->avatar_path;

        if ($request->hasFile('avatar')) {
            $newPath = $this->replaceAvatar($user, $request);

            try {
                $user->save();
            } catch (\Throwable $e) {
                if ($newPath && Storage::disk('public')->exists($newPath)) {
                    Storage::disk('public')->delete($newPath);
                }

                throw $e;
            }

            if ($previousAvatarPath && $previousAvatarPath !== $newPath) {
                Storage::disk('public')->delete($previousAvatarPath);
            }

            return response()->json([
                'message' => 'Avatar updated successfully.',
                'user' => $user->fresh(),
            ]);
        }
        $user->save();

        return response()->json([
            'message' => 'Avatar updated successfully.',
            'user' => $user->fresh(),
        ]);
    }

    private function replaceAvatar(User $user, Request $request): string
    {
        $newPath = $request->file('avatar')->store('avatars', 'public');

        if (! $newPath) {
            throw new \RuntimeException('Avatar file could not be stored.');
        }

        $user->avatar_path = $newPath;

        return $newPath;
    }
}
