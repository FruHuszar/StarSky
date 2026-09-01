<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StarMapRequest;
use App\Http\Resources\StarMapResource;
use App\Models\StarMap;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class StarMapController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return StarMapResource::collection(
            StarMap::with(['settings', 'stars', 'book.entries'])->latest()->get(),
        );
    }

    public function store(StarMapRequest $request): JsonResponse
    {
        $starMap = DB::transaction(function () use ($request) {
            $starMap = StarMap::create($request->starMapAttributes());
            $starMap->settings()->create($request->settingsAttributes());
            $starMap->stars()->createMany($request->starRows());

            $book = $starMap->book()->create($request->bookAttributes());
            $book->entries()->createMany($request->bookEntryRows());

            return $starMap->load(['settings', 'stars', 'book.entries']);
        });

        return StarMapResource::make($starMap)->response()->setStatusCode(201);
    }

    public function update(StarMapRequest $request, StarMap $starMap): StarMapResource
    {
        DB::transaction(function () use ($request, $starMap) {
            $starMap->update($request->starMapAttributes());
            $starMap->settings()->updateOrCreate([], $request->settingsAttributes());

            // A gyerekeket egyszerűbb újraírni, mint párosítani: kevés sor,
            // és így a sorrend is mindig a beküldött állapotot követi.
            $starMap->stars()->delete();
            $starMap->stars()->createMany($request->starRows());

            $book = $starMap->book()->updateOrCreate([], $request->bookAttributes());
            $book->entries()->delete();
            $book->entries()->createMany($request->bookEntryRows());
        });

        return StarMapResource::make(
            $starMap->load(['settings', 'stars', 'book.entries']),
        );
    }

    public function destroy(StarMap $starMap): JsonResponse
    {
        $starMap->delete();

        return response()->json(null, 204);
    }
}
