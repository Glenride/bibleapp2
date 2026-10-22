<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    public function subscribe(Request $request, string $planId)
    {
        return $request->user()
            ->newSubscription('default', $planId)
            ->checkout([
                'success_url' => route('dashboard') . '?success=true',
                'cancel_url' => route('pricing') . '?canceled=true',
            ]);
    }
}
