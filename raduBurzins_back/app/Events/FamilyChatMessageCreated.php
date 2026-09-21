<?php

namespace App\Events;

use App\Models\FamilyChatMessage;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FamilyChatMessageCreated implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(public FamilyChatMessage $message)
    {
        $this->message->loadMissing('user:id,first_name,last_name');
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('family-chat')];
    }

    public function broadcastAs(): string
    {
        return 'message.created';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'fromUserId' => $this->message->user_id,
            'fromName' => trim(($this->message->user?->first_name ?? '') . ' ' . ($this->message->user?->last_name ?? '')) ?: 'Lietotājs',
            'text' => $this->message->text,
            'photo' => $this->message->photo_path ? asset('storage/' . $this->message->photo_path) : null,
            'photoName' => $this->message->photo_name,
            'createdAt' => $this->message->created_at?->toISOString(),
        ];
    }
}
