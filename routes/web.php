<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\BibleController;
use App\Http\Controllers\BibleInteractionController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SermonController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', [BibleController::class, 'index'])->name('home');
Route::get('/about', function () { return Inertia::render('About'); })->name('about');
Route::get('/pricing', function () { return Inertia::render('Pricing'); })->name('pricing');
Route::get('/for-llms', function () { return Inertia::render('ForLlms'); })->name('for-llms');
Route::get('/contact', function () { return Inertia::render('Contact'); })->name('contact');
Route::get('/privacy', function () { return Inertia::render('Privacy'); })->name('privacy');
Route::get('/terms', function () { return Inertia::render('Terms'); })->name('terms');
Route::get('/faq', function () { return Inertia::render('FAQ'); })->name('faq');

// Pillar Guides
Route::get('/guides/how-to-read-the-bible', function () { return Inertia::render('guides/HowToReadBible'); })->name('guides.read-bible');
Route::get('/guides/how-to-pray-when-you-feel-stuck', function () { return Inertia::render('guides/HowToPray'); })->name('guides.pray');
Route::get('/guides/how-to-begin-a-spiritual-journey', function () { return Inertia::render('guides/SpiritualJourney'); })->name('guides.spiritual-journey');
Route::get('/guides/how-to-use-ai-for-bible-study', function () { return Inertia::render('guides/AIBibleStudy'); })->name('guides.ai-bible-study');

// Resource Roundups
Route::get('/resources/best-bible-reading-plans', function () { return Inertia::render('resources/BibleReadingPlans'); })->name('resources.reading-plans');
Route::get('/resources/journaling-prompts-for-spiritual-growth', function () { return Inertia::render('resources/JournalingPrompts'); })->name('resources.journaling-prompts');

Route::get('/bible/{book}/{chapter?}', [BibleController::class, 'show'])->name('bible.chapter');

Route::get('/shared/{token}', [SermonController::class, 'shared'])->name('sermons.shared');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/checkout/{plan}', [CheckoutController::class, 'subscribe'])->name('checkout');

    Route::get('/billing-portal', function () {
        return auth()->user()->redirectToBillingPortal(route('subscription.edit'));
    })->name('billing-portal');

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/search', [SearchController::class, 'index'])->name('search');

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

    // Admin routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'index'])->name('admin.users');
        Route::post('/users/{user}/make-admin', [AdminController::class, 'makeAdmin'])->name('admin.make-admin');
        Route::post('/users/{user}/remove-admin', [AdminController::class, 'removeAdmin'])->name('admin.remove-admin');
        Route::post('/users/{user}/assign-trial', [AdminController::class, 'assignTrial'])->name('admin.assign-trial');
        Route::post('/users/{user}/cancel-subscription', [AdminController::class, 'cancelSubscription'])->name('admin.cancel-subscription');
    });
});

require __DIR__.'/settings.php';
