<?php

namespace App\Http\Requests\Participants;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['sometimes', 'nullable', 'string', Rule::exists('users', 'ulid')],
            'email' => ['required_without:user_id', 'nullable', 'email'],
            'name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'role_in_meeting' => ['sometimes', Rule::in(['organizer', 'presenter', 'attendee'])],
        ];
    }
}
