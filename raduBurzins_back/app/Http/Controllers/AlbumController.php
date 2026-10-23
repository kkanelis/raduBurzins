<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\AlbumPhoto;
use App\Support\SharedUserIdList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AlbumController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->getKey();

        $albums = Album::query()
            ->withCount('photos')
            ->with(['photos' => fn ($query) => $query->latest()->limit(1)])
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->orWhere('is_public', true)
                    ->orWhereJsonContains('shared_with_user_ids', $userId);
            })
            ->latest()
            ->paginate(12);

        $albums->getCollection()->transform(fn (Album $album) => $this->normalizeAlbum($album));

        return response()->json($albums);
    }

    public function show(Request $request, Album $album): JsonResponse
    {
        $this->authorizeAlbum($request, $album);

        return response()->json($this->normalizeAlbumPage($album));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:100',
            'emoji' => 'nullable|string|max:10',
            'is_public' => 'boolean',
            'shared_with_user_ids' => 'nullable|array',
            'shared_with_user_ids.*' => [
                'integer',
                Rule::exists('users', 'id')->where('is_approved', true),
            ],
            'photos' => 'nullable|array',
            'photos.*.title' => 'nullable|string|max:100',
            'photos.*.note' => 'nullable|string|max:255',
            'photos.*.image' => 'required_with:photos|image|max:8192',
        ]);

        $photos = $request->file('photos', []);
        $storedPaths = [];

        try {
            $album = DB::transaction(function () use ($request, $validated, $photos, &$storedPaths) {
                $album = Album::create([
                    'user_id' => $request->user()?->getKey(),
                    'title' => $validated['title'],
                    'description' => $validated['description'] ?? null,
                    'category' => $validated['category'] ?? null,
                    'emoji' => $validated['emoji'] ?? null,
                    'is_public' => $validated['is_public'] ?? true,
                    'shared_with_user_ids' => array_values(array_unique(array_map('intval', $validated['shared_with_user_ids'] ?? []))),
                ]);

                foreach ($photos as $photo => $photoData) {
                    $imagePath = $photoData['image']->store('albums/'.$album->id, 'private');

                    if (! $imagePath) {
                        throw new \RuntimeException('Album photo could not be stored.');
                    }

                    $storedPaths[] = $imagePath;

                    AlbumPhoto::create([
                        'album_id' => $album->id,
                        'title' => $request->input("photos.$photo.title"),
                        'note' => $request->input("photos.$photo.note"),
                        'image_path' => $imagePath,
                        'reactions' => [],
                        'likes_count' => 0,
                    ]);
                }

                return $album;
            });
        } catch (\Throwable $e) {
            foreach ($storedPaths as $storedPath) {
                Storage::disk('private')->delete($storedPath);
            }

            throw $e;
        }

        return response()->json([
            'message' => 'Albums izveidots!',
            'album' => $this->normalizeAlbumPage($album->fresh()),
        ]);
    }

    public function update(Request $request, Album $album): JsonResponse
    {
        $this->authorizeAlbum($request, $album, true);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:100',
            'emoji' => 'nullable|string|max:10',
            'is_public' => 'boolean',
            'shared_with_user_ids' => 'nullable|array',
            'shared_with_user_ids.*' => [
                'integer',
                Rule::exists('users', 'id')->where('is_approved', true),
            ],
        ]);

        if (array_key_exists('shared_with_user_ids', $validated)) {
            $validated['shared_with_user_ids'] = array_values(array_unique(array_map(
                'intval',
                $validated['shared_with_user_ids'] ?? []
            )));
        }

        $album->fill($validated);
        $album->save();

        return response()->json([
            'message' => 'Albums atjaunināts!',
            'album' => $this->normalizeAlbumPage($album->fresh()),
        ]);
    }

    public function destroy(Request $request, Album $album): JsonResponse
    {
        $this->authorizeAlbum($request, $album, true);

        foreach ($album->photos as $photo) {
            if ($photo->image_path) {
                Storage::disk('private')->delete($photo->image_path);
            }
        }

        $album->delete();

        return response()->json([
            'message' => 'Albums izdzēsts veiksmīgi.',
        ]);
    }

    // Photo management

    public function addPhoto(Request $request, Album $album): JsonResponse
    {
        $this->authorizeAlbum($request, $album, true);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'note' => 'nullable|string',
            'image' => 'required|image|max:8192',
        ]);

        $imagePath = $request->file('image')->store('albums/'.$album->id, 'private');

        if (! $imagePath) {
            return response()->json([
                'message' => 'Neizdevās saglabāt jauno foto.',
            ], 500);
        }

        try {
            $photo = AlbumPhoto::create([
                'album_id' => $album->id,
                'title' => $validated['title'],
                'note' => $validated['note'] ?? null,
                'image_path' => $imagePath,
                'reactions' => [],
                'likes_count' => 0,
            ]);
        } catch (\Throwable $e) {
            Storage::disk('private')->delete($imagePath);

            throw $e;
        }

        return response()->json([
            'message' => 'Foto pievienota veiksmīgi.',
            'photo' => $this->normalizePhoto($photo),
            'album' => $this->normalizeAlbumPage($album->fresh()),
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
            $previousPath = $photo->image_path;
            $newPath = $request->file('image')->store('albums/'.$album->id, 'private');

            if (! $newPath) {
                return response()->json([
                    'message' => 'Neizdevās saglabāt jauno foto.',
                ], 500);
            }

            $photo->image_path = $newPath;

            try {
                $photo->fill([
                    'title' => $validated['title'] ?? $photo->title,
                    'note' => array_key_exists('note', $validated) ? $validated['note'] : $photo->note,
                ]);

                $photo->save();
            } catch (\Throwable $e) {
                if ($newPath && Storage::disk('private')->exists($newPath)) {
                    Storage::disk('private')->delete($newPath);
                }

                throw $e;
            }

            if ($previousPath && $previousPath !== $newPath) {
                Storage::disk('private')->delete($previousPath);
            }

            return response()->json([
                'message' => 'Foto atjaunināta veiksmīgi.',
                'photo' => $this->normalizePhoto($photo->fresh()),
                'album' => $this->normalizeAlbumPage($album->fresh()),
            ]);
        }

        $photo->fill([
            'title' => $validated['title'] ?? $photo->title,
            'note' => array_key_exists('note', $validated) ? $validated['note'] : $photo->note,
        ]);

        $photo->save();

        return response()->json([
            'message' => 'Foto atjaunināta veiksmīgi.',
            'photo' => $this->normalizePhoto($photo->fresh()),
            'album' => $this->normalizeAlbumPage($album->fresh()),
        ]);
    }

    private function normalizePhoto(AlbumPhoto $photo): array
    {
        return [
            'id' => $photo->id,
            'title' => $photo->title,
            'note' => $photo->note,
            'image_path' => $photo->image_path ? url('/api/albums/'.$photo->album_id.'/photos/'.$photo->id.'/file') : null,
            'reactions' => $photo->reactions ?? [],
            'likes_count' => $photo->likes_count ?? 0,
            'created_at' => $photo->created_at,
            'updated_at' => $photo->updated_at,
        ];
    }

    public function destroyPhoto(Request $request, Album $album, AlbumPhoto $photo): JsonResponse
    {
        $this->authorizeAlbum($request, $album, true);
        $this->authorizePhotoBelongsToAlbum($photo, $album);

        if ($photo->image_path) {
            Storage::disk('private')->delete($photo->image_path);
        }

        $photo->delete();

        return response()->json([
            'message' => 'Foto izdzēsta veiksmīgi.',
        ]);
    }

    public function photo(Request $request, Album $album, AlbumPhoto $photo)
    {
        $this->authorizeAlbum($request, $album);
        $this->authorizePhotoBelongsToAlbum($photo, $album);

        if (! $photo->image_path || ! Storage::disk('private')->exists($photo->image_path)) {
            abort(404);
        }

        return response()->file(
            Storage::disk('private')->path($photo->image_path),
            ['Content-Type' => Storage::disk('private')->mimeType($photo->image_path)]
        );
    }

    // Photo reactions

    public function reactToPhoto(Request $request, Album $album, AlbumPhoto $photo): JsonResponse
    {
        $this->authorizeAlbum($request, $album);
        $this->authorizePhotoBelongsToAlbum($photo, $album);

        $validated = $request->validate([
            'emoji' => 'required|string|max:16',
        ]);

        $userId = (string) $request->user()?->getKey();
        $updatedPhoto = DB::transaction(function () use ($photo, $userId, $validated) {
            $lockedPhoto = AlbumPhoto::query()
                ->whereKey($photo->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $reactions = $lockedPhoto->reactions ?? [];
            $reactions[$userId] = $validated['emoji'];

            $lockedPhoto->reactions = $reactions;
            $lockedPhoto->likes_count = count($reactions);
            $lockedPhoto->save();

            return $lockedPhoto;
        });

        return response()->json([
            'message' => 'Reakcija saglabāta veiksmīgi.',
            'photo' => $this->normalizePhoto($updatedPhoto->fresh()),
        ]);
    }

    public function removeReaction(Request $request, Album $album, AlbumPhoto $photo): JsonResponse
    {
        $this->authorizeAlbum($request, $album);
        $this->authorizePhotoBelongsToAlbum($photo, $album);

        $userId = (string) $request->user()?->getKey();
        $updatedPhoto = DB::transaction(function () use ($photo, $userId) {
            $lockedPhoto = AlbumPhoto::query()
                ->whereKey($photo->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $reactions = $lockedPhoto->reactions ?? [];
            unset($reactions[$userId]);

            $lockedPhoto->reactions = $reactions;
            $lockedPhoto->likes_count = count($reactions);
            $lockedPhoto->save();

            return $lockedPhoto;
        });

        return response()->json([
            'message' => 'Reakcija noņemta veiksmīgi.',
            'photo' => $this->normalizePhoto($updatedPhoto->fresh()),
        ]);
    }

    // Citas nepieciešamās funkcijas

    private function authorizeAlbum(Request $request, Album $album, bool $ownerOnly = false): void
    {
        $currentUserId = $request->user()?->getKey();

        if ($ownerOnly && (int) $album->user_id !== (int) $currentUserId) {
            abort(403);
        }

        if (! $ownerOnly && ! $album->is_public && (int) $album->user_id !== (int) $currentUserId && ! in_array((int) $currentUserId, SharedUserIdList::normalize($album->shared_with_user_ids), true)) {
            abort(403);
        }
    }

    private function authorizePhotoBelongsToAlbum(AlbumPhoto $photo, Album $album): void
    {
        if ((int) $photo->album_id !== (int) $album->id) {
            abort(404);
        }
    }

    public function normalizeAlbum(Album $album): array
    {
        return [
            'id' => $album->id,
            'name' => $album->title,
            'title' => $album->title,
            'description' => $album->description,
            'category' => $album->category,
            'emoji' => $album->emoji,
            'user_id' => $album->user_id,
            'is_public' => (bool) $album->is_public,
            'shared_with_user_ids' => SharedUserIdList::normalize($album->shared_with_user_ids),
            'created_at' => $album->created_at?->toDateTimeString(),
            'updated_at' => $album->updated_at?->toDateTimeString(),
            'photos_count' => $album->photos_count ?? $album->photos->count(),
            'photos' => $album->photos
                ->map(fn (AlbumPhoto $photo) => $this->normalizeAlbumPhoto($photo))
                ->all(),
        ];
    }

    private function normalizeAlbumPage(Album $album): array
    {
        $photos = $album->photos()
            ->latest()
            ->paginate(24, ['*'], 'photos_page');

        $album->setRelation('photos', $photos->getCollection());
        $album->setAttribute('photos_count', $photos->total());

        $normalizedAlbum = $this->normalizeAlbum($album);
        $normalizedAlbum['photos_pagination'] = [
            'current_page' => $photos->currentPage(),
            'last_page' => $photos->lastPage(),
            'per_page' => $photos->perPage(),
            'total' => $photos->total(),
        ];

        return $normalizedAlbum;
    }

    public function normalizeAlbumPhoto(AlbumPhoto $photo): array
    {
        $imageUrl = $photo->image_path ? url('/api/albums/'.$photo->album_id.'/photos/'.$photo->id.'/file') : null;

        return [
            'id' => $photo->id,
            'album_id' => $photo->album_id,
            'title' => $photo->title,
            'note' => $photo->note,
            'image_path' => $imageUrl,
            'reactions' => $photo->reactions ?? [],
            'likes_count' => (int) ($photo->likes_count ?? 0),
        ];
    }
}
