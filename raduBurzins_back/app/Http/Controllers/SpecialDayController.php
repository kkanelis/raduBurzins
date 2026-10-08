<?php

namespace App\Http\Controllers;

use App\Models\SpecialDay;
use App\Support\SharedUserIdList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SpecialDayController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()?->getKey();

        $events = SpecialDay::query()
            ->where(function ($query) use ($userId) {
                $query->where('is_public', true)
                    ->orWhere('user_id', $userId)
                    ->orWhereJsonContains('shared_with_user_ids', (int) $userId);
            })
            ->latest()
            ->get()
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
            'event_time' => 'nullable|date_format:H:i',
            'is_public' => 'boolean',
            'shared_with_user_ids' => 'nullable|array',
            'shared_with_user_ids.*' => [
                'integer',
                Rule::exists('users', 'id')->where('is_approved', true),
            ],
        ]);

        $specialDay = SpecialDay::create([
            'user_id' => $request->user()?->getKey(),
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'date' => $validated['date'],
            'repeats' => $validated['repeats'] ?? false,
            'location' => $validated['location'] ?? null,
            'event_time' => $validated['event_time'] ?? null,
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

    public function update(Request $request, SpecialDay $specialDay): JsonResponse
    {
        $this->authorizeOwnerOrPublic($specialDay, true);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'sometimes|required|date',
            'repeats' => 'boolean',
            'location' => 'nullable|string|max:255',
            'event_time' => 'sometimes|nullable|date_format:H:i',
            'is_public' => 'boolean',
            'shared_with_user_ids' => 'nullable|array',
            'shared_with_user_ids.*' => [
                'integer',
                Rule::exists('users', 'id')->where('is_approved', true),
            ],
        ]);

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

    // citas nepieciešamās funkcijas

    private function normalizeEvent(SpecialDay $specialDay): array
    {
        $data = $specialDay->toArray();
        $data['shared_with_user_ids'] = SharedUserIdList::normalize($specialDay->shared_with_user_ids);

        return $data;
    }

    private function authorizeOwnerOrPublic(SpecialDay $specialDay, bool $ownerOnly = false): void
    {
        $currentUserId = auth()->user()?->getKey();

        if ($ownerOnly && (int) $specialDay->user_id !== (int) $currentUserId) {
            abort(403);
        }

        if (! $ownerOnly && ! $specialDay->is_public && (int) $specialDay->user_id !== (int) $currentUserId && ! in_array((int) $currentUserId, SharedUserIdList::normalize($specialDay->shared_with_user_ids), true)) {
            abort(403);
        }
    }
}
