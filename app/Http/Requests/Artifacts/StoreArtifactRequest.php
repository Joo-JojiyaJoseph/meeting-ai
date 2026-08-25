<?php

namespace App\Http\Requests\Artifacts;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreArtifactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['recording', 'audio', 'transcript', 'chat', 'document'])],
            'source' => ['required', Rule::in(['google_meet', 'upload'])],
            'google_file_id' => ['required_if:source,google_meet', 'nullable', 'string'],
            'drive_url' => ['sometimes', 'nullable', 'url'],
            'storage_path' => ['required_if:source,upload', 'nullable', 'string'],
            'mime_type' => ['sometimes', 'nullable', 'string'],
            'file_size' => ['sometimes', 'nullable', 'integer'],
            'duration_seconds' => ['sometimes', 'nullable', 'integer'],
            'process' => ['sometimes', 'boolean'],
        ];
    }
}
