# Design System Document

## 1. Overview & Creative North Star

### Creative North Star: "The Guardian’s Ledger"
This design system moves beyond the cold, utilitarian nature of traditional fintech. It is built on the philosophy of **The Guardian’s Ledger**: an experience that feels as solid and authoritative as a physical bank vault, yet as approachable as a high-end editorial magazine.

We reject the "generic SaaS" aesthetic of thin lines and flat boxes. Instead, we embrace a **Bento-Editorial** hybrid. This approach utilizes high-contrast typography and a clean bento-box layout to organize complex fraud detection data into digestible, high-trust modules. By utilizing extreme corner radii (`xl: 3rem`) and tonal layering, we create a tactile, premium environment that reassures the unbanked user through clarity, intentional asymmetry, and "breathable" white space.

---

## 2. Colors

The palette is rooted in a "Professional Calm" spectrum. It uses deep charcoals for authority and high-chroma status colors for instant cognitive recognition.

### Palette Roles
- **Primary & Neutral:** We use `primary: #212529` and `neutral: #f5f6f7` for our core dark and light shades.
- **Status Signals:**
- **Safe:** `secondary: #6FAF4F` (Emerald). Use for verified accounts and clear status.
- **Caution:** `tertiary: #C44A3A` (Crimson) acts as our high-risk alert. *Note: For cautionary but non-critical states, use subtle Amber tones (not explicitly in tokens, but implied by brand goals).*

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section off content.
Boundaries must be defined solely through background color shifts. For example, a section sitting on a neutral background creates a natural boundary that feels modern and integrated, rather than "boxed in."

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers.
- Use lighter tones for the most prominent cards.
- Place these cards on top of darker background tones.
- This "nested depth" replaces the need for dividers, allowing the user's eye to follow the natural elevation of information.

### Signature Textures & Glass
- **Glassmorphism:** For floating navigation bars or high-priority modals, use semi-transparent white with a 20px backdrop blur.
- **CTA Soul:** Apply a subtle linear gradient to main buttons to give them a weighted, metallic feel.

---

## 3. Typography

The typography strategy focuses on **Institutional Clarity**. We pair the expressive **Plus Jakarta Sans** for high-level information with the functional **Inter** for data density.

- **Display & Headlines (Plus Jakarta Sans):** Used for "Hero" moments and status summaries. `display-lg` (3.5rem) and `headline-lg` (2rem) should be used with tight letter-spacing to feel "editorial" and authoritative.
- **Titles & Labels (Inter):** Used for the "Ledger" data. `title-md` (1.125rem) is the workhorse for bento-box headers.
- **The Contrast Rule:** Always maintain high contrast. Use a dark primary text color against light backgrounds. This ensures users who are less tech-savvy can immediately distinguish between a label and its value.

---

## 4. Elevation & Depth

We convey hierarchy through **Tonal Layering**, not structural lines.

- **The Layering Principle:** Depth is achieved by stacking. A light card placed on a slightly darker background provides a soft, organic lift.
- **Ambient Shadows:** Shadows should be used sparingly. When required for "floating" elements, use a dark color with an opacity of 4%-6% and a blur radius of 40px+. This mimics natural light.
- **The "Ghost Border" Fallback:** If a container absolutely requires a border for accessibility, use a subtle grey at **10-15% opacity**. This creates a "suggestion" of a boundary without cluttering the visual field.
- **Rounding:** Embrace the `xl: 3rem` (roundedness `3`) radius for main bento containers. This softness counters the "seriousness" of fraud detection, making the app feel safe and human.

---

## 5. Components

### Buttons
- **Primary:** `primary` background with appropriate contrast text. Use `xl: 3rem` (roundedness `3`) corner radius. Height should be a substantial `spacing-10` (3.5rem) for ease of tap.
- **Tertiary/Ghost:** No background. Use `primary` text weight 600.

### Bento Cards
- Forbid divider lines. Separate content using generous spacing (e.g., `spacing-6` (2rem) and `spacing-8` (2.75rem)).
- Use light backgrounds for primary data points (e.g., "Account Status").

### Fraud Status Chips
- Use `secondary` for "Safe" and `tertiary` for "High Risk."
- Text should always be an "On" variant for maximum legibility.

### Input Fields
- Use a light background as the field background. No border.
- On focus, transition the background to a slightly darker shade.
- Error states must use `tertiary` (#C44A3A) text for the helper message.

### Relevant App-Specific Components
- **Trust-Indicator Meter:** A large, semi-circular gauge using `secondary` and `tertiary` to show real-time risk levels.
- **Transaction Ledger:** A list where items are separated by `spacing-4` vertical gaps rather than 1px lines, using alternating light and slightly darker backgrounds for row distinction.

---

## 6. Do's and Don'ts

### Do
- **Do** use `spacing` values (e.g., `spacing-6` and `spacing-8`) to create "Editorial Air"—whitespace is a luxury signal.
- **Do** use the `xl` (3rem) corner radius (roundedness `3`) for large containers to maintain the "Friendly Guardian" persona.
- **Do** rely on font weight (Bold/ExtraBold) for headlines to drive hierarchy.

### Don't
- **Don't** use 1px dividers or high-contrast borders; they feel "cheap" and "system-default."
- **Don't** use pure black (#000000) for text; use the defined primary dark color to keep the look sophisticated and soft.
- **Don't** cram multiple bento boxes into a small space. If the data is dense, use a vertical scroll with generous spacing.
- **Don't** use standard "drop shadows." If it doesn't look like ambient light, it doesn't belong.