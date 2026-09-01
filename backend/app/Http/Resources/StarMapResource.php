<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StarMapResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'location' => $this->location,
            'date' => $this->date?->format('Y-m-d'),
            'time' => $this->time,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'timezone' => $this->timezone,
            'settings' => array_merge($this->displaySettings()->toPayload(), [
                'favouriteStars' => $this->stars->pluck('name')->all(),
                'customText' => $this->displayBook()->custom_text,
                'bookEntries' => $this->displayBook()->entries
                    ->map(fn ($entry) => [
                        'label' => $entry->label,
                        'text' => $entry->body,
                    ])
                    ->all(),
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
