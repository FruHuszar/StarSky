<?php

use App\Http\Controllers\Api\StarMapController;
use Illuminate\Support\Facades\Route;

Route::get('/starmaps', [StarMapController::class, 'index']);
Route::post('/starmaps', [StarMapController::class, 'store']);
Route::put('/starmaps/{starMap}', [StarMapController::class, 'update']);
Route::delete('/starmaps/{starMap}', [StarMapController::class, 'destroy']);
