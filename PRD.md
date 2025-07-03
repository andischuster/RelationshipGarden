
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
- **Logo**: Flower icon + "Relationship Game" text
- **Sticky behavior**: Transforms on scroll with backdrop blur
- **CTA Button**: "Play Now" - opens pre-order modal
- **Responsive**: Collapses gracefully on mobile

### 2. Hero Section

#### Main Elements
- **Title**: "Growing Us" - Large serif font (5xl-8xl responsive)
- **Tagline**: Descriptive text about relationship nurturing
- **Interactive Card Stack**: Central feature with 5 cards
- **Primary CTA**: "Let's Grow Together – $25" button
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

## Interactive Activity Generator Feature

### Overview
A interactive lead generation feature transforms the main CTA into a chatbox. When clicked, the existing card stack performs a flipping animation to reveal an activity generator interface that helps couples get personalized relationship activity suggestions.

### Feature Specifications

#### Card Flip Animation
- **Trigger**: Click on "Start to Grow Together for Free" button
- **Animation**: 3D card flip effect using CSS transforms
- **Duration**: 800ms with easing function
- **Behavior**: Current card stack container flips to reveal chat input interface in simple design
- **Fallback**: Graceful degradation for reduced motion preferences

#### Activity Generator Interface

**Input Collection**:
- **Partner 1 Prompt**: "Get started for free. What would you like to improve or experience in your relationship?" Transition to next card after Input. 
- **Partner 2 Prompt**: "What would your partner like to improve or experience?" Transition to next card.
- **Input Method**: Text areas with placeholder text and character limits
- **Validation**: Required fields with helpful error messaging
- **Progressive Disclosure**: Show Partner 2 input after Partner 1 completion

**Activity Generation**:
- **Activity Suggestion**: Personalized romantic/meaningful activity based on combined input using AI agent.
- **Conversation Prompts**: Include tailored discussion starters with each activity
- **Visual Design**: Maintain card aesthetic with new content

**Email Capture**:
- **CTA**: "Send this activity to your email"
- **Form**: Simple email input with validation
- **Optional Newsletter**: Checkbox for relationship tips signup
- **Delivery**: Send activity details via existing email system

#### Technical Implementation

**Component Structure**:
```typescript
interface ActivityGeneratorState {
  isFlipped: boolean;
  partner1Input: string;
  partner2Input: string;
  generatedActivity: ActivitySuggestion | null;
  emailCaptured: boolean;
}

interface ActivitySuggestion {
  id: string;
  title: string;
  description: string;
  conversationPrompts: string[];
  estimatedTime: string;
  category: 'communication' | 'intimacy' | 'fun' | 'growth';
}
```

**Animation CSS**:
```css
.card-flip-container {
  perspective: 1000px;
  transform-style: preserve-3d;
}

.card-flip-inner {
  transition: transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);
  transform-style: preserve-3d;
}

.card-flip-inner.flipped {
  transform: rotateY(180deg);
}

.card-front, .card-back {
  backface-visibility: hidden;
  position: absolute;
  width: 100%;
  height: 100%;
}

.card-back {
  transform: rotateY(180deg);
}
```

**Activity Database Schema**:
```typescript
interface ActivityTemplate {
  id: string;
  title: string;
  description: string;
  tags: string[];
  conversationPrompts: string[];
  estimatedTime: string;
  category: ActivityCategory;
  difficultyLevel: 'easy' | 'medium' | 'deep';
}
```

#### User Flow Updates

**New Primary Flow**:
1. **Landing**: User sees "Start to Grow Together for Free" CTA
2. **Flip Animation**: Click triggers card stack flip animation
3. **Partner 1 Input**: First partner enters relationship goal/desire
4. **Partner 2 Input**: Second partner enters their input
5. **Generation**: Brief processing with encouraging messaging
6. **Activity Display**: Show personalized activity with conversation prompts
7. **Email Capture**: Optional email submission for activity delivery
8. **Soft Conversion**: Present card game offer as "Want more activities like this?"

**Secondary Flow (Existing)**:
- Maintain existing product showcase and purchase flow
- Position as "explore more" or secondary navigation option
- Keep existing pricing section and testimonials

#### Content Requirements

**Activity Templates** (Sample Categories):
- **Communication**: Deep conversation starters, active listening exercises
- **Intimacy**: Physical and emotional connection activities
- **Fun**: Playful adventures, shared hobbies, date ideas
- **Growth**: Goal-setting exercises, vision alignment activities

**Messaging Updates**:
- **Hero Headline**: "Discover Your Next Meaningful Moment Together"
- **Subheading**: "Get a personalized activity suggestion in 2 minutes"
- **Primary CTA**: "Start to Grow Together for Free"
- **Secondary CTA**: "Explore Our Card Game" (existing purchase flow)

**Email Templates**:
- **Subject**: "Your personalized relationship activity from Growing Us"
- **Content**: Activity details, conversation prompts, soft product introduction
- **Follow-up**: Nurture sequence introducing the card game

#### Success Metrics

**Engagement Metrics**:
- Click-through rate on new primary CTA
- Completion rate of activity generator flow
- Time spent on activity generator interface
- Email capture conversion rate

**Lead Generation Metrics**:
- Email signups from activity generator
- Newsletter subscription rate
- Follow-up email engagement rates
- Conversion from leads to product purchases

**User Experience Metrics**:
- Activity generator satisfaction ratings
- User feedback on suggested activities
- Bounce rate comparison before/after implementation
- Mobile vs desktop usage patterns

#### Implementation Phases

**Phase 1: Core Functionality**
- Card flip animation implementation
- Basic input collection interface
- Simple activity suggestion algorithm
- Email capture integration

**Phase 2: Enhanced Experience**
- Improved activity matching logic
- Better visual design and animations
- A/B testing for conversion optimization
- Analytics implementation

**Phase 3: Advanced Features**
- User accounts for saving activities
- More sophisticated personalization
- Integration with existing pre-order system
- Performance optimization

#### Mobile Considerations
- **Touch-friendly**: Large tap targets for mobile users
- **Responsive Animation**: Optimized flip animation for mobile devices
- **Input Experience**: Mobile-optimized text areas and keyboards
- **Performance**: Smooth animations on lower-end devices

#### Accessibility Requirements
- **Screen Reader Support**: Proper ARIA labels for flip animation states
- **Keyboard Navigation**: Full keyboard accessibility for input flow
- **Reduced Motion**: Respect `prefers-reduced-motion` settings
- **Color Contrast**: Maintain WCAG compliance in new interface elements

This PRD provides complete specifications for recreating the Growing Us website with all interactive elements, including the detailed clickable card functionality in the hero section and the new interactive activity generator feature.
