<?php

namespace App\Services\Google;

use App\Models\GoogleAccount;
use Google\Client as GoogleClient;

/**
 * Builds an authenticated Google API client from a stored GoogleAccount,
 * transparently refreshing the access token (and persisting the new one) when
 * it has expired. Tokens are stored encrypted on the model.
 *
 * Requires: composer require google/apiclient:^2.15
 */
class GoogleClientFactory
{
    public function forAccount(GoogleAccount $account): GoogleClient
    {
        $client = new GoogleClient();
        $client->setClientId(config('services.google.client_id'));
        $client->setClientSecret(config('services.google.client_secret'));
        $client->setAccessType('offline');

        $expiresIn = $account->token_expires_at
            ? max(0, now()->diffInSeconds($account->token_expires_at, false))
            : 0;

        $client->setAccessToken([
            'access_token' => $account->access_token,
            'refresh_token' => $account->refresh_token,
            'expires_in' => $expiresIn,
            'created' => now()->timestamp,
        ]);

        if ($client->isAccessTokenExpired() && $account->refresh_token) {
            $fresh = $client->fetchAccessTokenWithRefreshToken($account->refresh_token);

            if (! isset($fresh['error'])) {
                $account->update([
                    'access_token' => $fresh['access_token'],
                    'token_expires_at' => now()->addSeconds($fresh['expires_in'] ?? 3600),
                    'refresh_token' => $fresh['refresh_token'] ?? $account->refresh_token,
                ]);
            }
        }

        return $client;
    }
}
