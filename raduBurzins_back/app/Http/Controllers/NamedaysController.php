<?php

namespace App\Http\Controllers;

use App\Models\Nameday;

class NamedaysController extends Controller
{
    public function index()
    {
        return Nameday::all();
    }
}
