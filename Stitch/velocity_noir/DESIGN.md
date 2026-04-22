# Design System Strategy: Engineering & Precision

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The High-Performance Workshop."** This visual identity moves beyond standard service templates to mirror the engineering excellence of the Ducati brand. It is built on a foundation of high-contrast mechanics: deep, textured voids offset by laser-focused highlights. 

The experience is defined by **Technical Editorialism**. We break the traditional grid by using intentional asymmetry and high-contrast typography scales that feel more like a premium automotive magazine than a standard website. Elements should feel "machined" and purposeful, utilizing the `background` (#0e0e0e) as a canvas for high-gloss interactive components.

---

## 2. Colors: The High-Contrast Palette
Our color strategy is inspired by asphalt and carbon fiber. We use a dominant monochromatic base to allow the `primary` red accents to command immediate attention.

### The "No-Line" Rule
To maintain a premium, seamless feel, **never use 1px solid borders for sectioning.** Boundaries must be defined through:
*   **Tonal Shifts:** Transitioning from `surface` (#0e0e0e) to `surface-container-low` (#131313).
*   **Negative Space:** Using the `Spacing Scale` (16 for section breaks, 20-24 for hero layouts) to let elements breathe.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
*   **Base:** `surface` (#0e0e0e)
*   **Elevated Sections:** `surface-container` (#1a1a1a)
*   **Interactive Cards/Inputs:** `surface-container-highest` (#262626)
This nesting creates depth without the clutter of traditional UI boxes.

### Signature Textures & Glass
*   **The "Glass" Effect:** For floating elements like navigation bars or client area modals, use `surface-variant` (#262626) at 80% opacity with a `backdrop-blur` of 12px.
*   **Performance Gradients:** For primary CTAs, use a subtle linear gradient from `primary` (#ff8e80) to `primary-dim` (#e80f16). This creates a "3D light-up" effect reminiscent of a brake light.

---

## 3. Typography: Mechanical Precision
The typography system balances a wide, technical display face with a highly legible, geometric body face.

*   **Display (Space Grotesk):** Use `display-lg` and `display-md` for high-impact headlines. This typeface communicates engineering precision. Utilize `headline-sm` for section headers with increased letter spacing (0.05em) for a technical look.
*   **Body (Manrope):** Use `body-lg` for standard reading. Manrope’s geometric nature ensures clarity against dark backgrounds.
*   **Labels:** Use `label-md` and `label-sm` in `on-surface-variant` (#adaaaa) for metadata or captions, ensuring they don't compete with primary actions.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** rather than structural shadows.

*   **The Layering Principle:** Place a `surface-container-highest` card on a `surface-container-low` background to create a "lift" effect. 
*   **Ambient Shadows:** If a floating effect is required (e.g., a service modal), use a shadow with a blur of 32px and 6% opacity, tinted with `primary` (#ff8e80) to mimic a subtle red glow from motorcycle lights.
*   **The "Ghost Border":** For input fields or secondary buttons, use `outline-variant` (#484847) at 20% opacity. This provides just enough definition to guide the eye without breaking the dark aesthetic.

---

## 5. Components

### Buttons
*   **Primary:** Background `primary-dim` (#e80f16), `on-primary-fixed` (#000000) text. Roundedness: `md` (0.375rem). High contrast is mandatory.
*   **Secondary/Outlined:** Background transparent, `ghost-border` (20% `outline-variant`), white text.
*   **WhatsApp Action:** Utilizing `secondary_container` (#0b6b1d) with `on_secondary_fixed` text for high-trust, specific service actions.

### Input Fields (Client Area)
Inputs should feel "built-in" to the interface.
*   **Container:** `surface-container-highest` (#262626).
*   **Border:** None by default. A 1px `primary-dim` bottom border should appear only on focus.
*   **Text:** `body-md` in `on-surface` (#ffffff).
*   **Labels:** Floating `label-sm` in `on-surface-variant`.

### Navigation
*   **Desktop:** Horizontal layout, `title-sm` typography. Use a `primary-dim` underline (2px height) for the active state only.
*   **Mobile:** Full-screen overlay using `surface_container_lowest` (#000000) at 95% opacity with `backdrop-blur`.

### Cards & Lists
*   **Forbid dividers.** Use `surface-container-low` cards on a `surface` background.
*   **Spacing:** Use `spacing-5` (1.25rem) internal padding for all service cards.

---

## 6. Do’s and Don’ts

### Do:
*   **Use High Contrast:** Ensure `primary` red elements sit directly against `surface` black for maximum impact.
*   **Embrace Asymmetry:** Place high-quality imagery of Ducati components off-center to create visual energy.
*   **Trust the Spacing:** When in doubt, increase vertical padding using `spacing-16` or `spacing-20`.

### Don’t:
*   **No 100% Opaque Borders:** Never use a solid white or grey border; it cheapens the "technical" feel. Use Tonal Layering.
*   **Avoid Flat Red:** Always use the `primary-dim` or `primary-fixed` tokens to ensure the red feels vibrant and "active" rather than dull.
*   **No Generic Icons:** Use thin-stroke, technical icons (0.5pt - 1pt) to match the `spaceGrotesk` font weight.

---

## 7. Interaction Feedback
When a user hovers over an interactive element:
*   **Buttons:** Shift from `primary-dim` to `primary` (#ff8e80) for a "glow" effect.
*   **Images:** Apply a subtle `0.5rem` zoom and increase the saturation of red elements within the photo.
*   **Inputs:** Transition the `ghost-border` from 20% to 100% opacity of `outline-variant`.