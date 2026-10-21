<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Standalone-fallback admin gate for the affiliate admin module.
 *
 * If the existing homelab admin panel already has its own admin concept /
 * middleware, use that instead and skip the is_admin migration there —
 * see docs/affiliate-admin-integration.md.
 */
class EnsureIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! (bool) ($user->is_admin ?? false)) {
            abort(403);
        }

        return $next($request);
    }
}
