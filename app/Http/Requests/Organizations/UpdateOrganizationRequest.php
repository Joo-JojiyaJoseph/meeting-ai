<?php

namespace App\Http\Requests\Organizations;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrganizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Route-model-bound organization is authorized in the controller policy.
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'timezone' => ['sometimes', 'string', 'max:64'],
            'default_locale' => ['sometimes', 'string', 'max:10'],
            'ai_processing_enabled' => ['sometimes', 'boolean'],
            'ai_search_enabled' => ['sometimes', 'boolean'],
            'speaker_identification_enabled' => ['sometimes', 'boolean'],
            'transcript_retention_days' => ['sometimes', 'integer', 'min:1', 'max:3650'],
            'recording_retention_days' => ['sometimes', 'integer', 'min:1', 'max:3650'],
        ];
    }
}
