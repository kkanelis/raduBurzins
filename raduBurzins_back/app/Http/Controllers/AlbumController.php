<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\AlbumPhoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AlbumController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $albums = Album::query()
            ->with(['photos' => fn ($query) => $query->latest()])
            ->where('user_id', $request->user()?->getKey())
            ->latest()
            ->get()
            ->map(fn (Album $album) => $this->normalizeAlbum($album));

        return response()->json($albums);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'emoji' => 'nullable|string|max:10',
            'is_public' => 'boolean',
            'shared_with_user_ids' => 'nullable|array',
            'shared_with_user_ids.*' => 'integer',
            'photos' => 'nullable|array',
            'photos.*.title' => 'required_with:photos|string|max:255',
            'photos.*.note' => 'nullable|string',
            'photos.*.image' => 'required_with:photos|image|max:8192',
            'cover_photo_index' => 'nullable|integer|min:0',
        ]);

        $album = Album::create([
            'user_id' => $request->user()?->getKey(),
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'] ?? null,
            'emoji' => $validated['emoji'] ?? '📷',
            'is_public' => $validated['is_public'] ?? true,
            'shared_with_user_ids' => array_values(array_unique(array_map(
                'intval',
                $validated['shared_with_user_ids'] ?? []
            ))),
        ]);

        $photoPaths = [];
        $photos = $request->file('photos', []);

        foreach ($photos as $index => $photoData) {
            $imagePath = $photoData['image']->store('albums/' . $album->id, 'public');
            $photo = AlbumPhoto::create([
                'album_id' => $album->id,
                'title' => $request->input("photos.$index.title"),
                'note' => $request->input("photos.$index.note"),
                'image_path' => $imagePath,
                'reactions' => [],
                'likes_count' => 0,
            ]);

            $photoPaths[] = $photo->image_path;
        }

        if (! empty($photoPaths)) {
            $coverIndex = (int) ($validated['cover_photo_index'] ?? 0);
            $coverPath = $photoPaths[$coverIndex] ?? $photoPaths[0];
            $album->cover_path = $coverPath;
            $album->save();
        }

        return response()->json([
            'message' => 'Albums izveidots veiksmīgi.',
            'album' => $this->normalizeAlbum($album->fresh(['photos' => fn ($query) => $query->latest()])),
        ], 201);
    }

    public function show(Request $request, Album $album): JsonResponse
    {
        $this->authorizeAlbum($request, $album);

        return response()->json($this->normalizeAlbum($album->load(['photos' => fn ($query) => $query->latest()])));
    }

    public function update(Request $request, Album $album): JsonResponse
    {
        $this->authorizeAlbum($request, $album, true);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'emoji' => 'nullable|string|max:10',
            'is_public' => 'boolean',
            'shared_with_user_ids' => 'nullable|array',
            'shared_with_user_ids.*' => 'integer',
        ]);

        $album->fill([
            'title' => $validated['title'] ?? $album->title,
            'description' => array_key_exists('description', $validated) ? $validated['description'] : $album->description,
            'category' => array_key_exists('category', $validated) ? $validated['category'] : $album->category,
            'emoji' => array_key_exists('emoji', $validated) ? $validated['emoji'] : $album->emoji,
            'is_public' => $validated['is_public'] ?? $album->is_public,
        ]);

        if (array_key_exists('shared_with_user_ids', $validated)) {
            $album->shared_with_user_ids = array_values(array_unique(array_map(
                'intval',
                $validated['shared_with_user_ids'] ?? []
            )));
        }

        $album->save();

        return response()->json([
            'message' => 'Albums atjaunināts veiksmīgi.',
            'album' => $this->normalizeAlbum($album->fresh(['photos' => fn ($query) => $query->latest()])),
        ]);
    }

    public function addPhoto(Request $request, Album $album): JsonResponse
    {
        $this->authorizeAlbum($request, $album, true);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'note' => 'nullable|string',
            'image' => 'required|image|max:8192',
        ]);

        $imagePath = $request->file('image')->store('albums/' . $album->id, 'public');

        $photo = AlbumPhoto::create([
            'album_id' => $album->id,
            'title' => $validated['title'],
            'note' => $validated['note'] ?? null,
            'image_path' => $imagePath,
            'reactions' => [],
            'likes_count' => 0,
        ]);

        if (! $album->cover_path) {
            $album->cover_path = $photo->image_path;
            $album->save();
        }

        return response()->json([
            'message' => 'Foto pievienota veiksmīgi.',
            'photo' => $this->normalizePhoto($photo),
            'album' => $this->normalizeAlbum($album->fresh(['photos' => fn ($query) => $query->latest()])),
        ], 201);
    }

    public function updatePhoto(Request $request, Album $album, AlbumPhoto $photo): JsonResponse
    {
        $this->authorizeAlbum($request, $album, true);
        $this->authorizePhotoBelongsToAlbum($photo, $album);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'note' => 'nullable|string',
            'image' => 'nullable|image|max:8192',
        ]);

        if ($request->hasFile('image')) {
            if ($photo->image_path) {
                Storage::disk('public')->delete($photo->image_path);
            }

            $photo->image_path = $request->file('image')->store('albums/' . $album->id, 'public');
        }

        $photo->fill([
            'title' => $validated['title'] ?? $photo->title,
            'note' => array_key_exists('note', $validated) ? $validated['note'] : $photo->note,
        ]);

        $photo->save();

        return response()->json([
            'message' => 'Foto atjaunināta veiksmīgi.',
            'photo' => $this->normalizePhoto($photo->fresh()),
            'album' => $this->normalizeAlbum($album->fresh(['photos' => fn ($query) => $query->latest()])),
        ]);
    }

    public function reactToPhoto(Request $request, Album $album, AlbumPhoto $photo): JsonResponse
    {
        $this->authorizeAlbum($request, $album);
        $this->authorizePhotoBelongsToAlbum($photo, $album);

        $validated = $request->validate([
            'emoji' => 'required|string|max:16',
        ]);

        $userId = (string) $request->user()?->getKey();
        $reactions = $photo->reactions ?? [];
        $reactions[$userId] = $validated['emoji'];

        $photo->reactions = $reactions;
        $photo->likes_count = count($reactions);
        $photo->save();

        return response()->json([
            'message' => 'Reakcija saglabāta veiksmīgi.',
            'photo' => $this->normalizePhoto($photo->fresh()),
        ]);
    }

    public function removeReaction(Request $request, Album $album, AlbumPhoto $photo): JsonResponse
    {
        $this->authorizeAlbum($request, $album);
        $this->authorizePhotoBelongsToAlbum($photo, $album);

        $userId = (string) $request->user()?->getKey();
        $reactions = $photo->reactions ?? [];

        unset($reactions[$userId]);

        $photo->reactions = $reactions;
        $photo->likes_count = count($reactions);
        $photo->save();

        return response()->json([
            'message' => 'Reakcija noņemta veiksmīgi.',
            'photo' => $this->normalizePhoto($photo->fresh()),
        ]);
    }

    public function destroyPhoto(Request $request, Album $album, AlbumPhoto $photo): JsonResponse
    {
        $this->authorizeAlbum($request, $album, true);
        $this->authorizePhotoBelongsToAlbum($photo, $album);

        if ($photo->image_path) {
            Storage::disk('public')->delete($photo->image_path);
        }

        $photo->delete();

        return response()->json([
            'message' => 'Foto izdzēsta veiksmīgi.',
        ]);
    }

    public function destroy(Request $request, Album $album): JsonResponse
    {
        $this->authorizeAlbum($request, $album, true);

        if ($album->cover_path) {
            Storage::disk('public')->delete($album->cover_path);
        }

        foreach ($album->photos as $photo) {
            if ($photo->image_path) {
                Storage::disk('public')->delete($photo->image_path);
            }
        }

        $album->delete();

        return response()->json([
            'message' => 'Albums izdzēsts veiksmīgi.',
        ]);
    }

    private function normalizeAlbum(Album $album): array
    {
        $album->loadMissing(['photos' => fn ($query) => $query->latest()]);

        return [
            'id' => $album->id,
            'title' => $album->title,
            'description' => $album->description,
            'category' => $album->category,
            'emoji' => $album->emoji,
            'cover_path' => $album->cover_path,
            'cover_url' => $album->cover_url,
            'is_public' => $album->is_public,
            'shared_with_user_ids' => $album->shared_with_user_ids ?? [],
            'created_at' => $album->created_at,
            'updated_at' => $album->updated_at,
            'photos' => $album->photos->map(fn (AlbumPhoto $photo) => $this->normalizePhoto($photo))->values(),
        ];
    }

    private function normalizePhoto(AlbumPhoto $photo): array
    {
        return [
            'id' => $photo->id,
            'title' => $photo->title,
            'note' => $photo->note,
            'image_path' => $photo->image_path,
            'image_url' => $photo->image_url,
            'reactions' => $photo->reactions ?? [],
            'likes_count' => $photo->likes_count ?? 0,
            'created_at' => $photo->created_at,
            'updated_at' => $photo->updated_at,
        ];
    }

    private function authorizeAlbum(Request $request, Album $album, bool $ownerOnly = false): void
    {
        $currentUserId = $request->user()?->getKey();

        if ($ownerOnly && (int) $album->user_id !== (int) $currentUserId) {
            abort(403);
        }

        if (! $ownerOnly && ! $album->is_public && (int) $album->user_id !== (int) $currentUserId && ! in_array((int) $currentUserId, $this->sharedUserIds($album), true)) {
            abort(403);
        }
    }

    private function authorizePhotoBelongsToAlbum(AlbumPhoto $photo, Album $album): void
    {
        if ((int) $photo->album_id !== (int) $album->id) {
            abort(404);
        }
    }

    private function sharedUserIds(Album $album): array
    {
        $value = $album->shared_with_user_ids ?? [];

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? array_values(array_map('intval', $decoded)) : [];
        }

        if (is_array($value)) {
            return array_values(array_map('intval', $value));
        }

        return [];
    }
}
