<?php

namespace App\Http\Requests\Mom;

use Illuminate\Foundation\Http\FormRequest;

class EmailMomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Optional explicit recipients; defaults to meeting participants.
            'recipients' => ['sometimes', 'array'],
            'recipients.*' => ['email'],
            'attach_pdf' => ['sometimes', 'boolean'],
            'message' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }
}
