<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends StoreTaskRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = parent::rules();

        $status_rurle = Rule::in([1,2,3]);

        return $rules + [
            'status' => 'required|' . $status_rurle,
        ];
    }

    public function messages()
    {
        $messages = parent::messages();

        return $messages + [
            'status.in' => '未着手、着手中、完了のいずれかを選択してください',
        ];
    }
}
