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

        // Build CSP based on environment
        $isLocal = app()->environment('local');
        
        // Dev server URLs only needed in local development
        $devServers = $isLocal 
            ? 'http://localhost:5173 http://localhost:5174 http://0.0.0.0:5173 http://127.0.0.1:5173'
            : '';
        $devWs = $isLocal
            ? 'ws://localhost:5173 ws://localhost:5174 ws://0.0.0.0:5173 ws://127.0.0.1:5173'
            : '';
        
        $csp = implode('; ', array_filter([
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'" . ($devServers ? " $devServers" : ''),
            "style-src 'self' 'unsafe-inline' https://fonts.bunny.net" . ($devServers ? " $devServers" : ''),
            "font-src 'self' https://fonts.bunny.net data:" . ($devServers ? " $devServers" : ''),
            "img-src 'self' data: https:" . ($devServers ? " $devServers" : ''),
            "connect-src 'self'" . ($devServers ? " $devServers $devWs" : ''),
        ]));
        
        $response->headers->set('Content-Security-Policy', $csp);

        return $response;
    }
}
