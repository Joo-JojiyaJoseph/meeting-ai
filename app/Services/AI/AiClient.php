<?php

namespace App\Services\AI;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

/**
 * Thin, typed-ish HTTP client for the Python AI service. Every call carries the
 * service token, times out generously (jobs are queued), and throws on non-2xx
 * so the calling job's retry/failure handling kicks in.
 *
 * Returns decoded arrays — the calling jobs map them onto Eloquent models.
 */
class AiClient
{
    protected function request(): PendingRequest
    {
        return Http::baseUrl(rtrim(config('ai.base_url'), '/'))
            ->withHeaders(['X-Service-Token' => config('ai.token')])
            ->acceptJson()
            ->asJson()
            ->timeout(config('ai.timeout', 300))
            ->retry(2, 1000, throw: false);
    }

    protected function post(string $uri, array $payload): array
    {
        $response = $this->request()->post($uri, $payload);
        $response->throw();

        return $response->json() ?? [];
    }

    // ---- Transcription pipeline ----

    public function transcribe(array $payload): array
    {
        return $this->post('/v1/transcription', $payload);
    }

    public function diarize(array $payload): array
    {
        return $this->post('/v1/diarization', $payload);
    }

    public function detectLanguages(array $payload): array
    {
        return $this->post('/v1/language/detect', $payload);
    }

    public function translate(array $payload): array
    {
        return $this->post('/v1/translation', $payload);
    }

    // ---- Analysis (grounded) ----

    public function topics(array $payload): array
    {
        return $this->post('/v1/analysis/topics', $payload);
    }

    public function summary(array $payload): array
    {
        return $this->post('/v1/analysis/summary', $payload);
    }

    public function decisions(array $payload): array
    {
        return $this->post('/v1/analysis/decisions', $payload);
    }

    public function actionItems(array $payload): array
    {
        return $this->post('/v1/analysis/action-items', $payload);
    }

    public function risksQuestions(array $payload): array
    {
        return $this->post('/v1/analysis/risks-questions', $payload);
    }

    public function agendaCoverage(array $payload): array
    {
        return $this->post('/v1/analysis/agenda-coverage', $payload);
    }

    public function minutes(array $payload): array
    {
        return $this->post('/v1/analysis/mom', $payload);
    }

    // ---- Assistant (grounded RAG) ----

    public function answer(array $payload): array
    {
        return $this->post('/v1/assistant/answer', $payload);
    }

    // ---- Embeddings ----

    public function embed(array $payload): array
    {
        return $this->post('/v1/embeddings', $payload);
    }
}
