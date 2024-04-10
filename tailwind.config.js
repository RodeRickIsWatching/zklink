import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{html,js,ts,tsx,jsx}"],
    theme: {
        extend: {
            backgroundImage: {
                BG: "url('/assets/images/_global/bg.png')",
            },
        },
    },
    plugins: [daisyui],
};
