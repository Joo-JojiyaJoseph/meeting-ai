<?php

namespace App\Http\Requests\Meetings;

use App\Enums\MeetingStatus;
use App\Enums\MeetingVisibility;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMeetingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'objective' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', Rule::enum(MeetingStatus::class)],
            'visibility' => ['sometimes', Rule::enum(MeetingVisibility::class)],
            'primary_language' => ['sometimes', 'string', 'max:10'],
            'languages' => ['sometimes', 'array'],
            'timezone' => ['sometimes', 'string', 'max:64'],
            'scheduled_start_at' => ['sometimes', 'date'],
            'scheduled_end_at' => ['sometimes', 'date', 'after:scheduled_start_at'],
        ];
    }
}
