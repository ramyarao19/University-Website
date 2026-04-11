# Design System Document: The Scholarly Editorial

## 1. Overview & Creative North Star

**Creative North Star: "The Living Archive"**
This design system rejects the "corporate portal" aesthetic in favor of a high-end editorial experience. It envisions the university’s digital presence not as a static website, but as a prestigious, living publication. We move beyond rigid grids by utilizing intentional white space, layered depth, and a typographic hierarchy that feels both authoritative and contemporary. 

The system achieves its prestige through **Atmospheric Density**: the use of deep, resonant colors (Primary Navy) contrasted against expansive, breathable light surfaces. By employing asymmetrical layouts and overlapping elements, we create a sense of intellectual movement—modernizing the "established" institution without sacrificing its heritage.

---

## 2. Colors & Tonal Depth

The palette is anchored in a deep, intellectual navy, accented by a sophisticated burgundy that evokes leather-bound volumes and academic regalia.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to define sections or containers. 
Boundaries must be created through background color shifts. For instance, a `surface-container-low` (#f3f4f5) section should sit directly against a `surface` (#f8f9fa) background. This creates a "soft-edge" layout that feels premium and integrated rather than boxed-in.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine paper. 
- **Base Layer:** `surface` (#f8f9fa) or `surface-container-lowest` (#ffffff).
- **Secondary Content:** `surface-container` (#edeeef).
- **Floating/Elevated Elements:** Use `surface-bright` (#f8f9fa) with glassmorphism.

### The "Glass & Gradient" Rule
To avoid a flat, "template" look, primary CTAs and Hero sections should utilize subtle radial gradients. Transitioning from `primary` (#000a1e) to `primary-container` (#002147) adds a "visual soul" and photographic depth that solid fills lack. Floating navigation or modal overlays must use `surface_variant` at 80% opacity with a `20px` backdrop-blur to create a "frosted glass" effect.

---

## 3. Typography: The Editorial Voice

The typography is a dialogue between the classicism of the Serif and the functional clarity of the Sans-Serif.

*   **Display & Headlines (Noto Serif):** These are our "Statement" tiers. Use `display-lg` (3.5rem) with generous tracking and `headline-md` (1.75rem) to establish an academic, "New York Times" editorial feel. Headlines should often be paired with significant top-padding (Spacing 16 or 20) to let the ideas breathe.
*   **Body (Manrope):** Our workhorse. Manrope provides a modern, geometric clarity that balances the ornate nature of Noto Serif. Use `body-lg` (1rem) for long-form narrative to ensure maximum readability.
*   **Labels (Public Sans):** Reserved for metadata, tags, and small utility text. The utilitarian nature of Public Sans signals "Information" and "Fact," providing a structural anchor to the more decorative serif headers.

---

## 4. Elevation & Depth: Tonal Layering

We do not use shadows to create "pop"; we use them to create "atmosphere."

*   **The Layering Principle:** Depth is achieved by stacking. A `surface-container-lowest` card placed on a `surface-container-low` background creates a natural, sophisticated lift.
*   **Ambient Shadows:** If an element must float (e.g., a high-priority "Apply Now" card), use a shadow with a `40px` blur and `4%` opacity. The shadow color should be a tinted version of `on-surface` (#191c1d) to mimic natural light passing through paper.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use `outline-variant` (#c4c6cf) at **15% opacity**. Never use 100% opaque borders.
*   **Intentional Asymmetry:** Overlap elements. Let a `display-md` heading bleed 20px over the edge of an image or a secondary container to break the "web-template" mold and lean into "Editorial Design."

---

## 5. Components

### Buttons
*   **Primary:** Solid `primary` (#000a1e) background with `on-primary` (#ffffff) text. Use `rounded-md` (0.375rem). The slight rounding feels established; avoid "pill" shapes which feel too casual/tech-oriented.
*   **Secondary:** `surface-container-highest` (#e1e3e4) with `on-surface` text. No border.
*   **Tertiary:** Text-only in `secondary` (#af2b3e) with a `label-md` font weight.

### Cards & Lists
*   **The Divider Forbid:** Never use `<hr>` lines. Use vertical white space (Spacing 6 or 8) to separate list items. For cards, use a shift from `surface` to `surface-container-low` to define the hit area.
*   **Layout:** Content inside cards should be flush-left to maintain the editorial "spine."

### Input Fields
*   **Style:** Minimalist. No background fill—only a "Ghost Border" at the bottom (2px). Labels should use `label-sm` in `on-surface-variant`.
*   **Focus State:** The bottom border transitions to `secondary` (#af2b3e) with a subtle `2px` glow.

### Signature Component: The "Scholar's Pull-Quote"
A custom component for university sites. Large-scale `notoSerif` text in `primary` color, sitting atop a `surface-container-low` block with a single thick `secondary` (Burgundy) vertical accent on the left.

---

## 6. Do’s and Don’ts

### Do:
*   **DO** use extreme white space. If you think there is enough space, add 20% more. Use `spacing-24` (8.5rem) between major sections.
*   **DO** use high-contrast typography. Pair a very large `display-lg` heading with a very small, uppercase `label-md` sub-header.
*   **DO** use the Burgundy (`secondary`) sparingly. It is a "seal of quality," not a layout color.

### Don't:
*   **DON'T** use drop shadows on buttons or standard cards. It cheapens the "Established" feel.
*   **DON'T** use 100% black. Use `primary` (#000a1e) for deep tones to maintain the "Navy" brand soul.
*   **DON'T** center-align long blocks of text. Stick to a strong, left-aligned editorial axis.