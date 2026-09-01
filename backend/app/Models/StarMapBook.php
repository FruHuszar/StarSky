<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Az ékszer mellé járó emlékkönyv. */
class StarMapBook extends Model
{
    protected $fillable = ['custom_text'];

    public function starMap(): BelongsTo
    {
        return $this->belongsTo(StarMap::class);
    }

    public function entries(): HasMany
    {
        return $this->hasMany(StarMapBookEntry::class)->orderBy('position');
    }
}
