<?php

namespace App\Http\Controllers;

use App\Models\Surnameday;

class SurnamedaysController extends Controller
{
    public function index()
    {
        return Surnameday::all();
    }
}
