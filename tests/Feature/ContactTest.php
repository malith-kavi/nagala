<?php

namespace Tests\Feature;

use App\Mail\NewContactMessage;
use App\Models\ContactMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactTest extends TestCase
{
    use RefreshDatabase;

    public function test_contact_message_is_stored_and_owner_notified(): void
    {
        Mail::fake();

        $this->post(route('contact.store'), [
            'name' => 'Kamala',
            'email' => 'kamala@example.com',
            'message' => 'Do you have parking?',
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('contact_messages', ['email' => 'kamala@example.com']);
        Mail::assertQueued(NewContactMessage::class, fn ($m) => $m->hasTo(config('nagala.owner_email')));
    }

    public function test_contact_message_requires_fields(): void
    {
        $this->post(route('contact.store'), [])->assertSessionHasErrors(['name', 'email', 'message']);
        $this->assertSame(0, ContactMessage::count());
    }
}
