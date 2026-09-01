<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Egy szöveg az emlékkönyvben: mítosz, hagyomány vagy egy nap égboltja. */
class StarMapBookEntry extends Model
{
    protected $fillable = ['label', 'body', 'position'];

    public function book(): BelongsTo
    {
        return $this->belongsTo(StarMapBook::class, 'star_map_book_id');
    }
}
