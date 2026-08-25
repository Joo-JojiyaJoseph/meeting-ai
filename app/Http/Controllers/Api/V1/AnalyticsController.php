<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function index(AnalyticsService $analytics): JsonResponse
    {
        abort_unless(request()->user()->hasPermission('analytics.view'), 403);

        return response()->json(['data' => $analytics->overview()]);
    }
}
