<?php

namespace App\Http\Requests\ActionItems;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Managers edit an AI-suggested action item before converting it (§25). */
class UpdateActionItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:1000'],
            'description' => ['sometimes', 'nullable', 'string'],
            'assignee_id' => ['sometimes', 'nullable', 'string', Rule::exists('users', 'ulid')],
            'due_date' => ['sometimes', 'nullable', 'date'],
            'priority' => ['sometimes', Rule::in(['low', 'medium', 'high', 'urgent'])],
        ];
    }
}
