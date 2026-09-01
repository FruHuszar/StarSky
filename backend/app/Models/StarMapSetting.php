<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StarMapSetting extends Model
{
    /** API kulcs => adatbázis oszlop. */
    public const LAYERS = [
        'showConstellations' => 'show_constellations',
        'showConstellationNames' => 'show_constellation_names',
        'showStarNames' => 'show_star_names',
        'showPlanets' => 'show_planets',
        'showSun' => 'show_sun',
        'showMoon' => 'show_moon',
        'showMilkyWay' => 'show_milky_way',
        'showEcliptic' => 'show_ecliptic',
        'showGrid' => 'show_grid',
        'showCircumpolar' => 'show_circumpolar',
        'showCardinals' => 'show_cardinals',
    ];

    public const MAXIMUM_STARS = 5;

    public const MINIMUM_MAGNITUDE = 2.5;

    public const MAXIMUM_MAGNITUDE = 6.5;

    /** A régi, beállítás nélküli sorokhoz is legyen értelmes alapérték. */
    protected $attributes = [
        'show_constellations' => true,
        'show_constellation_names' => false,
        'show_star_names' => false,
        'show_planets' => true,
        'show_sun' => true,
        'show_moon' => true,
        'show_milky_way' => true,
        'show_ecliptic' => false,
        'show_grid' => false,
        'show_circumpolar' => false,
        'show_cardinals' => true,
        'magnitude_limit' => 5.2,
    ];

    protected $fillable = [
        'show_constellations',
        'show_constellation_names',
        'show_star_names',
        'show_planets',
        'show_sun',
        'show_moon',
        'show_milky_way',
        'show_ecliptic',
        'show_grid',
        'show_circumpolar',
        'show_cardinals',
        'magnitude_limit',
    ];

    protected function casts(): array
    {
        return array_merge(
            array_fill_keys(array_values(self::LAYERS), 'boolean'),
            ['magnitude_limit' => 'float'],
        );
    }

    public function starMap(): BelongsTo
    {
        return $this->belongsTo(StarMap::class);
    }

    /** A beérkező (camelCase) beállításokból oszlopnevek szerinti tömb. */
    public static function attributesFromPayload(?array $payload): array
    {
        $payload ??= [];
        $attributes = [];

        foreach (self::LAYERS as $key => $column) {
            if (array_key_exists($key, $payload)) {
                $attributes[$column] = filter_var($payload[$key], FILTER_VALIDATE_BOOLEAN);
            }
        }

        if (isset($payload['magnitudeLimit'])) {
            $attributes['magnitude_limit'] = round(
                max(
                    self::MINIMUM_MAGNITUDE,
                    min(self::MAXIMUM_MAGNITUDE, (float) $payload['magnitudeLimit']),
                ),
                1,
            );
        }

        return $attributes;
    }

    /** Vissza a frontendnek, ugyanabban az alakban, ahogy küldte. */
    public function toPayload(): array
    {
        $payload = [];

        foreach (self::LAYERS as $key => $column) {
            $payload[$key] = (bool) $this->{$column};
        }

        $payload['magnitudeLimit'] = (float) $this->magnitude_limit;

        return $payload;
    }

    private static function trimmed(?string $value, int $limit): ?string
    {
        $value = $value === null ? null : mb_substr(trim($value), 0, $limit);

        return $value === '' ? null : $value;
    }
}
