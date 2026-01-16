<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // HSTS (only if HTTPS)
        if ($request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        // Basic CSP - Adjust as needed for external scripts (like analytics or fonts)
        // Allowing 'unsafe-inline' for styles because many UI libraries use it, and fonts from data:
        // Allowing scripts from 'self' and inline (Inertia often needs inline scripts for initial page state)
        // This is a starting point and should be tightened based on specific needs.
        $response->headers->set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173 http://localhost:5174 http://0.0.0.0:5173 http://127.0.0.1:5173; style-src 'self' 'unsafe-inline' https://fonts.bunny.net http://localhost:5173 http://localhost:5174 http://0.0.0.0:5173 http://127.0.0.1:5173; font-src 'self' https://fonts.bunny.net data: http://localhost:5173 http://localhost:5174 http://0.0.0.0:5173 http://127.0.0.1:5173; img-src 'self' data: https: http://localhost:5173 http://localhost:5174 http://0.0.0.0:5173 http://127.0.0.1:5173; connect-src 'self' http://localhost:5173 ws://localhost:5173 http://localhost:5174 ws://localhost:5174 http://0.0.0.0:5173 ws://0.0.0.0:5173 http://127.0.0.1:5173 ws://127.0.0.1:5173;");

        return $response;
    }
}
