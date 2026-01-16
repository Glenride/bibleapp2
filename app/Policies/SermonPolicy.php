<?php

namespace App\Policies;

use App\Models\Sermon;
use App\Models\User;

class SermonPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Sermon $sermon): bool
    {
        if ($user->id === $sermon->user_id) {
            return true;
        }

        if ($sermon->is_public) {
            return true;
        }

        return $sermon->sharedWith->contains('id', $user->id);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Sermon $sermon): bool
    {
        return $user->id === $sermon->user_id;
    }

    public function delete(User $user, Sermon $sermon): bool
    {
        return $user->id === $sermon->user_id;
    }

    public function share(User $user, Sermon $sermon): bool
    {
        return $user->id === $sermon->user_id;
    }
}
