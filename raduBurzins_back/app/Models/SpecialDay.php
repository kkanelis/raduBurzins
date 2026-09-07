<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpecialDay extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'date',
        'repeats',
        'location',
        'event_time',
        'image_path',
        'is_public',
        'shared_with_user_ids',
    ];

    protected $casts = [
        'date' => 'date',
        'repeats' => 'boolean',
        'is_public' => 'boolean',
        'shared_with_user_ids' => 'array',
    ];

    protected $appends = [
        'image_url',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path ? asset('storage/' . $this->image_path) : null;
    }
}
