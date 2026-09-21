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
        'is_public',
        'shared_with_user_ids',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'shared_with_user_ids' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(AlbumPhoto::class);
    }

}
