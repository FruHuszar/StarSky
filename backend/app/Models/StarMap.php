<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class StarMap extends Model
{
    use HasFactory;

    protected $fillable = [
        'location',
        'date',
        'time',
        'latitude',
        'longitude',
        'timezone',
    ];

    protected $attributes = [
        'time' => '22:00',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    /** A rendelés második lépése: hogyan nézzen ki a térkép. */
    public function settings(): HasOne
    {
        return $this->hasOne(StarMapSetting::class);
    }

    /** A kiválasztott csillagok, sorrendben. */
    public function stars(): HasMany
    {
        return $this->hasMany(StarMapStar::class)->orderBy('position');
    }

    /** Az ékszer mellé járó emlékkönyv. */
    public function book(): HasOne
    {
        return $this->hasOne(StarMapBook::class);
    }

    /** Mindig van beállítás- és könyvpéldány, üres rekordhoz is. */
    public function displaySettings(): StarMapSetting
    {
        return $this->settings ?? $this->settings()->make();
    }

    public function displayBook(): StarMapBook
    {
        return $this->book ?? $this->book()->make();
    }
}
