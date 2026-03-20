/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fff7ed',
                    100: '#ffeed5',
                    200: '#ffddb3',
                    300: '#ffcc91',
                    400: '#ffb366',
                    500: '#ff9f43',
                    600: '#ff8c1a',
                    700: '#e67e00',
                    800: '#cc6600',
                    900: '#994d00',
                },
                accent: {
                    50: '#fef3f2',
                    100: '#fee4e2',
                    500: '#f97066',
                    600: '#f04438',
                    700: '#d92d20',
                },
                dark: '#0f172a',
                'dark-secondary': '#1e293b',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}

