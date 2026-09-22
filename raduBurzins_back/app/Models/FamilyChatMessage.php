<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FamilyChatMessage extends Model
{
    protected $fillable = [
        'user_id',
        'client_message_id',
        'text',
        'photo_path',
        'photo_name',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
