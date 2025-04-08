
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				// '2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(240 5% 25%)',
				input: 'hsl(240 5% 20%)',
				ring: 'hsl(213 92% 60%)',
				background: 'hsl(240 10% 7%)',
				foreground: 'hsl(0 0% 98%)',
				primary: {
					DEFAULT: 'hsl(213 92% 60%)',
					foreground: 'hsl(0 0% 100%)'
				},
				secondary: {
					DEFAULT: 'hsl(240 10% 13%)',
					foreground: 'hsl(0 0% 98%)'
				},
				destructive: {
					DEFAULT: 'hsl(0 84% 60%)',
					foreground: 'hsl(0 0% 98%)'
				},
				muted: {
					DEFAULT: 'hsl(240 10% 15%)',
					foreground: 'hsl(240 5% 75%)'
				},
				accent: {
					DEFAULT: 'hsl(240 10% 12%)',
					foreground: 'hsl(0 0% 98%)'
				},
				popover: {
					DEFAULT: 'hsl(240 10% 9%)',
					foreground: 'hsl(0 0% 98%)'
				},
				card: {
					DEFAULT: 'hsl(240 10% 10%)',
					foreground: 'hsl(0 0% 98%)'
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			
			keyframes: {
				'spin-prof': {
						from: {
							transform: 'rotate(0deg)'
						},
						to: {
							transform: 'rotate(360deg)'
					
						},
					'0%, 100%': {
						boxShadow: '0 0 15px 0 rgba(255, 43, 191, 0.3)'
					},
					'50%': {
						boxShadow: '0 0 15px 5px rgba(206, 43, 255, 0.5)'
					}	
				},
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse-glow': {
					'0%, 100%': {
						boxShadow: '0 0 15px 0 rgba(43, 127, 255, 0.3)'
					},
					'50%': {
						boxShadow: '0 0 15px 5px rgba(43, 127, 255, 0.5)'
					}
				}
			},
			animation: {
				'spin-prof': 'spin-prof 4s linear infinite',
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-glow': 'pulse-glow 3s infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
