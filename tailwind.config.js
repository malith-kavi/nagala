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
                sans: ['Nunito', ...defaultTheme.fontFamily.sans],
                display: ['Fredoka', 'Nunito', ...defaultTheme.fontFamily.sans],
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
                birdsong: {
                    '0%, 100%': { transform: 'scaleY(0.35)' },
                    '50%': { transform: 'scaleY(1)' },
                },
                // Slides a strip of two identical tiles by one tile, so the loop is seamless.
                'cloud-flow': {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                // Centred on the star's position while it brightens and fades.
                twinkle: {
                    '0%, 100%': { opacity: '0.1', transform: 'translate(-50%, -50%) scale(0.55)' },
                    '50%': { opacity: '1', transform: 'translate(-50%, -50%) scale(1.1)' },
                },
            },
            animation: {
                'fade-up': 'fade-up 0.8s ease-out both',
                birdsong: 'birdsong 0.9s ease-in-out infinite',
                'cloud-flow': 'cloud-flow 120s linear infinite',
                twinkle: 'twinkle 4s ease-in-out infinite',
            },
        },
    },

    plugins: [forms],
};
