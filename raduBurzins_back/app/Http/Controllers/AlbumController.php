<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\AlbumPhoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Psy\Util\Json;

class AlbumController extends Controller
{
    public function index() {
        
        $albums = Album::query()
            ->with(['photos' => fn ($query) => $query->latest()])
            ->where('user_id', request()->user()?->getKey())
            ->latest()
            ->get()
            ->map(fn (Album $album) => $this->normalizeAlbum($album));

        return response()->json($albums);
    }

    public function show(Request $request, Album $album) : JsonResponse {
        $this->authorizeAlbum($request, $album);

        return response()->json($this->normalizeAlbum($album->load(['photos' => fn ($query) => $query->latest()])));
    }

    public function update($request, Album $album) {
        
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|required|max:50',
            'emoji' => 'nullable|string|max:10',
            'is_public' => 'boolean',
            'shared_with_users_ids' => 'nullable|array',
        ]);

        if (array_key_exists('shared_with_user_ids', $validated)) {
            $album->shared_with_user_ids = array_values(array_unique(array_map(
                'intval',
                $validated['shared_with_user_ids'] ?? []
            )));
        }

        $album->save();

        return response()->json([
            'message' => 'Albums atjaunināts!',
            'album' => $this->normalizeAlbum($album->fresh(['photos' => fn ($query) => $query->latest()])),
        ]);
    }

    private function authorizeAlbum(Request $request, Album $album): void
    {
        if ($album->user_id !== $request->user()?->getKey()) {
            abort(403);
        }
    }

    public function normalizeAlbum(Album $album): array
    {
        return [
            'id' => $album->id,
            'name' => $album->name,
            'description' => $album->description,
            'user_id' => $album->user_id,
            'created_at' => $album->created_at?->toDateTimeString(),
            'updated_at' => $album->updated_at?->toDateTimeString(),
            'photos' => $album->photos
                ->map(fn (AlbumPhoto $photo) => $this->normalizeAlbumPhoto($photo))
                ->all(),
        ];
    }

    public function normalizeAlbumPhoto(AlbumPhoto $photo): array
    {
        return [
            'id' => $photo->id,
            'album_id' => $photo->album_id,
            'path' => $photo->path,
            'url' => $photo->path ? asset('storage/' . $photo->path) : null,
        ];
    }
}
