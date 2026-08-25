<?php

namespace App\Http\Requests\Meetings;

use App\Enums\MeetingVisibility;
use App\Support\OrganizationContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMeetingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $orgId = app(OrganizationContext::class)->id();

        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'objective' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', Rule::in(['draft', 'scheduled'])],
            'visibility' => ['sometimes', Rule::enum(MeetingVisibility::class)],

            'project_id' => ['sometimes', 'nullable', Rule::exists('projects', 'ulid')->where('organization_id', $orgId)],
            'department_id' => ['sometimes', 'nullable', Rule::exists('departments', 'ulid')->where('organization_id', $orgId)],

            'primary_language' => ['sometimes', 'string', 'max:10'],
            'languages' => ['sometimes', 'array'],
            'languages.*' => ['string', 'max:10'],

            'timezone' => ['required', 'string', 'max:64'],
            'scheduled_start_at' => ['required', 'date'],
            'scheduled_end_at' => ['required', 'date', 'after:scheduled_start_at'],

            'is_recurring' => ['sometimes', 'boolean'],
            'recurrence_rule' => ['sometimes', 'nullable', 'string', 'max:255'],

            'create_google_meet' => ['sometimes', 'boolean'],

            // Participants
            'participants' => ['sometimes', 'array'],
            'participants.*.user_id' => ['sometimes', 'nullable', 'string', Rule::exists('users', 'ulid')],
            'participants.*.email' => ['sometimes', 'nullable', 'email'],
            'participants.*.name' => ['sometimes', 'nullable', 'string', 'max:255'],

            // Agenda
            'agenda' => ['sometimes', 'array'],
            'agenda.*.title' => ['required_with:agenda', 'string', 'max:255'],
            'agenda.*.description' => ['sometimes', 'nullable', 'string'],
            'agenda.*.duration_minutes' => ['sometimes', 'nullable', 'integer', 'min:0'],
        ];
    }
}
