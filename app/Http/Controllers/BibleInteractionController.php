<?php

namespace App\Http\Controllers;

use App\Models\Bookmark;
use App\Models\Favorite;
use App\Models\Highlight;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class BibleInteractionController extends Controller
{
    public function toggleHighlight(Request $request)
    {
        $request->validate([
            'verse_id' => 'required|exists:verses,id',
            'color' => 'required|string|in:yellow,green,blue,pink',
            'note' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();

        if (!$user->isAdmin() && !$user->subscribed('default')) {
             return back()->with('error', 'Subscription required for this feature.');
        }

        $highlight = $user->highlights()->where('verse_id', $request->verse_id)->first();

        if ($highlight) {
            // Check authorization for update/delete
            Gate::authorize('update', $highlight);
            
            // If note is provided, we are updating the highlight (note or color), not toggling off
            if ($request->has('note')) {
                $highlight->update([
                    'color' => $request->color,
                    'note' => $request->note
                ]);
                return back()->with('success', 'Highlight note saved');
            }

            if ($highlight->color === $request->color) {
                // If same color and no note update, remove highlight
                Gate::authorize('delete', $highlight);
                $highlight->delete();
                return back()->with('success', 'Highlight removed');
            } else {
                // Change color
                $highlight->update(['color' => $request->color]);
                return back()->with('success', 'Highlight updated');
            }
        } else {
            // Create highlight
            Gate::authorize('create', Highlight::class);
            $user->highlights()->create([
                'verse_id' => $request->verse_id,
                'color' => $request->color,
                'note' => $request->input('note'),
            ]);
            return back()->with('success', 'Verse highlighted');
        }
    }

    public function toggleFavorite(Request $request)
    {
        $request->validate([
            'verse_id' => 'required|exists:verses,id',
            'note' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();
        
        if (!$user->isAdmin() && !$user->subscribed('default')) {
             return back()->with('error', 'Subscription required for this feature.');
        }

        $favorite = $user->favorites()->where('verse_id', $request->verse_id)->first();

        if ($favorite) {
            Gate::authorize('update', $favorite);
            
            // If note is provided, update note
            if ($request->has('note')) {
                $favorite->update(['note' => $request->note]);
                return back()->with('success', 'Favorite note saved');
            }

            Gate::authorize('delete', $favorite);
            $favorite->delete();
            return back()->with('success', 'Removed from favorites');
        } else {
            Gate::authorize('create', Favorite::class);
            $user->favorites()->create([
                'verse_id' => $request->verse_id,
                'note' => $request->input('note'),
            ]);
            return back()->with('success', 'Added to favorites');
        }
    }

    public function toggleBookmark(Request $request)
    {
        $request->validate([
            'book_id' => 'required|exists:books,id',
            'chapter_id' => 'required|exists:chapters,id',
            'verse_id' => 'nullable|exists:verses,id',
            'note' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();

        if (!$user->isAdmin() && !$user->subscribed('default')) {
             return back()->with('error', 'Subscription required for this feature.');
        }
        
        // Check if bookmark exists for this chapter (and verse if provided)
        $query = $user->bookmarks()
            ->where('book_id', $request->book_id)
            ->where('chapter_id', $request->chapter_id);
            
        if ($request->verse_id) {
            $query->where('verse_id', $request->verse_id);
        } else {
            $query->whereNull('verse_id');
        }

        $bookmark = $query->first();

        if ($bookmark) {
            Gate::authorize('update', $bookmark);
            
            // If note is provided, update note
            if ($request->has('note')) {
                $bookmark->update(['note' => $request->note]);
                return back()->with('success', 'Bookmark note saved');
            }

            Gate::authorize('delete', $bookmark);
            $bookmark->delete();
            return back()->with('success', 'Bookmark removed');
        } else {
            Gate::authorize('create', Bookmark::class);
            // Optional: Remove other bookmarks for this chapter if we only want one per chapter? 
            // Or remove previous bookmark if we are just "moving the bookmark"? 
            // For now, let's treat them as separate saved items.
            
            $user->bookmarks()->create([
                'book_id' => $request->book_id,
                'chapter_id' => $request->chapter_id,
                'verse_id' => $request->verse_id,
                'note' => $request->input('note'),
            ]);
            return back()->with('success', 'Bookmark saved');
        }
    }
}
