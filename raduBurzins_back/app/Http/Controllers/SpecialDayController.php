<?php

namespace App\Http\Controllers;

use App\Models\SpecialDay;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SpecialDayController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()?->getKey();

        $events = SpecialDay::query()
            ->latest()
            ->get()
            ->filter(function (SpecialDay $specialDay) use ($request, $userId) {
                if ($request->boolean('mine')) {
                    return (int) $specialDay->user_id === (int) $userId;
                }

                if ($specialDay->is_public) {
                    return true;
                }

                if ((int) $specialDay->user_id === (int) $userId) {
                    return true;
                }

                return in_array((int) $userId, $this->sharedUserIds($specialDay), true);
            })
            ->values()
            ->map(fn (SpecialDay $specialDay) => $this->normalizeEvent($specialDay));

        return response()->json($events);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'repeats' => 'boolean',
            'location' => 'nullable|string|max:255',
            'event_time' => 'nullable|string|max:50',
            'is_public' => 'boolean',
            'shared_with_user_ids' => 'nullable|array',
            'shared_with_user_ids.*' => 'integer',
            'image' => 'nullable|image|max:4096',
        ]);

        $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('special-days', 'public');
        }

        $specialDay = SpecialDay::create([
            'user_id' => $request->user()?->getKey(),
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'date' => $validated['date'],
            'repeats' => $validated['repeats'] ?? false,
            'location' => $validated['location'] ?? null,
            'event_time' => $validated['event_time'] ?? null,
            'image_path' => $imagePath,
            'is_public' => $validated['is_public'] ?? true,
        ]);

        $specialDay->shared_with_user_ids = array_values(array_unique(array_map(
            'intval',
            $validated['shared_with_user_ids'] ?? []
        )));
        $specialDay->save();

        return response()->json([
            'message' => 'Notikums izveidots veiksmīgi.',
            'special_day' => $this->normalizeEvent($specialDay->fresh()),
        ], 201);
    }

    public function show(SpecialDay $specialDay): JsonResponse
    {
        $this->authorizeOwnerOrPublic($specialDay);

        return response()->json($this->normalizeEvent($specialDay));
    }

    public function update(Request $request, SpecialDay $specialDay): JsonResponse
    {
        $this->authorizeOwnerOrPublic($specialDay, true);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'sometimes|required|date',
            'repeats' => 'boolean',
            'location' => 'nullable|string|max:255',
            'event_time' => 'nullable|string|max:50',
            'is_public' => 'boolean',
            'shared_with_user_ids' => 'nullable|array',
            'shared_with_user_ids.*' => 'integer',
            'image' => 'nullable|image|max:4096',
            'remove_image' => 'nullable|boolean',
        ]);

        if ($request->boolean('remove_image') && $specialDay->image_path) {
            Storage::disk('public')->delete($specialDay->image_path);
            $specialDay->image_path = null;
        }

        if ($request->hasFile('image')) {
            if ($specialDay->image_path) {
                Storage::disk('public')->delete($specialDay->image_path);
            }

            $specialDay->image_path = $request->file('image')->store('special-days', 'public');
        }

        $specialDay->fill([
            'title' => $validated['title'] ?? $specialDay->title,
            'description' => array_key_exists('description', $validated) ? $validated['description'] : $specialDay->description,
            'date' => $validated['date'] ?? $specialDay->date,
            'repeats' => $validated['repeats'] ?? $specialDay->repeats,
            'location' => array_key_exists('location', $validated) ? $validated['location'] : $specialDay->location,
            'event_time' => array_key_exists('event_time', $validated) ? $validated['event_time'] : $specialDay->event_time,
            'is_public' => $validated['is_public'] ?? $specialDay->is_public,
        ]);

        if (array_key_exists('shared_with_user_ids', $validated)) {
            $specialDay->shared_with_user_ids = array_values(array_unique(array_map(
                'intval',
                $validated['shared_with_user_ids'] ?? []
            )));
        }

        $specialDay->save();

        return response()->json([
            'message' => 'Notikums atjaunināts veiksmīgi.',
            'special_day' => $this->normalizeEvent($specialDay->fresh()),
        ]);
    }

    public function destroy(SpecialDay $specialDay): JsonResponse
    {
        $this->authorizeOwnerOrPublic($specialDay, true);

        if ($specialDay->image_path) {
            Storage::disk('public')->delete($specialDay->image_path);
        }

        $specialDay->delete();

        return response()->json([
            'message' => 'Notikums izdzēsts veiksmīgi.',
        ]);
    }

    public function userSpecialDays(Request $request): JsonResponse
    {
        $userId = $request->user()?->getKey();

        $specialDays = SpecialDay::where('user_id', $userId)
            ->latest()
            ->get()
            ->map(fn (SpecialDay $specialDay) => $this->normalizeEvent($specialDay));

        return response()->json($specialDays);
    }

    private function normalizeEvent(SpecialDay $specialDay): array
    {
        $data = $specialDay->toArray();
        $data['shared_with_user_ids'] = $this->sharedUserIds($specialDay);
        $data['image_url'] = $specialDay->image_path ? asset('storage/' . $specialDay->image_path) : null;

        return $data;
    }

    private function sharedUserIds(SpecialDay $specialDay): array
    {
        $value = $specialDay->shared_with_user_ids ?? [];

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? array_values(array_map('intval', $decoded)) : [];
        }

        if (is_array($value)) {
            return array_values(array_map('intval', $value));
        }

        return [];
    }

    private function authorizeOwnerOrPublic(SpecialDay $specialDay, bool $ownerOnly = false): void
    {
        $currentUserId = auth()->user()?->getKey();

        if ($ownerOnly && (int) $specialDay->user_id !== (int) $currentUserId) {
            abort(403);
        }

        if (! $ownerOnly && ! $specialDay->is_public && (int) $specialDay->user_id !== (int) $currentUserId && ! in_array((int) $currentUserId, $this->sharedUserIds($specialDay), true)) {
            abort(403);
        }
    }
}
