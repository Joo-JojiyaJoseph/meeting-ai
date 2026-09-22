<?php

namespace App\Http\Requests\Notes;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMeetingNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // gated in the controller (author, organizer, or notes.manage)
    }

    protected function prepareForValidation(): void
    {
        // See StoreMeetingNoteRequest — `content` collides with a real
        // property on Symfony's base Request; must use input(), not ->content.
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
