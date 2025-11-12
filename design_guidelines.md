# Design Guidelines: WhatsApp QR Code Display Tool

## Design Approach
**System-Based Approach** using Material Design principles for utility-focused applications. This tool prioritizes clarity, functionality, and immediate usability over visual flair.

## Core Design Principles
1. **Function First**: QR code must be the immediate focal point
2. **Clear Status Communication**: User always knows what's happening
3. **Minimal Distraction**: Remove all non-essential elements
4. **Responsive Efficiency**: Works seamlessly on all devices

## Typography
- **Primary Font**: Inter or Vazir (for Persian support) via Google Fonts
- **Heading**: text-2xl to text-3xl, font-semibold
- **Body**: text-base, font-normal
- **Status Messages**: text-sm, font-medium
- **Buttons**: text-sm to text-base, font-semibold

## Layout System
**Spacing Units**: Use Tailwind units of 2, 4, 6, 8, and 12 consistently
- Component padding: p-6 to p-8
- Section gaps: gap-4 to gap-6
- Container margins: mx-4 to mx-8

**Structure**:
- Centered single-column layout, max-w-2xl
- Full viewport height (min-h-screen) with flex centering
- Generous breathing room around QR code display

## Component Library

### Primary Container
- Centered card with rounded corners (rounded-2xl)
- Elevated appearance with shadow (shadow-lg)
- Padding: p-8 to p-12
- Contains all functional elements in vertical stack

### QR Code Display Area
- Large, prominent centered container
- Square aspect ratio maintained
- Border for definition (border-2)
- Rounded corners (rounded-xl)
- Padding: p-6
- Loading skeleton when fetching

### Action Buttons
- **Primary Button** (Refresh QR): Full-width or prominent, rounded-lg, px-6 py-3
- **Secondary Actions**: Outlined style, same sizing
- Button group spacing: gap-3

### Status Indicators
- **Loading State**: Spinner with descriptive text below, centered
- **Error Messages**: Alert box with icon, rounded-lg, p-4, mb-4
- **Success Indicators**: Subtle check icon with text
- Position: Above QR code display

### Header Section
- App title/logo: text-2xl to text-3xl, mb-6
- Brief instruction text: text-sm, opacity-80, mb-8
- Centered alignment

### Footer (Optional Info)
- Small text (text-xs), centered
- Instructions or warnings about QR expiration
- mt-6

## Accessibility
- All interactive elements have clear focus states
- Status updates announced for screen readers
- High contrast for QR code display
- Touch-friendly button sizes (min 44px height)

## Animations
**Minimal and Purposeful Only**:
- Fade-in for QR code appearance (duration-300)
- Pulse for loading spinner
- NO scroll animations, parallax, or decorative motion

## Layout Specifications

### Desktop (lg and above)
- Container: max-w-2xl, centered
- QR code: max-w-md, large and clear
- Vertical spacing: space-y-6

### Tablet (md)
- Container: max-w-xl
- Maintain proportions
- Spacing: space-y-4

### Mobile (base)
- Container: mx-4, full-width minus margins
- QR code: Scales responsively within container
- Spacing: space-y-3
- Stack all elements vertically

## Images
**No hero images needed** - this is a pure utility tool. The QR code screenshot IS the primary visual element.

## Key UI States
1. **Initial Load**: Header + loading spinner + instruction text
2. **QR Displayed**: Header + QR code image + refresh button + expiration warning
3. **Error State**: Header + error message + retry button
4. **Refreshing**: Existing QR faded + loading overlay

## Persian/RTL Considerations
- Support RTL text direction where needed
- Ensure button text and instructions read naturally in Persian
- Icons should flip appropriately for RTL context