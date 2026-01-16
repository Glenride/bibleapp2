<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $bookmarks = $user->bookmarks()
            ->with(['book', 'chapter', 'verse'])
            ->latest()
            ->get();

        $favorites = $user->favorites()
            ->with(['verse.chapter.book'])
            ->latest()
            ->get();
            
        $highlights = $user->highlights()
            ->with(['verse.chapter.book'])
            ->latest()
            ->get();

        return Inertia::render('dashboard', [
            'bookmarks' => $bookmarks,
            'favorites' => $favorites,
            'highlights' => $highlights,
        ]);
    }
}
