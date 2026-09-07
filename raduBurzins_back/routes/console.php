<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('BIM BAM BOM BOM POW PEW, THE TYPE SHIT YOU WOULD NOT UNDERSTAND');
