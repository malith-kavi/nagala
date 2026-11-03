<?php

return [
    // Where booking and contact notifications are sent.
    'owner_email' => env('OWNER_EMAIL', env('MAIL_FROM_ADDRESS', 'owner@example.com')),

    // Seeded admin account (change the password after first login).
    'admin_email' => env('ADMIN_EMAIL', 'admin@nagala.lk'),
    'admin_password' => env('ADMIN_PASSWORD', 'password'),
];
