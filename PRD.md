
# Growing Us - Product Requirements Document (PRD)

## Overview
Growing Us is a relationship card game landing page designed to promote and sell a physical card game that helps couples strengthen their relationships through meaningful conversations.

## Technical Stack
- **Frontend**: React with TypeScript, Vite
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Routing**: Wouter

## Design System

### Colors
```css
:root {
  --warm-white: #FEFBF6;
  --deep-green: #2F4858;
  --deep-teal: #008080;
  --sunflower: #FFC700;
  --soft-tangerine: #F9A870;
  --deep-black: #1A1A1A;
}
```

### Typography
- **Primary Font**: Serif font for headings
- **Secondary Font**: Sans-serif for body text
- **Font Sizes**: Responsive scaling from mobile to desktop

### Visual Elements
- **Rounded corners**: 2xl radius for cards and buttons
- **Borders**: 4px solid black borders for card-like appearance
- **Shadows**: Drop shadows with black color
- **Animations**: Floating blobs, gentle hover effects, fade-in animations

## Page Structure

### 1. Header/Navigation
- **Logo**: Flower icon + "Relationship Retrospective" text
- **Sticky behavior**: Transforms on scroll with backdrop blur
- **CTA Button**: "Play Now" - opens pre-order modal
- **Responsive**: Collapses gracefully on mobile

### 2. Hero Section

#### Main Elements
- **Title**: "Growing Us" - Large serif font (5xl-8xl responsive)
- **Tagline**: Descriptive text about relationship nurturing
- **Interactive Card Stack**: Central feature with 5 cards
- **Primary CTA**: "Start to Grow Together for Free"
- **Free shipping notice**: Gift icon + text

#### Interactive Card Stack Specifications

**Card Data Structure**:
```typescript
interface CardData {
  id: number;
  title: string;
  description: string;
  image: string;
  gradient: string;
  hasUnderline?: boolean;
}
```

**Card Collection**:
1. **Better Half**
   - Description: "Learn how you complement each other"
   - Image: Background Deck Card
   - Has underline styling

2. **Elephant in the Room**
   - Description: "Playfully speak about friction"
   - Image: Elephant card
   - Has underline styling

3. **The Sunflower**
   - Description: "Reflect about how far you've come"
   - Image: Sunflower card
   - Has underline styling

4. **Early Bird**
   - Description: "Learn more about how you differ"
   - Image: Early Bird card
   - Has underline styling

5. **Magic Bean**
   - Description: "Leave something behind that grows"
   - Image: Magic Bean card
   - Has underline styling

**Interactive Behavior**:
- **Click to Cycle**: Cards advance on click (removed auto-cycling)
- **Stacking Effect**: 
  - Active card: scale(1), full opacity, z-index 10
  - Adjacent cards: scale(0.95), slight offset, lower opacity
  - Cards positioned with transform offsets for 3D stack effect
- **Smooth Transitions**: 1000ms ease-out duration
- **Visual Feedback**: Hover effects and floating animation

**Card Styling**:
- **Dimensions**: 288px × 432px
- **Border**: 4px solid black
- **Border Radius**: 2xl (rounded-2xl)
- **Shadow**: Large drop shadow (shadow-2xl)
- **Background**: Cover image with center positioning

**Description Display**:
- **Location**: Below card stack
- **Styling**: Italic text, responsive font sizes (lg-2xl)
- **Special Effect**: "Squiggly underline" for cards with hasUnderline: true
- **Animation**: Updates smoothly with card transitions

### 3. Background Elements
- **Animated Blobs**: 5 floating blob shapes with different colors
- **Positioning**: Absolute positioned across viewport
- **Animation**: Float animation with staggered delays
- **Colors**: Sunflower, soft tangerine, deep teal variations

### 4. How To Play Section
- **5 Steps**: Each with icon, title, and description
- **Visual Design**: Card-like containers with hover effects
- **Icons**: Sprout, Heart, Sun, Flower, Leaf
- **Layout**: Single column, staggered animations on scroll

### 5. Pricing Section
- **Two-column layout**: What's included + visual
- **Price**: $25 per deck
- **Included items**:
  - 50 illustrated cards
  - 5 instruction cards
  - 3 bonus cards
  - 1 custom box
- **Visual**: Featured card with rotation effect

### 6. Testimonials Section
- **3 testimonials**: Grid layout on desktop
- **Star ratings**: 5-star display
- **Card styling**: Consistent with design system

### 7. Final CTA Section
- **Centered layout**: Price + benefits
- **30-day guarantee**: Shield icon + text
- **Primary action**: Heart icon + "Let's Grow Together"

### 8. Footer
- **Brand info**: Logo + tagline
- **Links**: Instagram, Contact, FAQ
- **Copyright**: Simple text

## Functionality Requirements

### Pre-order System
- **Modal Interface**: Dialog component with form
- **Email Validation**: Zod schema validation
- **Benefits Display**: Early bird pricing and perks
- **Multiple Backends**:
  - Google Forms integration (static deployment)
  - Google Sheets API (static deployment)
  - Express API (full-stack deployment)
- **Success/Error Handling**: Toast notifications

### Form Specifications
```typescript
const insertPreorderSchema = createInsertSchema(preorders).pick({
  email: true,
}).extend({
  email: z.string().email("Please enter a valid email address"),
});
```

### Animation System
- **Intersection Observer**: Scroll-triggered animations
- **Fade-in Effects**: Staggered animations for sections
- **Hover States**: Lift effects, scale transforms
- **Floating Elements**: Continuous background animations with delays

### Responsive Design
- **Breakpoints**: Mobile-first approach
- **Text Scaling**: Responsive typography (sm:text-lg md:text-xl)
- **Layout Adjustments**: Grid to stack on mobile
- **Touch Interactions**: Optimized for mobile tapping

## Database Schema
```sql
CREATE TABLE preorders (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## API Endpoints
- `POST /api/preorders`: Create new pre-order
- Error handling for duplicate emails
- Input validation using Zod schemas

## Performance Considerations
- **Image Optimization**: Proper image sizing and formats
- **Lazy Loading**: Images load as needed
- **Animation Performance**: CSS transforms over layout changes
- **Bundle Size**: Code splitting and optimization

## SEO Requirements
- **Meta Tags**: Title, description, og tags
- **Semantic HTML**: Proper heading hierarchy
- **Alt Text**: All images have descriptive alt text
- **Clean URLs**: RESTful routing structure

## Accessibility Features
- **Keyboard Navigation**: All interactive elements accessible
- **Screen Reader Support**: Proper ARIA labels
- **Color Contrast**: WCAG compliant color combinations
- **Focus Management**: Visible focus indicators

## Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Graceful Degradation**: Progressive enhancement approach

## Asset Requirements
- **Card Images**: High-resolution PNGs (288×432 minimum)
- **Icons**: Lucide React icon library
- **Custom Graphics**: SVG squiggly underlines and decorative elements

## Animation Specifications

### Card Stack Animation
```css
.card-stack-item {
  transition: transform 1000ms ease-out;
  transform: 
    translateX(${offset * 8}px)
    translateY(${offset * 4}px)
    rotate(${offset * 3}deg)
    scale(${isActive ? 1 : 0.95});
}
```

### Hover Effects
```css
.hover-lift:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(47, 72, 88, 0.08);
}
```

### Background Blobs
```css
@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}
```

## Content Requirements
- **Copywriting**: Warm, relationship-focused tone
- **Card Descriptions**: Brief, engaging prompts
- **Testimonials**: Authentic customer feedback
- **Error Messages**: User-friendly validation text

## Deployment Configuration
- **Static Deployment**: Vite build configuration
- **Environment Variables**: Google Forms/Sheets integration
- **Build Process**: TypeScript compilation and asset optimization

This PRD provides complete specifications for recreating the Growing Us website with all interactive elements, including the detailed clickable card functionality in the hero section.
