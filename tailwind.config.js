/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#fff8f0",
        "bg-logo": "#d4a574",
        "bg-badge": "rgba(156,175,136,0.15)",
        "button-primary-bg": "#1f1a14",
        "text-heading": "#33291f",
        "text-body": "#736659",
        "text-badge": "#617354",
        "text-subtle": "#8c8073",
        "accent-primary": "#d4a574",
      },
      boxShadow: {
        button: "0 4px 12px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [],
};
