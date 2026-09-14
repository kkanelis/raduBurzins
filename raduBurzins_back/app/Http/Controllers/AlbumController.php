<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\AlbumPhoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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

    public function store(Request $request): JsonResponse {
        $validated = $request->validate([
            "title" => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:100',
            'emoji' => 'nullable|string|max:10',
            'is_public' => 'boolean',
            'shared_with_user_ids' => 'nullable|array',
            'photos' => 'nullable|array',
            'photos.*.title' => 'nullable|string|max:100',
            'photos.*.note' => 'nullable|string|max:255',
            'photos.*.image' => 'required_with:photos|image|max:8192',
            'cover_photo_index' => 'nullable|integer',
        ]);

        $album = Album::create([
            'user_id' => $request->user()?->getKey(),
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'] ?? null,
            'emoji' => $validated['emoji'] ?? null,
            'is_public' => $validated['is_public'] ?? true,
            'shared_with_user_ids' => array_values(array_unique(array_map( 'intval', $validated['shared_with_users_ids'] ?? [] ))),
        ]);

        $photoPaths = [];
        $photos = $request->file('photos', []);

        foreach ($photos as $photo => $photoData) {
            $imagePath = $photoData['image']->store('albums/' . $album->id, 'public');
            $photo = AlbumPhoto::create([
                'album_id' => $album->id,
                'title' => $request->input("photos.$photo.title"),
                'note' => $request->input("photo.$photo.note"),
                'image_path' => $imagePath,
                'reactions' => [],
                'likes_count',
            ]);

            $photoPaths[] = $photo->image_path;
        }

        if(!empty($photoPaths)) {
            $coverIndex = (int) ($validated['cover_photo_index'] ?? 0);
            $coverPath = $photoPaths[$coverIndex] ?? $photoPaths[0];
            $album->cover_path = $coverPath;
            $album->save();
        }

        return response()->json([
            'message' => 'Albums izveidots!',
            'album' => $this->normalizeAlbum($album->fresh(['photos' => fn($query) => $query->latest()]))
        ]);
    }

    public function update($request, Album $album) {
        
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:100',
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
            'name' => $album->title,
            'title' => $album->title,
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
        $imageUrl = $photo->image_path ? asset('storage/' . $photo->image_path) : null;

        return [
            'id' => $photo->id,
            'album_id' => $photo->album_id,
            'title' => $photo->title,
            'note' => $photo->note,
            'path' => $photo->image_path,
            'url' => $imageUrl,
            'image_url' => $imageUrl,
            'image_path' => $photo->image_path,
            'reactions' => $photo->reactions ?? [],
            'likes_count' => (int) ($photo->likes_count ?? 0),
        ];
    }
}
