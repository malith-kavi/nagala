<?php

namespace App\Http\Requests;

use App\Models\Cottage;
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
            'cottage_id' => ['required', 'exists:cottages,id'],
            'package_id' => ['nullable', 'exists:packages,id'],
            // Y-m-d only: other formats (such as "8 December 2026") compared wrongly with the stored dates,
            // so the fully booked check missed them.
            'check_in' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'check_out' => ['required', 'date_format:Y-m-d', 'after:check_in', 'before:'.now()->addYear()->addDay()->toDateString()],
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
                $cottage = Cottage::active()->find($this->input('cottage_id'));

                if (! $cottage) {
                    $validator->errors()->add('cottage_id', 'Please choose an available cottage.');

                    return;
                }

                if ((int) $this->input('guests') > $cottage->max_guests) {
                    $validator->errors()->add('guests', "The {$cottage->name} sleeps up to {$cottage->max_guests} guests.");
                }

                $package = $this->filled('package_id') ? Package::find($this->input('package_id')) : null;

                if ($package && ! $package->fitsCottage($cottage)) {
                    $validator->errors()->add('package_id', $package->cottages->isNotEmpty()
                        ? "The {$package->name} is only available in the {$package->cottages->pluck('name')->join(', ', ' or ')}."
                        : "The {$package->name} is for our {$package->guests}-guest cottages.");
                }
            },
        ];
    }
}
