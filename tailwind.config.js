/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Auth screen tokens (from issue #1).
        "bg-primary": "#fff8f0",
        "bg-logo": "#d4a574",
        "bg-badge": "rgba(156,175,136,0.15)",
        "button-primary-bg": "#1f1a14",
        "text-heading": "#33291f",
        "text-body": "#736659",
        "text-badge": "#617354",
        "text-subtle": "#8c8073",
        "accent-primary": "#d4a574",

        // Onboarding Step 1 tokens (from issue #2).
        "bg-card": "#ffffff",
        "bg-input": "#faf7f5",
        "bg-input-disabled": "#f2f0ed",
        "bg-next": "#d4a574",
        "bg-progress-track": "rgba(156,175,136,0.2)",
        "bg-progress-fill": "#9caf88",
        "border-input-active": "#d4a574",
        "border-input-default": "#e0dbd6",
        "border-input-disabled": "#e5e3e0",
        "text-placeholder": "#a6998c",
        "text-placeholder-disabled": "#b2a699",

        // Onboarding Step 2 tokens (from issue #3).
        "text-chip-label": "#594d40",
      },
      boxShadow: {
        button: "0 4px 12px rgba(0,0,0,0.1)",
        card: "0 4px 24px rgba(212,165,116,0.08)",
        next: "0 4px 16px rgba(212,165,116,0.3)",
        chip: "0 2px 8px rgba(156,175,136,0.25)",
      },
    },
  },
  plugins: [],
};
