
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
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Custom colors for Sadman's Kidney Fight
				kidney: {
					red: '#FF3A5E',
					blue: '#4361EE',
					purple: '#7209B7',
					green: '#38B000',
					yellow: '#FFBE0B',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
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
				'pulse-slow': {
					'0%, 100%': {
						opacity: '1',
						transform: 'scale(1)',
					},
					'50%': {
						opacity: '0.8',
						transform: 'scale(1.05)',
					},
				},
				'slide-up': {
					'0%': {
						transform: 'translateY(20px)',
						opacity: '0',
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1',
					},
				},
				'fade-in': {
					'0%': {
						opacity: '0',
					},
					'100%': {
						opacity: '1',
					},
				},
				'bounce-small': {
					'0%, 100%': {
						transform: 'translateY(0)',
					},
					'50%': {
						transform: 'translateY(-5px)',
					},
				},
				'scale-up': {
					'0%': {
						transform: 'scale(0.8)',
						opacity: '0',
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1',
					},
				},
				'glow': {
					'0%, 100%': {
						boxShadow: '0 0 5px rgba(255, 190, 11, 0.5)',
					},
					'50%': {
						boxShadow: '0 0 20px rgba(255, 190, 11, 0.8), 0 0 30px rgba(255, 190, 11, 0.5)',
					},
				},
				'flame': {
					'0%, 100%': {
						filter: 'brightness(1) hue-rotate(0deg)',
					},
					'25%': {
						filter: 'brightness(1.2) hue-rotate(5deg)',
					},
					'50%': {
						filter: 'brightness(0.9) hue-rotate(-5deg)',
					},
					'75%': {
						filter: 'brightness(1.1) hue-rotate(2deg)',
					},
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-slow': 'pulse-slow 3s infinite ease-in-out',
				'slide-up': 'slide-up 0.5s ease-out forwards',
				'fade-in': 'fade-in 0.3s ease-out forwards',
				'bounce-small': 'bounce-small 1s infinite ease-in-out',
				'scale-up': 'scale-up 0.3s ease-out forwards',
				'glow': 'glow 2s infinite ease-in-out',
				'flame': 'flame 2s infinite ease-in-out',
			},
			backdropFilter: {
				'none': 'none',
				'blur': 'blur(20px)',
			},
			boxShadow: {
				'neon': '0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.2), 0 0 30px rgba(255, 255, 255, 0.1)',
				'neon-red': '0 0 10px rgba(255, 58, 94, 0.5), 0 0 20px rgba(255, 58, 94, 0.3), 0 0 30px rgba(255, 58, 94, 0.1)',
				'neon-blue': '0 0 10px rgba(67, 97, 238, 0.5), 0 0 20px rgba(67, 97, 238, 0.3), 0 0 30px rgba(67, 97, 238, 0.1)',
				'neon-green': '0 0 10px rgba(56, 176, 0, 0.5), 0 0 20px rgba(56, 176, 0, 0.3), 0 0 30px rgba(56, 176, 0, 0.1)',
				'neon-purple': '0 0 10px rgba(114, 9, 183, 0.5), 0 0 20px rgba(114, 9, 183, 0.3), 0 0 30px rgba(114, 9, 183, 0.1)',
				'neon-yellow': '0 0 10px rgba(255, 190, 11, 0.5), 0 0 20px rgba(255, 190, 11, 0.3), 0 0 30px rgba(255, 190, 11, 0.1)',
				'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
