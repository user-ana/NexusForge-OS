---
name: NexusForge OS
colors:
  surface: '#15121b'
  surface-dim: '#15121b'
  surface-bright: '#3b3742'
  surface-container-lowest: '#0f0d15'
  surface-container-low: '#1d1a23'
  surface-container: '#211e27'
  surface-container-high: '#2c2832'
  surface-container-highest: '#37333d'
  on-surface: '#e7e0ed'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#e7e0ed'
  inverse-on-surface: '#322f39'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#ffb869'
  on-tertiary: '#482900'
  tertiary-container: '#ca801e'
  on-tertiary-container: '#3f2300'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#ffdcbb'
  tertiary-fixed-dim: '#ffb869'
  on-tertiary-fixed: '#2c1700'
  on-tertiary-fixed-variant: '#673d00'
  background: '#15121b'
  on-background: '#e7e0ed'
  surface-variant: '#37333d'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  title-sm:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
  label-xs:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: '1.0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 12px
  margin-mobile: 16px
  margin-desktop: 24px
  panel-padding: 16px
---

## Brand & Style
The design system for this platform is built on a "Mission Control" philosophy. It targets engineering students who balance technical rigor with gaming culture. The aesthetic is **High-Density Cyber-Social**, blending the information-rich layouts of Twitch with the community-centric navigation of Discord.

The brand evokes a sense of "Productive Flow," where project management feels like an immersive digital operation. The style utilizes **Glassmorphism** and **High-Contrast Neon** elements set against a deep, technical backdrop to create a UI that feels alive, urgent, and precise.

Key brand attributes:
- **Gamified Technicality:** Engineering data is treated as "stats" and "loot."
- **Hyper-Density:** Maximum information visibility with minimal wasted space.
- **Luminous Feedback:** Active states and achievements are communicated through vibrant, electric glows.

## Colors
The palette is rooted in an ultra-dark environment to reduce eye strain during long engineering sprints.

- **Foundations:** The primary background is a deep charcoal-blue (`#0B0E14`). Surfaces and panels use a slightly lighter shade (`#151A22`) to create subtle depth.
- **Accents:** Electric Violet (`#8B5CF6`) serves as the primary action color. Cyan (`#06B6D4`) is used for live indicators and secondary technical data.
- **Rank Logic:** The design system employs specific "Glow Logic" for gamified tiers:
  - **Oro (Gold):** `#FBBF24` with a 15px outer glow for high-tier achievements.
  - **Diamante (Cyan):** `#22D3EE` with a 20px outer glow for elite engineering ranks.
- **Semantic States:** Soft Grey (`#E2E8F0`) is the standard for readability, ensuring high contrast against dark panels.

## Typography
The typography system uses a dual-font approach to distinguish between "Interface Context" and "Technical Data."

- **Hanken Grotesk:** Used for all UI labels, navigation, and headers. It provides a sharp, modern, and highly legible sans-serif foundation.
- **JetBrains Mono:** Reserved exclusively for numerical counters (monedas, estrellas), code snippets, and system timestamps. This reinforces the engineering focus of the platform.
- **Language:** All system labels are in Spanish (e.g., "Panel de Control," "Hitos del Proyecto," "Inventario").
- **Hierarchy:** Headers use tight letter spacing and heavy weights to mimic the "Aggressive Modern" style of gaming interfaces.

## Layout & Spacing
The layout follows a **Multi-Panel Fixed Grid** model, optimized for high-density information display.

- **Structure:** A 12-column grid is used for the main content area, while sidebar navigation (Discord-style) remains fixed at 72px (collapsed) or 240px (expanded).
- **Density:** Spacing is compact, using a 4px base unit. Gutters are kept narrow (12px) to maximize the amount of data visible on a single screen.
- **Responsiveness:**
  - **Desktop:** Multi-column view with persistent activity sidebars and toolbars.
  - **Tablet:** Collapsible sidebars; panels reflow into a 2-column stack.
  - **Mobile:** Single-panel focus with a bottom navigation bar for quick access to "Proyectos" and "Perfil."

## Elevation & Depth
Depth is not communicated through traditional shadows, but through **Tonal Layering** and **Luminescence**.

- **Z-Axis Hierarchy:**
  - **Level 0 (Background):** `#0B0E14` (The void).
  - **Level 1 (Panels):** `#151A22` with a 1px border of `#2D3748` (The work surface).
  - **Level 2 (Active States/Modals):** Floating elements with a soft backdrop blur (12px) and a primary accent border.
- **Glow Effects:** Critical components (Live indicators, 'Oro' tier badges) utilize `drop-shadow` rather than `box-shadow` to create a neon-light effect that bleeds into the dark background, simulating a glowing hardware interface.

## Shapes
The shape language is **Technical and Precise**. 

- **Corners:** Use "Soft" (`0.25rem`) rounding for most containers to maintain a disciplined, engineering-grade look. Rounded-lg (`0.5rem`) is reserved for high-fidelity avatars and primary cards.
- **Interactive Elements:** Buttons and input fields should have subtle diagonal "clipped" corners or very small radii to maintain the "Forge" metaphor.
- **Icons:** Digital coins and stars should be rendered with high-fidelity gradients and a circular base, standing out against the rectangular rigidity of the UI panels.

## Components
- **Buttons:** Primary CTAs use the Electric Violet gradient with a white text label. Secondary buttons are "Ghost" style with a Cyan border that glows on hover.
- **Chips / Tags:** High-density labels with `label-xs` typography. Engineering roles (e.g., "Backend," "Mecánica") use muted versions of the accent colors.
- **Cards (Misiones):** Use a 1px border. The top border color changes based on the priority or "Rank" of the project mission.
- **Input Fields:** Dark background (`#0B0E14`), subtle border, and a Cyan blinking cursor. Label text is always uppercase `label-xs`.
- **Avatars:** Circular, with a glowing outer ring indicating the user's current "Rank" (Gold or Cyan).
- **Progress Bars:** Thin, high-contrast bars. Completed sections should "pulse" with a low-opacity neon glow.
- **Counters:** Large `data-mono` numbers for "Monedas" and "Estrellas," accompanied by small digital icons.