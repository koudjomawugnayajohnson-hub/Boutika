---
name: Boutika
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#44474c'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#75777d'
  outline-variant: '#c4c6cd'
  surface-tint: '#515f74'
  primary: '#303e51'
  on-primary: '#ffffff'
  primary-container: '#475569'
  on-primary-container: '#bbcae1'
  inverse-primary: '#b9c7df'
  secondary: '#5c5f60'
  on-secondary: '#ffffff'
  secondary-container: '#dee0e2'
  on-secondary-container: '#606365'
  tertiary: '#303e50'
  on-tertiary: '#ffffff'
  tertiary-container: '#475568'
  on-tertiary-container: '#bbcae0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3fc'
  primary-fixed-dim: '#b9c7df'
  on-primary-fixed: '#0d1c2e'
  on-primary-fixed-variant: '#3a485b'
  secondary-fixed: '#e1e2e4'
  secondary-fixed-dim: '#c5c6c8'
  on-secondary-fixed: '#191c1e'
  on-secondary-fixed-variant: '#444749'
  tertiary-fixed: '#d4e4fa'
  tertiary-fixed-dim: '#b9c8de'
  on-tertiary-fixed: '#0d1c2d'
  on-tertiary-fixed-variant: '#39485a'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  headline-xl:
    fontFamily: IBM Plex Sans
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: IBM Plex Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: IBM Plex Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: IBM Plex Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  mono-label:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is engineered for a premium B2B SaaS environment, focusing on independent shop owners who require professional-grade tools. The brand personality is rooted in **Modern Minimalism**—it is disciplined, sophisticated, and utilitarian without being cold. 

The aesthetic prioritizes high-quality white space and meticulous typography to ensure a "calm" management experience. By stripping away unnecessary ornamentation, the design system allows the user's data and product imagery to take center stage. The emotional response is one of organized efficiency and institutional trust, signaling to small business owners that they are using a tool of enterprise-level caliber.

## Colors

The palette is anchored by **Slate Blue**, a color that evokes stability and professional rigor. This is paired with a range of warm grays to provide soft transitions between different functional areas of the interface.

- **Primary (#475569):** Used for primary actions, active navigation states, and key brand moments.
- **Surface (#FFFFFF):** The standard background for content cards, data tables, and input fields to maximize legibility.
- **Background (#F9FAFB):** Used for the application "canvas" to create a subtle distinction between the UI shell and content containers.
- **Secondary/Accents (#F3F4F6):** Reserved for subtle UI decorations, hover states on list items, and disabled component backgrounds.
- **Text (Neutral #1E293B):** A deep charcoal for high-contrast reading, ensuring accessibility in data-heavy views.

## Typography

This design system utilizes a dual-font approach to balance character with utility. **IBM Plex Sans** is used for headlines to provide a structured, technical feel that conveys authority. **Inter** is used for all body text and UI labels due to its exceptional legibility and neutral tone.

Maintain a strict vertical rhythm by adhering to the defined line heights. For data tables and information-dense dashboards, favor `body-sm` and `label-sm` to ensure maximum data visibility without clutter. Use `mono-label` (utilizing IBM Plex Sans's wider apertures) for SKU numbers, price points, and ID strings.

## Layout & Spacing

The layout is built on a **12-column fluid grid** for the main content area, while the side navigation remains at a fixed width (240px). The spacing rhythm follows a 4px baseline, ensuring that every element—from the height of a button to the padding of a card—is a multiple of 4.

- **Desktop:** 32px outer margins, 24px gutters. Content should be centered with a maximum width of 1440px.
- **Tablet:** 24px outer margins, 16px gutters.
- **Mobile:** 16px outer margins. Complex data tables should transition to a list-based "card" format to maintain readability.

Spacing between logical sections (e.g., between a header and a table) should use `xl` (40px), while spacing between related elements within a section should use `md` (16px).

## Elevation & Depth

To maintain a clean and professional look, this design system avoids heavy shadows. Instead, it utilizes **Tonal Layers** and **Low-Contrast Outlines** to define hierarchy.

- **Level 0 (Background):** Solid `#F9FAFB`. No shadows.
- **Level 1 (Cards/Containers):** Solid `#FFFFFF` with a 1px border of `#E2E8F0`. This is the default state for most UI components.
- **Level 2 (Hover/Active):** A very soft, diffused shadow (`0px 4px 6px -1px rgba(0, 0, 0, 0.05)`) to indicate interactivity.
- **Level 3 (Modals/Dropdowns):** A sharp 1px border combined with a medium-depth shadow (`0px 10px 15px -3px rgba(0, 0, 0, 0.1)`) to lift the element clearly above the UI.

Depth is primarily communicated through color shifts: deeper grays represent background elements, while pure white represents the most interactive foreground surfaces.

## Shapes

The shape language is "Soft" (0.25rem), providing a subtle approachability while maintaining the structured, geometric look required for a professional B2B tool.

- **Standard Buttons & Inputs:** 4px (`0.25rem`) corner radius.
- **Cards & Larger Containers:** 8px (`0.5rem`) corner radius.
- **Chips & Badges:** Full-round "pill" shape to contrast against the more rigid square elements of the grid.

Consistency in corner radius is critical to maintaining the enterprise-ready feel. Sharp corners (0px) are only permitted for the main sidebar or full-screen dividers.

## Components

### Buttons
- **Primary:** Background `#475569`, text `#FFFFFF`. 
- **Secondary:** Background `transparent`, border 1px `#CBD5E1`, text `#475569`.
- **Tertiary:** Text-only, no border or background until hover.

### Input Fields
Inputs use a 1px border of `#CBD5E1`. On focus, the border shifts to the primary color (`#475569`) with a subtle 2px outer glow of the same color at 10% opacity. Labels must always be visible above the input field using `label-sm`.

### Cards
Cards are the primary container for data. They must have a white background, 1px `#E2E8F0` border, and 24px internal padding. Title areas within cards should be separated by a subtle horizontal divider.

### Data Tables
Tables are the heart of the application. Rows should have a height of 56px. Use a subtle `#F9FAFB` background on header rows. Text within cells should be `body-sm`. Use "zebra-striping" or subtle bottom borders to maintain horizontal eye-tracking.

### Status Chips
Status indicators (e.g., "Shipped", "Pending") should use a light background and a darkened version of the same hue for text (e.g., Success: Background `#DCFCE7`, Text `#166534`).