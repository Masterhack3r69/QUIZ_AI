# Shadcn Components Reference

This document lists useful shadcn components available for the Quiz AI project.

## Form & Input Components

### Basic Inputs
- **input** - Text input fields
- **label** - Form labels
- **textarea** - Multi-line text input
- **checkbox** - Checkbox input
- **switch** - Toggle switch
- **slider** - Range slider (✅ Currently used)
- **radio-group** - Radio button groups

### Advanced Inputs
- **calendar** - Date picker calendar
- **date-picker** - Date selection component
- **combobox** - Searchable dropdown
- **select** - Dropdown select
- **tags** - Tag input with autocomplete
- **color-picker** - Color selection
- **dropzone** - File upload area

### Selection Components
- **choicebox** - Radio-style card selection (✅ Currently used for presets)
- **pill** - Badge-style selection pills

## Layout Components

### Containers
- **card** - Content container (✅ Currently used)
- **dialog** - Modal dialogs (✅ Currently used)
- **sheet** - Slide-out panels
- **popover** - Floating content (✅ Currently used)
- **accordion** - Collapsible sections
- **tabs** - Tabbed interface (✅ Currently used)

### Navigation
- **navbar-01** to **navbar-18** - Various navbar styles
- **breadcrumb** - Navigation breadcrumbs
- **pagination** - Page navigation
- **menu-dock** - Dock-style menu
- **dock** - macOS-style dock

## Display Components

### Data Display
- **table** - Data tables
- **badge** - Status badges (✅ Currently used)
- **avatar** - User avatars
- **avatar-group** - Multiple avatars
- **progress** - Progress bars (✅ Currently used)
- **skeleton** - Loading placeholders (✅ Currently used)

### Charts (Multiple variants available)
- **area-chart-01** to **area-chart-10**
- **bar-chart-01** to **bar-chart-10**
- **line-chart-01** to **line-chart-10**
- **pie-chart-01** to **pie-chart-11**
- **radar-chart-01** to **radar-chart-12**

### Status & Feedback
- **alert** - Alert messages (✅ Currently used)
- **toast** - Notification toasts
- **status** - Status indicators
- **rating** - Star ratings
- **spinner** - Loading spinners

## Interactive Components

### Buttons
- **button** - Standard buttons (✅ Currently used)
- **icon-button** - Icon-only buttons
- **flip-button** - Animated flip button
- **ripple-button** - Material ripple effect
- **liquid-button** - Liquid animation
- **magnetic-button** - Magnetic hover effect
- **corner-accent-button** - Corner accent style

### Special Effects
- **animated-tooltip** - Animated tooltips
- **animated-modal** - Modal with animations
- **hover-card** - Hover preview cards
- **context-menu** - Right-click menus
- **command** - Command palette

## Text & Typography

### Text Effects
- **gradient-text** - Gradient colored text
- **animated-text** - Text animations
- **blur-text** - Blur effect text
- **glitch-text** - Glitch effect
- **scrambled-text** - Scramble animation
- **typing-text** - Typewriter effect
- **counting-number** - Animated counters
- **highlight-text** - Text highlighting

## Background & Visual Effects

### Backgrounds
- **background-gradient** - Gradient backgrounds
- **background-beams** - Light beam effects
- **dot-pattern** - Dot pattern background
- **grid-pattern** - Grid pattern background
- **retro-grid** - Retro grid effect
- **wavy-background** - Wave animations

### Particles & Effects
- **particles** - Particle effects
- **meteors** - Meteor shower effect
- **shooting-stars** - Shooting stars
- **sparkles** - Sparkle effects
- **ripple** - Ripple animations
- **fireworks-background** - Fireworks effect

## Specialized Components

### Media
- **video-player** - Video player
- **image-crop** - Image cropping
- **image-zoom** - Image zoom viewer
- **qr-code** - QR code generator

### Code & Development
- **code-block** - Syntax highlighted code
- **code-editor** - Code editor
- **terminal** - Terminal emulator
- **snippet** - Code snippets

### Productivity
- **calendar** - Full calendar
- **mini-calendar** - Compact calendar
- **gantt** - Gantt chart
- **kanban** - Kanban board
- **list** - Task lists

### 3D & Advanced
- **3d-card** - 3D card effects
- **3d-pin** - 3D pin effect
- **iphone-15-pro** - iPhone mockup
- **safari** - Safari browser mockup

## Recommended for Quiz AI Project

### High Priority
1. **choicebox** - ✅ Already implemented for presets
2. **slider** - ✅ Already implemented for distribution
3. **calendar** - For quiz scheduling
4. **rating** - For quiz feedback
5. **progress** - For quiz completion
6. **countdown** - For quiz timer

### Medium Priority
7. **table** - For results display
8. **bar-chart** / **pie-chart** - For analytics
9. **status** - For quiz status indicators
10. **tags** - For subject categorization
11. **combobox** - For searchable dropdowns
12. **sheet** - For side panels

### Nice to Have
13. **animated-tooltip** - Better UX hints
14. **gradient-text** - Enhanced headings
15. **sparkles** - Success celebrations
16. **confetti** - Quiz completion effect
17. **avatar-group** - Student participation display

## Installation Command

To add any component:
```bash
npx shadcn@latest add <component-name>
```

Or from registry URL:
```bash
npx shadcn@latest add https://www.shadcn.io/registry/<component-name>.json
```

## Current Usage in Project

✅ **Already Implemented:**
- button
- card
- input
- label
- tabs
- badge
- progress
- skeleton
- alert
- dialog
- slider
- choicebox
- switch
- separator

## Notes

- All components are fully customizable with Tailwind CSS
- Components follow accessibility best practices
- Dark mode support included
- TypeScript types included
- Can be used with React Server Components
