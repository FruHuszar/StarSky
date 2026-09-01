<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Egy kiválasztott csillag: ide kerül majd egy-egy kő az ékszeren. */
class StarMapStar extends Model
{
    protected $fillable = ['name', 'position'];

    public function starMap(): BelongsTo
    {
        return $this->belongsTo(StarMap::class);
    }
}
