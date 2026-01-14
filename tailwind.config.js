/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--color-primary)', // #181920
                secondary: 'var(--color-secondary)', // #21222C
                accent: 'var(--color-accent)', // #2563eb
                income: 'var(--color-income)', // #16a34a
                expense: 'var(--color-expense)', // #dc2626
                'text-primary': 'var(--color-text-primary)',
                'text-secondary': 'var(--color-text-secondary)',
            },
        },
    },
    plugins: [],
}
