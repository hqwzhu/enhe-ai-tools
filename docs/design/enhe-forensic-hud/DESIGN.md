---
version: alpha
name: ENHE-forensic-hud-design
description: A cinematic dark interface direction for ENHE AI Tools, synthesized from forensic evidence-board references and the structured DESIGN.md token format. The system uses deep green-black atmosphere, translucent dossier panels, floating evidence cards, warm cream typography, cyan/amber HUD accents, and biometric scan overlays to make software tools feel like high-value intelligence assets rather than commodity store items.

colors:
  canvas: "#04100E"
  canvas-deep: "#020706"
  canvas-soft: "#0A1715"
  glass: "rgba(18, 33, 31, 0.72)"
  glass-strong: "rgba(24, 42, 39, 0.86)"
  glass-soft: "rgba(229, 238, 221, 0.08)"
  border: "rgba(239, 228, 197, 0.16)"
  border-strong: "rgba(239, 228, 197, 0.28)"
  text: "#F4EEDA"
  text-soft: "#C8BEA6"
  text-muted: "#8E9B91"
  text-dim: "#59685F"
  cyan: "#35BEE7"
  cyan-soft: "#8DDFF5"
  match-green: "#37D66F"
  amber: "#F5C66B"
  amber-soft: "#FFE7A6"
  orange-alert: "#FF6B2C"
  blue-folder: "#5EA7D7"
  blue-folder-deep: "#1D689B"
  danger: "#FF4F43"
  shadow: "rgba(0, 0, 0, 0.45)"

typography:
  display-xl:
    fontFamily: "Inter, Arial, Helvetica, sans-serif"
    fontSize: 56px
    fontWeight: 650
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  display-lg:
    fontFamily: "Inter, Arial, Helvetica, sans-serif"
    fontSize: 40px
    fontWeight: 620
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  title-lg:
    fontFamily: "Inter, Arial, Helvetica, sans-serif"
    fontSize: 28px
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title-md:
    fontFamily: "Inter, Arial, Helvetica, sans-serif"
    fontSize: 20px
    fontWeight: 620
    lineHeight: 1.2
    letterSpacing: 0
  body-md:
    fontFamily: "Inter, Arial, Helvetica, sans-serif"
    fontSize: 16px
    fontWeight: 440
    lineHeight: 1.55
    letterSpacing: 0
  body-sm:
    fontFamily: "Inter, Arial, Helvetica, sans-serif"
    fontSize: 14px
    fontWeight: 440
    lineHeight: 1.45
    letterSpacing: 0
  caption:
    fontFamily: "Inter, Arial, Helvetica, sans-serif"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.08em"
    textTransform: uppercase
  numeric-hud:
    fontFamily: "Inter, Arial, Helvetica, sans-serif"
    fontSize: 48px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.04em"

rounded:
  sm: 10px
  md: 18px
  lg: 28px
  xl: 42px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 72px

components:
  glass-shell:
    backgroundColor: "{colors.glass}"
    borderColor: "{colors.border}"
    rounded: "{rounded.xl}"
    backdropFilter: "blur(28px) saturate(128%)"
    shadow: "0 30px 90px rgba(0,0,0,0.42)"
  evidence-card:
    backgroundColor: "{colors.glass-strong}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    padding: 20px
    shadow: "0 24px 60px rgba(0,0,0,0.34)"
  dossier-card:
    backgroundColor: "rgba(11, 26, 23, 0.82)"
    borderColor: "{colors.border-strong}"
    rounded: "{rounded.lg}"
    padding: 28px
  hud-pill:
    backgroundColor: "rgba(245, 198, 107, 0.14)"
    borderColor: "rgba(245, 198, 107, 0.38)"
    textColor: "{colors.amber-soft}"
    rounded: "{rounded.full}"
    padding: "12px 20px"
  status-match:
    backgroundColor: "rgba(55, 214, 111, 0.12)"
    borderColor: "rgba(55, 214, 111, 0.34)"
    textColor: "{colors.match-green}"
    rounded: "{rounded.full}"
  status-alert:
    backgroundColor: "rgba(255, 107, 44, 0.12)"
    borderColor: "rgba(255, 107, 44, 0.42)"
    textColor: "{colors.orange-alert}"
    rounded: "{rounded.full}"
  file-folder:
    backgroundColor: "{colors.blue-folder}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
  toolbar-icon:
    backgroundColor: "rgba(255,255,255,0.06)"
    borderColor: "{colors.border}"
    rounded: "{rounded.full}"
---

# ENHE Forensic HUD Design System

## Overview

This direction turns the ENHE AI Tools website into a **cinematic intelligence console**. The supplied references are not traditional SaaS pages; they behave like a crime-lab operating system: evidence cards float above blurred scenes, folders sit inside frosted panels, IDs and authentication strings imply restricted access, and warm HUD overlays tell the user that the interface is analyzing something valuable.

For ENHE, the metaphor should shift from crime evidence to **tool evidence**: software packages, online utilities, payment proofs, VIP entitlement records, tutorials, and usage logs are treated as verified objects in an operations console. The result should feel premium, private, technical, and useful rather than like a commodity marketplace.

The structure follows the reference DESIGN format, but the visual language is new: dark green-black depth, glass panels, cream typography, cyan scan marks, amber warning states, and floating object cards. The design works especially well for admin dashboards, tool detail pages, file management, payment review, membership state, and product release management.

## Visual Characteristics Extracted From References

- **Cinematic blur as depth:** Most screenshots sit over a defocused video or scene layer. UI cards are sharp while background context is soft and moody.
- **Glass dossier panels:** Large rounded containers use dark translucent fills, thin warm borders, and high blur. They feel like secure system windows.
- **Evidence cards:** Cards have a title, ID, menu dots, large media preview, and a details footer. This maps cleanly to tools, files, tutorials, orders, and proof uploads.
- **Folder grids:** File-management screens use large icon grids with sparse labels and a left metadata rail. This is ideal for tool categories and uploaded packages.
- **HUD pills:** Timer/probability/status widgets use long rounded pills with glowing amber or orange outlines. These fit order status, refund state, review countdown, and VIP expiry.
- **Biometric overlays:** Face/fingerprint matching adds thin lines, rings, nodes, and status labels. For ENHE this becomes permission scanning, download verification, and tool readiness checks.
- **Warm technical typography:** Cream and muted gold text over dark green surfaces feels more cinematic than pure white/cyan tech UI.

## Design Principles

### 1. Treat Each Tool As An Asset

Computer software and online tools should be presented like verified intelligence assets: cover image, slug, ID, version, access requirement, status, usage, download count, and latest update. This makes the platform feel curated and proprietary.

### 2. Use Depth, Not Decoration

Depth comes from blur, scale, overlapping panels, and dim background silhouettes. Avoid unrelated ornamental blobs. Every visual layer should feel like part of a system: card stack, scan ring, file grid, timeline, or authentication layer.

### 3. Warm Contrast Over Neon Flood

The current ENHE site already uses cyan/blue. This direction reduces the amount of neon and adds cream, amber, olive, and deep green. Cyan remains a precise scan/accent color, not the entire palette.

### 4. Lists Become Operational Queues

Admin lists should read as queues: pending payment proofs, refund reviews, VIP expirations, tool release drafts, failed uploads. Use clear statuses and dense rows, but keep detail pages rich and dossier-like.

### 5. Motion Should Feel Instrumental

Animations should imply scanning, verifying, syncing, or unlocking: slow parallax, pulse rings, line sweeps, status glow, folder focus, and subtle card float. Avoid bouncy consumer animation.

## Colors

### Core Surfaces

- **Canvas** (`{colors.canvas}` / `#04100E`): Primary page background. It should feel like the unlit area behind a secure console.
- **Canvas Deep** (`{colors.canvas-deep}` / `#020706`): Vignette edges, modal scrims, and deep background gradients.
- **Canvas Soft** (`{colors.canvas-soft}` / `#0A1715`): Large background panels and quiet section bands.
- **Glass** (`{colors.glass}`): Main translucent panel fill. Use with blur and a warm border.
- **Glass Strong** (`{colors.glass-strong}`): Foreground cards and active objects.

### Text

- **Text** (`{colors.text}` / `#F4EEDA`): Primary text. Cream is preferred over pure white.
- **Text Soft** (`{colors.text-soft}` / `#C8BEA6`): Secondary headings and metadata.
- **Text Muted** (`{colors.text-muted}` / `#8E9B91`): Captions, IDs, inactive controls.
- **Text Dim** (`{colors.text-dim}` / `#59685F`): Low-priority labels and grid annotations.

### Accents

- **Cyan** (`{colors.cyan}` / `#35BEE7`): Scan lines, active handles, selected states, and technical links.
- **Match Green** (`{colors.match-green}` / `#37D66F`): Verified, approved, activated, matched.
- **Amber** (`{colors.amber}` / `#F5C66B`): Pending review, countdown, VIP expiry, warning-but-not-failure.
- **Orange Alert** (`{colors.orange-alert}` / `#FF6B2C`): Rejected, refund risk, destructive state, urgent attention.
- **Blue Folder** (`{colors.blue-folder}` / `#5EA7D7`): Folder/file icon fill.

## Typography

Use **Inter** or the current site font stack. The system should feel precise and cinematic:

- Large display text uses 56px / 650, tight line-height, and slightly negative tracking.
- Card titles use 20-28px, weight 620-650.
- Metadata uses 12-14px uppercase labels with wider tracking.
- Numeric HUD values use 48px with light-medium weight and spaced digits.
- Avoid overly heavy 800+ headings except for rare hero moments.

Chinese text should use the same hierarchy, with enough line-height to avoid dense blocks. English labels can appear as metadata, but critical user actions should remain localized.

## Layout

### Desktop Composition

The preferred desktop composition is a **three-layer scene**:

1. **Background layer:** Blurred scene, abstract gradient, or soft tool screenshots. Add a dark vignette.
2. **Operational shell:** A large glass panel or dashboard frame, usually offset rather than centered.
3. **Floating object layer:** Evidence/tool cards, folder clusters, scan overlays, and HUD pills.

### Suggested Page Templates

#### Home

- Left: brand statement and primary actions.
- Right: floating tool intelligence board with software card, online tool card, VIP status card, and permission scan.
- Background: slow mouse-reactive spotlight, not constant flowing animation.

#### Tool List

- Left rail: category/filter folders.
- Main area: evidence-card grid with cover images, tags, access badges, and metrics.
- Top bar: search, sort, view mode, status filters.

#### Tool Detail

- Header dossier: cover, tool ID, version, access status, category, VIP/download paid state.
- Main: content, screenshots, tutorial steps, FAQ, version log.
- Right rail: download/use action card with permission scan and entitlement state.

#### Admin Dashboard

- Left rail: admin navigation and auth state.
- Main: metric HUD, revenue trend, payment/refund queues, popular tools, recent uploads.
- Detail pages: one focused dossier per user/order/tool/file.

## Components

### Evidence Card

Use for tools, files, orders, tutorials, comments, payment proofs, and versions.

Required structure:

- Title
- Object ID or slug
- Optional menu dots
- Preview image or generated visual plate
- Details section
- Status chip
- Primary metric row

Visual rules:

- 28px radius.
- 20px internal padding.
- Preview area clips to 20px radius.
- Border is warm and subtle.
- Hover lifts 4-6px and increases border opacity.

### Dossier Card

Used for detail pages and large admin panels.

Rules:

- 28-42px radius depending on page scale.
- Can include a left metadata column and right content area.
- Use thin divider lines, not heavy table borders.
- Attach status and action pills at top-right.

### Folder Grid

Used for file management, categories, product versions, and tool bundles.

Rules:

- Folder icons should be large enough to scan.
- Use blue folder fill for normal items, amber folder for active/draft items.
- Use labels below the folder; do not overload cards with descriptions.
- Selected folders sit on a glass focus plate.

### Biometric / Permission Scan

Used for download checks, online tool launch checks, payment proof review, and VIP state.

Elements:

- concentric rings
- faint grid or node field
- crosshair lines
- small status nodes
- short green/cyan result label

Avoid fake security theater in copy. The scan is a visual metaphor; the server still performs actual permission checks.

### HUD Pill

Used for countdowns, review state, warning notices, refund conditions, and conversion stats.

Rules:

- Long pill with translucent amber/orange/cyan fill.
- Use one icon or short label, then value.
- Best for one-line operational signals.

### Toolbar

Use minimal icon-only controls inside a dark top rail:

- view mode
- filter
- sort
- search
- more

Each icon button is circular or pill-shaped with a low-contrast glass fill.

## Motion

Recommended motion:

- **Card float:** 10-16s slow translate cycle with very small distance.
- **Scan sweep:** linear horizontal or radial sweep every 4-6s.
- **Status pulse:** glow pulses only around active status chips.
- **Mouse spotlight:** subtle radial highlight following pointer.
- **Folder focus:** selected folder scales 1.02 and brightens.

Avoid:

- constant background waves
- large bouncing elements
- high-frequency neon flicker
- heavy 3D transforms that reduce text clarity

## Accessibility

- Cream text must maintain strong contrast over glass.
- Do not place small text directly over busy imagery; put a scrim or glass surface behind it.
- Status cannot rely only on color; pair with labels like Approved, Pending, Rejected.
- Interactive targets should be at least 44px high.
- Motion should respect `prefers-reduced-motion`.

## Do / Don't

### Do

- Use real tool covers or clean generated plates inside cards.
- Make orders, payment proofs, and refunds feel like traceable records.
- Use warm cream and amber to soften the dark technical palette.
- Keep admin pages operational and dense.

### Don't

- Copy violent evidence imagery into the ENHE product UI.
- Make everything cyan.
- Use traditional ecommerce product cards.
- Hide permission logic behind front-end-only buttons.
- Put long instructional copy inside decorative cards.

## Implementation Notes For ENHE

- Keep current dark ENHE base, but introduce the warmer `#F4EEDA` text and amber operational states.
- Use this direction first on admin dashboard, file management, tool detail, and payment review. These pages benefit most from the dossier/evidence metaphor.
- Front-office home and tool pages can use a lighter version: fewer panels, more cover images, and clearer action buttons.
- Tool cover upload should become essential: every evidence card needs a visual preview.
- The design system should coexist with existing Tailwind tokens by adding semantic utility classes such as `.glass-dossier`, `.evidence-card`, `.hud-pill`, `.scan-ring`, and `.folder-grid`.
