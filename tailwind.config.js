import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                serif: ['"Cormorant Garamond"', ...defaultTheme.fontFamily.serif],
            },
            colors: {
                forest: {
                    50: '#eef5ef',
                    100: '#d5e7d8',
                    200: '#a9cfb0',
                    300: '#74b082',
                    400: '#3f8a52',
                    500: '#2a6b3a',
                    600: '#1f5a30',
                    700: '#1f4d2b',
                    800: '#173d22',
                    900: '#123019',
                    950: '#0b1f10',
                },
                leaf: {
                    400: '#62c23d',
                    500: '#4caf2a',
                    600: '#3d9421',
                },
                gold: {
                    300: '#ecd391',
                    400: '#e2c372',
                    500: '#d9b85c',
                    600: '#b8963a',
                },
                cream: {
                    50: '#fdfbf6',
                    100: '#faf7ef',
                    200: '#f2ecdc',
                },
            },
            keyframes: {
                'fade-up': {
                    '0%': { opacity: 0, transform: 'translateY(16px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
            },
            animation: {
                'fade-up': 'fade-up 0.8s ease-out both',
            },
        },
    },

    plugins: [forms],
};
