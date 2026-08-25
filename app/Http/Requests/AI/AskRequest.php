<?php

namespace App\Http\Requests\AI;

use App\Support\OrganizationContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $orgId = app(OrganizationContext::class)->id();

        return [
            'question' => ['required', 'string', 'max:1000'],
            'language' => ['sometimes', 'string', 'max:10'],
            // Optional: scope the assistant to a single meeting (§33).
            'meeting_id' => ['sometimes', 'nullable', Rule::exists('meetings', 'ulid')->where('organization_id', $orgId)],
        ];
    }
}
