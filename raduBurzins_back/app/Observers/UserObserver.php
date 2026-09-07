<?php

namespace App\Observers;

use App\Models\User;
use App\Models\SpecialDay;

class UserObserver
{
    public function created(User $user)
    {
        if ($user->date_of_birth) {
            SpecialDay::create([
                'user_id' => $user->id,
                'title' => $user->name . ' svin dzimšanas dienu!',
                'description' => '',
                'date' => $user->date_of_birth,
                'repeats' => true,
                'is_approved' => true
            ]);
        }
    }

    public function deleted(User $user)
    {
        // Special days will be automatically deleted due to cascade delete
    }
}