<?php

namespace App\Http\Requests;

use App\Models\StarMapSetting;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StarMapRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'location' => ['required', 'string', 'max:120'],
            'date' => ['required', 'date_format:Y-m-d'],
            'time' => ['required', 'date_format:H:i'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'timezone' => [
                'nullable',
                'string',
                'max:64',
                Rule::in(timezone_identifiers_list()),
            ],
            'settings' => ['nullable', 'array'],
            'settings.magnitudeLimit' => [
                'nullable',
                'numeric',
                'between:'.StarMapSetting::MINIMUM_MAGNITUDE.','.StarMapSetting::MAXIMUM_MAGNITUDE,
            ],
            'settings.favouriteStars' => [
                'nullable',
                'array',
                'max:'.StarMapSetting::MAXIMUM_STARS,
            ],
            'settings.favouriteStars.*' => ['string', 'max:60'],
            'settings.bookEntries' => ['nullable', 'array', 'max:10'],
            'settings.bookEntries.*.label' => ['required', 'string', 'max:80'],
            'settings.bookEntries.*.text' => ['required', 'string', 'max:2000'],
            'settings.customText' => ['nullable', 'string', 'max:120'],
        ];

        foreach (array_keys(StarMapSetting::LAYERS) as $layer) {
            $rules['settings.'.$layer] = ['nullable', 'boolean'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'date.date_format' => 'A dátum formátuma ÉÉÉÉ-HH-NN lehet.',
            'time.date_format' => 'Az időpont formátuma ÓÓ:PP lehet.',
        ];
    }

    /** Csak a térkép saját mezői, a beállítások nélkül. */
    public function starMapAttributes(): array
    {
        return $this->safe()->except('settings');
    }

    public function settingsAttributes(): array
    {
        return StarMapSetting::attributesFromPayload($this->validated('settings'));
    }

    /** A kiválasztott csillagok sorrendben, ismétlés nélkül. */
    public function starRows(): array
    {
        $names = array_values(
            array_unique($this->validated('settings.favouriteStars') ?? []),
        );

        return array_map(
            fn (string $name, int $index) => [
                'name' => $name,
                'position' => $index,
            ],
            $names,
            array_keys($names),
        );
    }

    public function bookAttributes(): array
    {
        $text = trim((string) ($this->validated('settings.customText') ?? ''));

        return ['custom_text' => $text === '' ? null : mb_substr($text, 0, 120)];
    }

    public function bookEntryRows(): array
    {
        $entries = $this->validated('settings.bookEntries') ?? [];

        return array_map(
            fn (array $entry, int $index) => [
                'label' => $entry['label'],
                'body' => $entry['text'],
                'position' => $index,
            ],
            $entries,
            array_keys($entries),
        );
    }
}
