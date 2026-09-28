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
        'is_public',
        'shared_with_user_ids',
    ];

    protected $casts = [
        'date' => 'date',
        'repeats' => 'boolean',
        'is_public' => 'boolean',
        'shared_with_user_ids' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
