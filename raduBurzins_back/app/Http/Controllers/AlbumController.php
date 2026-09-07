<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\AlbumPhoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AlbumController extends Controller
{
    // public function index(Request $request): JsonResponse
    // {
    //     $albums = Album::query()
    //         ->with(['photos' => fn ($query) => $query->latest()])
    //         ->where('user_id', $request->user()?->getKey())
    //         ->latest()
    //         ->get()
    //         ->map(fn (Album $album) => $this->normalizeAlbum($album));

    //     return response()->json($albums);
    // }

    // public function store(Request $request): JsonResponse
    // {
    //     $validated = $request->validate([
    //         'title' => 'required|string|max:255',
    //         'description' => 'nullable|string',
    //         'category' => 'nullable|string|max:255',
    //         'emoji' => 'nullable|string|max:10',
    //         'is_public' => 'boolean',
    //         'shared_with_user_ids' => 'nullable|array',
    //         'shared_with_user_ids.*' => 'integer',
    //         'photos' => 'nullable|array',
    //         'photos.*.title' => 'required_with:photos|string|max:255',
    //         'photos.*.note' => 'nullable|string',
    //         'photos.*.image' => 'required_with:photos|image|max:8192',
    //         'cover_photo_index' => 'nullable|integer|min:0',
    //     ]);

    //     $album = Album::create([
    //         'user_id' => $request->user()?->getKey(),
    //         'title' => $validated['title'],
    //         'description' => $validated['description'] ?? null,
    //         'category' => $validated['category'] ?? null,
    //         'emoji' => $validated['emoji'] ?? '📷',
    //         'is_public' => $validated['is_public'] ?? true,
    //         'shared_with_user_ids' => array_values(array_unique(array_map(
    //             'intval',
    //             $validated['shared_with_user_ids'] ?? []
    //         ))),
    //     ]);

    //     $photoPaths = [];
    //     $photos = $request->file('photos', []);

    //     foreach ($photos as $index => $photoData) {
    //         $imagePath = $photoData['image']->store('albums/' . $album->id, 'public');
    //         $photo = AlbumPhoto::create([
    //             'album_id' => $album->id,
    //             'title' => $request->input("photos.$index.title"),
    //             'note' => $request->input("photos.$index.note"),
    //             'image_path' => $imagePath,
    //             'reactions' => [],
    //             'likes_count' => 0,
    //         ]);

    //         $photoPaths[] = $photo->image_path;
    //     }

    //     if (! empty($photoPaths)) {
    //         $coverIndex = (int) ($validated['cover_photo_index'] ?? 0);
    //         $coverPath = $photoPaths[$coverIndex] ?? $photoPaths[0];
    //         $album->cover_path = $coverPath;
    //         $album->save();
    //     }

    //     return response()->json([
    //         'message' => 'Albums izveidots veiksmīgi.',
    //         'album' => $this->normalizeAlbum($album->fresh(['photos' => fn ($query) => $query->latest()])),
    //     ], 201);
    // }

    // public function show(Request $request, Album $album): JsonResponse
    // {
    //     $this->authorizeAlbum($request, $album);

    //     return response()->json($this->normalizeAlbum($album->load(['photos' => fn ($query) => $query->latest()])));
    // }

    // public function update(Request $request, Album $album): JsonResponse
    // {
    //     $this->authorizeAlbum($request, $album, true);

    //     $validated = $request->validate([
    //         'title' => 'sometimes|required|string|max:255',
    //         'description' => 'nullable|string',
    //         'category' => 'nullable|string|max:255',
    //         'emoji' => 'nullable|string|max:10',
    //         'is_public' => 'boolean',
    //         'shared_with_user_ids' => 'nullable|array',
    //         'shared_with_user_ids.*' => 'integer',
    //     ]);

    //     $album->fill([
    //         'title' => $validated['title'] ?? $album->title,
    //         'description' => array_key_exists('description', $validated) ? $validated['description'] : $album->description,
    //         'category' => array_key_exists('category', $validated) ? $validated['category'] : $album->category,
    //         'emoji' => array_key_exists('emoji', $validated) ? $validated['emoji'] : $album->emoji,
    //         'is_public' => $validated['is_public'] ?? $album->is_public,
    //     ]);

    //     if (array_key_exists('shared_with_user_ids', $validated)) {
    //         $album->shared_with_user_ids = array_values(array_unique(array_map(
    //             'intval',
    //             $validated['shared_with_user_ids'] ?? []
    //         )));
    //     }

    //     $album->save();

    //     return response()->json([
    //         'message' => 'Albums atjaunināts veiksmīgi.',
    //         'album' => $this->normalizeAlbum($album->fresh(['photos' => fn ($query) => $query->latest()])),
    //     ]);
    // }
}
