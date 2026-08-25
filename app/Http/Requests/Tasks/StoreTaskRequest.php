<?php

namespace App\Http\Requests\Tasks;

use App\Support\OrganizationContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
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
            'assignee_id' => ['sometimes', 'nullable', 'string', Rule::exists('users', 'ulid')],
            'project_id' => ['sometimes', 'nullable', Rule::exists('projects', 'ulid')->where('organization_id', $orgId)],
            'meeting_id' => ['sometimes', 'nullable', Rule::exists('meetings', 'ulid')->where('organization_id', $orgId)],
            'priority' => ['sometimes', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'due_date' => ['sometimes', 'nullable', 'date'],
        ];
    }
}
