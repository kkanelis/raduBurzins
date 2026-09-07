<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Surnameday extends Model
{
    protected $table = 'surnamedays';

    protected $fillable = [
        'date',
        'surnames'
    ];

    protected $casts = [
        'surnames' => 'array'
    ];
}
