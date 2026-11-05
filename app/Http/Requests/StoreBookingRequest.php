<?php

namespace App\Http\Requests;

use App\Models\Cabana;
use App\Models\Package;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cabana_id' => ['required', 'exists:cabanas,id'],
            'package_id' => ['nullable', 'exists:packages,id'],
            'check_in' => ['required', 'date', 'after_or_equal:today'],
            'check_out' => ['required', 'date', 'after:check_in', 'before:'.now()->addYear()->addDay()->toDateString()],
            'guests' => ['required', 'integer', 'min:1', 'max:20'],
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['required', 'string', 'max:30'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $cabana = Cabana::active()->find($this->input('cabana_id'));

                if (! $cabana) {
                    $validator->errors()->add('cabana_id', 'Please choose an available cabana.');

                    return;
                }

                if ((int) $this->input('guests') > $cabana->max_guests) {
                    $validator->errors()->add('guests', "The {$cabana->name} sleeps up to {$cabana->max_guests} guests.");
                }

                $package = $this->filled('package_id') ? Package::find($this->input('package_id')) : null;

                if ($package && ! $package->fitsCabana($cabana)) {
                    $validator->errors()->add('package_id', $package->cabana_id
                        ? "The {$package->name} is only available in the {$package->cabana?->name}."
                        : "The {$package->name} is for our {$package->guests}-guest cabanas.");
                }
            },
        ];
    }
}
