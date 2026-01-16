<?php

return [

    /*
    |--------------------------------------------------------------------------
    | OpenAI API Key
    |--------------------------------------------------------------------------
    |
    | Here you may specify your OpenAI API Key. This will be used to authenticate
    | with the OpenAI API - you can find your API key on your OpenAI dashboard,
    | at https://openai.com.
    |
    */

    'api_key' => env('OPENAI_API_KEY'),

    /*
    |--------------------------------------------------------------------------
    | OpenAI Organization
    |--------------------------------------------------------------------------
    |
    | Here you may specify your OpenAI Organization ID. This will be used to
    | authenticate with the OpenAI API - you can find your Organization ID on
    | your OpenAI dashboard, at https://openai.com.
    |
    */

    'organization' => env('OPENAI_ORGANIZATION'),

    /*
    |--------------------------------------------------------------------------
    | Request Timeout
    |--------------------------------------------------------------------------
    |
    | The timeout may be used to specify the maximum number of seconds to wait
    | for a response. The default value is 30 seconds.
    |
    */

    'request_timeout' => env('OPENAI_REQUEST_TIMEOUT', 30),

];
