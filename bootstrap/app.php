<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // CRITICAL: without this, SetOrganizationContext (a custom, unlisted
        // middleware) is NOT in Laravel's default middleware priority list,
        // so the framework's SubstituteBindings middleware — which resolves
        // route-model-bound parameters like {meeting} — runs BEFORE it on
        // every request. That means every org-scoped model's global query
        // scope evaluates with no organization set yet, silently becoming a
        // no-op and returning ANY organization's row for a matching ulid.
        // Verified via real HTTP requests (not just test-harness behavior):
        // this was a full, persistent, unauthenticated-context tenant
        // isolation failure, not an edge case.
        //
        // Fix: force SetOrganizationContext to run before SubstituteBindings
        // resolves any route-model-bound parameter.
        $middleware->prependToPriorityList(
            before: \Illuminate\Routing\Middleware\SubstituteBindings::class,
            prepend: \App\Http\Middleware\SetOrganizationContext::class,
        );
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
