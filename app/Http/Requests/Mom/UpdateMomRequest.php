<?php

namespace App\Http\Requests\Mom;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'content' => ['required', 'array'],
            'change_note' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
