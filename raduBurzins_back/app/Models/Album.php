<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Album extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'category',
        'emoji',
        'cover_path',
        'is_public',
        'shared_with_user_ids',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'shared_with_user_ids' => 'array',
    ];

    protected $appends = [
        'cover_url',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(AlbumPhoto::class);
    }

    public function getCoverUrlAttribute(): ?string
    {
        return $this->cover_path ? asset('storage/' . $this->cover_path) : null;
    }
}
