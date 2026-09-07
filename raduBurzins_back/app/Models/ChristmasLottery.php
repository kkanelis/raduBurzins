<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChristmasLottery extends Model
{
    protected $table = 'christmas_lottery';

    protected $fillable = [
        'user_id',
        'giving_to_user_id',
        'year'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function givingToUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'giving_to_user_id');
    }
}