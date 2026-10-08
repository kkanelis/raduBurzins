<?php

namespace App\Observers;

use App\Models\User;
use Illuminate\Validation\ValidationException;

class UserObserver
{
    public function updating(User $user): void
    {
        $wasApprovedAdmin = (bool) $user->getOriginal('is_admin') && (bool) $user->getOriginal('is_approved');
        $willBeApprovedAdmin = (bool) $user->is_admin && (bool) $user->is_approved;

        if (! $wasApprovedAdmin || $willBeApprovedAdmin) {
            return;
        }

        if ((int) auth()->id() === (int) $user->getKey()) {
            throw ValidationException::withMessages([
                'is_approved' => ['Nevarat noņemt sava administratora konta apstiprinājumu.'],
            ]);
        }

        if ($this->approvedAdminCount() <= 1) {
            throw ValidationException::withMessages([
                'is_approved' => ['Sistēmā jābūt vismaz vienam apstiprinātam administratoram.'],
            ]);
        }
    }

    public function deleting(User $user): void
    {
        if ((int) auth()->id() === (int) $user->getKey()) {
            throw ValidationException::withMessages([
                'user' => ['Nevarat dzēst savu lietotāja kontu no administrācijas paneļa.'],
            ]);
        }

        $persistedUser = $user->newQuery()->find($user->getKey());

        if ($persistedUser?->is_admin && $persistedUser->is_approved && $this->approvedAdminCount() <= 1) {
            throw ValidationException::withMessages([
                'user' => ['Sistēmā jābūt vismaz vienam apstiprinātam administratoram.'],
            ]);
        }
    }

    private function approvedAdminCount(): int
    {
        return User::query()
            ->where('is_admin', true)
            ->where('is_approved', true)
            ->count();
    }
}
