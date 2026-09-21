<?php

namespace App\Http\Controllers;

use App\Events\FamilyChatMessageCreated;
use App\Models\FamilyChatMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ChatMessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FamilyChatMessage::query()
            ->with('user:id,first_name,last_name');

        if ($request->filled('after_id')) {
            $query->where('id', '>', (int) $request->integer('after_id'))->orderBy('id');
        } else {
            $query->latest('id')->limit(200);
        }

        $messages = $query->get();

        if (! $request->filled('after_id')) {
            $messages = $messages->sortBy('id')->values();
        }

        Log::info('Family chat messages fetched', [
            'user_id' => $request->user()?->id,
            'after_id' => $request->input('after_id'),
            'count' => $messages->count(),
            'last_id' => $messages->last()?->id,
        ]);

        return response()->json($messages->map(fn (FamilyChatMessage $message) => $this->normalize($message))->values())
            ->header('Cache-Control', 'no-store');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'text' => 'nullable|string|max:255',
            'photo' => 'nullable|image|max:8192',
            'photo_name' => 'nullable|string|max:255',
        ]);

        if (blank($validated['text'] ?? null) && ! $request->hasFile('photo')) {
            return response()->json(['message' => 'Ziņai vajag tekstu vai attēlu.'], 422);
        }

        Log::info('Family chat message received', [
            'user_id' => $request->user()?->id,
            'text_length' => strlen((string) ($validated['text'] ?? '')),
            'has_photo' => $request->hasFile('photo'),
            'photo_name' => $validated['photo_name'] ?? null,
            'photo_size' => $request->file('photo')?->getSize(),
        ]);

        $photoPath = $request->hasFile('photo')
            ? $request->file('photo')->store('family-chat', 'public')
            : null;

        $message = FamilyChatMessage::create([
            'user_id' => $request->user()->id,
            'text' => $validated['text'] ?? null,
            'photo_path' => $photoPath,
            'photo_name' => $validated['photo_name'] ?? null,
        ]);

        Log::info('Family chat message stored', [
            'message_id' => $message->id,
            'user_id' => $message->user_id,
            'has_photo' => (bool) $message->photo_path,
        ]);

        broadcast(new FamilyChatMessageCreated($message));

        return response()->json([
            'message' => $this->normalize($message->load('user:id,first_name,last_name')),
        ], 201);
    }

    private function normalize(FamilyChatMessage $message): array
    {
        return [
            'id' => $message->id,
            'fromUserId' => $message->user_id,
            'fromName' => trim(($message->user?->first_name ?? '') . ' ' . ($message->user?->last_name ?? '')) ?: 'Lietotājs',
            'text' => $message->text,
            'photo' => $message->photo_path ? asset('storage/' . $message->photo_path) : null,
            'photoName' => $message->photo_name,
            'createdAt' => $message->created_at?->toISOString(),
        ];
    }
}
