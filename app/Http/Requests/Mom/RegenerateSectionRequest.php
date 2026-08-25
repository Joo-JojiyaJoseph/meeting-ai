<?php

namespace App\Http\Requests\Mom;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegenerateSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'section' => ['required', Rule::in(['executive_summary', 'detailed_discussions', 'decisions', 'action_items', 'next_steps'])],
        ];
    }
}
