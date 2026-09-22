<?php

namespace App\Http\Requests\Notes;

use Illuminate\Foundation\Http\FormRequest;

class StoreMeetingNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // gated in the controller via MeetingPolicy::view (needs meeting access)
    }

    protected function prepareForValidation(): void
    {
        // NOTE: `content` collides with a real (protected) property on
        // Symfony's base Request class, which caches the raw request body.
        // The magic `$this->content` shortcut silently returns THAT instead
        // of the submitted field, so this must use input()/all(), never the
        // magic property, for any field named "content".
        if (is_string($this->input('content'))) {
            $this->merge(['content' => trim($this->input('content'))]);
        }
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'max:4000'],
        ];
    }
}
