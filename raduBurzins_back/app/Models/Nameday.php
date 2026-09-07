<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Nameday extends Model
{
    protected $table = 'namedays';

    protected $fillable = [
        'date',
        'names'
    ];

    protected $casts = [
        'names' => 'array'
    ];
}
