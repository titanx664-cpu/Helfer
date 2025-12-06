# Design Guidelines for Helfer AI Voice Assistant

## Design Approach
**Reference-Based Approach:** Neon sci-fi aesthetic as specifically requested, drawing inspiration from cyberpunk interfaces (e.g., Cyberpunk 2077 UI, sci-fi HUD designs) combined with modern chat applications like ChatGPT and Claude.

**Core Design Principles:**
- Futuristic neon aesthetic with glowing elements
- High contrast dark theme for optimal readability
- Smooth, purposeful animations for state transitions
- Clear visual feedback for voice interaction states

## Typography
**Font Families:**
- Primary: 'Orbitron' (Google Fonts) - futuristic headers and labels
- Secondary: 'Inter' or 'Space Grotesk' - chat messages and body text
- Monospace: 'JetBrains Mono' - timestamps and technical indicators

**Hierarchy:**
- App title: 2.5rem, bold, glowing neon effect
- Chat messages: 1rem, regular weight
- Timestamps: 0.75rem, monospace, reduced opacity
- Status indicators: 0.875rem, uppercase, letter-spacing

## Layout System
**Spacing Units:** Tailwind units of 2, 4, 6, and 8 (e.g., p-4, m-6, gap-8)

**Main Layout:**
- Split-screen: 60% chat area (left) / 40% avatar/visualizer area (right) on desktop
- Mobile: Stacked layout with avatar section collapsing to header
- Container: max-w-7xl centered with px-6 padding
- Chat area: Scrollable flex column with gap-4 between messages

## Component Library

### Chat Interface
**Message Bubbles:**
- User messages: Right-aligned, semi-transparent dark background with cyan/blue neon border (border-l-4)
- AI messages: Left-aligned, dark background with purple/magenta neon border
- Padding: p-4, rounded-lg corners
- Include avatar icon (16px circle) and timestamp

**Input Area:**
- Fixed bottom position with backdrop blur effect
- Floating design with rounded-2xl container
- Mic button: Large circular (64px), glowing neon ring when active
- Text input: Transparent background, neon bottom border, focus state with glow effect

### Avatar/Visualizer Section
**Helfer Avatar:**
- Large circular container (240px) centered vertically
- Concentric glowing rings with different animation states:
  - Idle: Slow pulsing single ring (cyan)
  - Listening: Dual rotating rings (cyan + blue)
  - Processing: Three spinning rings (purple + magenta + cyan)
  - Speaking: Expanding/contracting rings synced to audio

**Waveform Visualizer:**
- Positioned below avatar (200px height)
- Vertical bars arrangement (40-50 bars)
- Animated based on audio frequency data
- Gradient glow from base color (cyan to purple)

### Settings Panel
**Layout:**
- Slide-in overlay from right side (w-96)
- Dark backdrop with blur effect
- Organized sections with dividers

**Controls:**
- Voice Gender: Radio buttons with neon accent rings
- Voice Speed: Slider with glowing track and neon thumb
- Continuous Listening: Toggle switch with neon indicator
- Each setting group: mb-6 spacing

### Visual Effects & Animations
**Glow Effects:**
- Primary neon: Cyan (#00F5FF) with box-shadow blur
- Secondary neon: Magenta (#FF00FF) and purple (#9D00FF)
- Apply to borders, text, and interactive elements

**State Animations:**
- Wake phrase detection: Expanding ring pulse (0.8s duration, ease-out)
- Mic activation: Scale transform (1.0 to 1.1) with rotation
- Message appearance: Fade-in from bottom with slide (0.3s)
- Avatar transitions: Smooth ring morphing (0.5s cubic-bezier)

**Waveform Animation:**
- Real-time bar height adjustments based on audio amplitude
- Smooth transitions (0.1s) for responsive feel
- Gradient color shift during speaking state

### Status Indicators
- Listening: Animated sound wave icon with cyan glow
- Processing: Rotating spinner with purple gradient
- Speaking: Waveform bars with synchronized movement
- Error states: Red neon glow with shake animation

## Images
**No hero image required** - This is an application interface, not a marketing page. The neon avatar/visualizer section serves as the primary visual focal point.

## Accessibility Notes
- Maintain 4.5:1 contrast ratio for text despite dark theme
- Include ARIA labels for all voice interaction states
- Keyboard navigation support for all controls
- Screen reader announcements for AI responses

## Color Palette
While specific color values will be determined later, establish these semantic relationships:
- User interactions: Cyan/blue spectrum
- AI responses: Purple/magenta spectrum
- System states: Accent colors from the neon palette
- Backgrounds: Deep dark with subtle gradients