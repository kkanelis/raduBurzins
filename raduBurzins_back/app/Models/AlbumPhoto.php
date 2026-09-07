<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AlbumPhoto extends Model
{
    protected $fillable = [
        'album_id',
        'title',
        'note',
        'image_path',
        'reactions',
        'likes_count',
    ];

    protected $casts = [
        'reactions' => 'array',
        'likes_count' => 'integer',
    ];

    protected $appends = [
        'image_url',
    ];

    public function album(): BelongsTo
    {
        return $this->belongsTo(Album::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path ? asset('storage/' . $this->image_path) : null;
    }
}
