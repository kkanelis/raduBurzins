<?php

namespace App\Observers;

use App\Models\SpecialDay;
use App\Models\User;

class UserObserver
{
    public function created(User $user)
    {
        if ($user->date_of_birth) {
            SpecialDay::create([
                'user_id' => $user->id,
                'title' => $user->name.' svin dzimšanas dienu!',
                'description' => '',
                'date' => $user->date_of_birth,
                'repeats' => true,
                'is_approved' => true,
            ]);
        }
    }
}
