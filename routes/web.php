<?php

use App\Http\Controllers\AffiliateAdminController;
use App\Http\Controllers\AffiliateDashboardController;
use App\Http\Controllers\BibleController;
use App\Http\Controllers\BibleInteractionController;
use App\Http\Controllers\BibleSearchController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\ReferralController;
use App\Http\Controllers\SermonController;
use App\Models\BibleVersion;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', [BibleController::class, 'index'])->name('home');

// Public referral-link entry point: /r/{code} -> records click, sets the
// attribution cookie, redirects to registration.
Route::get('/r/{code}', [ReferralController::class, 'redirect'])->name('affiliate.redirect');
Route::get('/about', function () { return Inertia::render('About'); })->name('about');
Route::get('/pricing', function () { return Inertia::render('Pricing'); })->name('pricing');
// NOTE: /bible/search must be registered before /bible/{book}/{chapter?},
// otherwise "search" is captured as a book abbreviation.
Route::get('/bible/search', [BibleSearchController::class, 'search'])->name('bible.search');
// Version-prefixed Bible URLs (additive only). Registered before
// /bible/{book}/{chapter?} so a version slug is never captured as a book
// abbreviation. The unprefixed routes below are untouched: they remain the
// canonical KJV URLs and must never redirect.
Route::get('/bible/{version}/{book}/{chapter?}', [BibleController::class, 'showVersioned'])
    ->where('version', implode('|', array_keys(BibleVersion::VERSION_SLUGS)))
    ->name('bible.version.chapter');
Route::get('/bible/{book}/{chapter?}', [BibleController::class, 'show'])->name('bible.chapter');

Route::get('/shared/{token}', [SermonController::class, 'shared'])->name('sermons.shared');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::post('/bible/highlight', [BibleInteractionController::class, 'toggleHighlight'])->name('bible.highlight');
    Route::post('/bible/favorite', [BibleInteractionController::class, 'toggleFavorite'])->name('bible.favorite');
    Route::post('/bible/bookmark', [BibleInteractionController::class, 'toggleBookmark'])->name('bible.bookmark');

    Route::get('/lessons', [LessonController::class, 'index'])->name('lessons.index');
    Route::get('/lessons/{lesson}', [LessonController::class, 'show'])->name('lessons.show');
    Route::post('/lessons/generate', [LessonController::class, 'generate'])->name('lessons.generate');
    Route::delete('/lessons/{lesson}', [LessonController::class, 'destroy'])->name('lessons.destroy');

    Route::get('/sermons/{sermon}', [SermonController::class, 'show'])->name('sermons.show');
    Route::post('/sermons/generate', [SermonController::class, 'generate'])->name('sermons.generate');
    Route::post('/sermons/from-lessons', [SermonController::class, 'createFromLessons'])->name('sermons.from-lessons');
    Route::put('/sermons/{sermon}', [SermonController::class, 'update'])->name('sermons.update');
    Route::delete('/sermons/{sermon}', [SermonController::class, 'destroy'])->name('sermons.destroy');
    Route::post('/sermons/{sermon}/share', [SermonController::class, 'share'])->name('sermons.share');
    Route::post('/sermons/{sermon}/toggle-public', [SermonController::class, 'togglePublic'])->name('sermons.toggle-public');
    Route::post('/sermons/{sermon}/add-lesson', [SermonController::class, 'addLesson'])->name('sermons.add-lesson');
    Route::post('/sermons/{sermon}/remove-lesson', [SermonController::class, 'removeLesson'])->name('sermons.remove-lesson');
    Route::get('/shared-with-me', [SermonController::class, 'sharedWithMe'])->name('sermons.shared-with-me');

    // Creator affiliate dashboard (only renders for users with an affiliate record).
    Route::get('/affiliate', [AffiliateDashboardController::class, 'show'])->name('affiliate.dashboard');
});

// ---------------------------------------------------------------------------
// Affiliate admin module.
//
// STANDALONE FALLBACK (default): works on its own behind auth + `is_admin`
// (users.is_admin flag).
//
// MOUNTING INTO THE EXISTING HOMELAB ADMIN PANEL: move this group inside your
// existing admin route group and swap `is_admin` for your panel's middleware,
// e.g.:
//
//   Route::middleware(['auth', 'verified', YourPanelMiddleware::class])
//       ->prefix('admin')->name('admin.')->group(function () {
//           // ... your existing panel routes ...
//           Route::prefix('affiliates')->name('affiliates.')->group(function () {
//               Route::get('/', [AffiliateAdminController::class, 'index'])->name('index');
//               ... (same routes as below, minus the /admin prefix) ...
//           });
//       });
//
// See docs/affiliate-admin-integration.md for the full wiring guide.
// ---------------------------------------------------------------------------
Route::middleware(['auth', 'verified', 'is_admin'])->prefix('admin/affiliates')->name('admin.affiliates.')->group(function () {
    Route::get('/', [AffiliateAdminController::class, 'index'])->name('index');
    Route::post('/invite', [AffiliateAdminController::class, 'invite'])->name('invite');
    Route::get('/{affiliate}', [AffiliateAdminController::class, 'show'])->name('show');
    Route::patch('/{affiliate}', [AffiliateAdminController::class, 'update'])->name('update');
    Route::patch('/{affiliate}/status', [AffiliateAdminController::class, 'updateStatus'])->name('status');
    Route::post('/{affiliate}/payouts', [AffiliateAdminController::class, 'storePayout'])->name('payouts.store');
    Route::post('/{affiliate}/adjustments', [AffiliateAdminController::class, 'storeAdjustment'])->name('adjustments.store');
});

require __DIR__.'/settings.php';
