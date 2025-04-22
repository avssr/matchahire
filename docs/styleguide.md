# 🎨 MatchaHire Design System

## Typography

### Font Stack
- Primary: Space Grotesk
- Backup: Inter, sans-serif
- Icons: HeroIcons, Phosphor, Feather

### Type Scale
| Element | Font | Size | Weight | Notes |
|--------|------|------|--------|-------|
| Heading 1 | Space Grotesk | 36px | 700 | Page titles |
| Heading 2 | Space Grotesk | 28px | 600 | Section titles |
| Body | Inter | 16px | 400 | Main content |
| Small | Inter | 14px | 400 | Labels, Meta |

All font sizes use `rem` with responsive scaling.

## Color System

### Core Colors
| Token | Hex | Use |
|-------|-----|-----|
| `primary` | `#3CBA83` | CTA, Highlights |
| `accent` | `#1F4F3D` | Headers, Tags |
| `background` | `#F4FDF9` | Page, cards |
| `text-main` | `#1B1B1B` | Primary Text |
| `border` | `#E2E8F0` | Dividers, Cards |
| `highlight` | `#E9C46A` | Chat, Interactions |
| `calm` | `#A5D8FF` | Optional Sub-Accents |

### Usage in Tailwind
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3CBA83',
        accent: '#1F4F3D',
        background: '#F4FDF9',
        'text-main': '#1B1B1B',
        border: '#E2E8F0',
        highlight: '#E9C46A',
        calm: '#A5D8FF',
      },
    },
  },
}
```

## Spacing & Layout

### Spacing Scale
| Token | Value | Use |
|-------|-------|-----|
| `spacing-sm` | 0.5rem | Card padding, label offset |
| `spacing-md` | 1rem | Button padding, section spacing |
| `spacing-lg` | 2rem | Page blocks, form spacing |

### Container Rules
- Max width: `1200px`
- Page gutters: `1.5rem`
- Responsive breakpoints:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

## Components

### Buttons

#### Variants
```tsx
// Primary Button
<Button variant="primary">Submit</Button>

// Secondary Button
<Button variant="secondary">Cancel</Button>

// Ghost Button
<Button variant="ghost">Learn More</Button>
```

#### States
```tsx
// Loading State
<Button loading>Processing...</Button>

// Disabled State
<Button disabled>Not Available</Button>

// Success State
<Button success>Submitted!</Button>
```

### Forms

#### Input Fields
```tsx
// Basic Input
<FormField label="Email" type="email" />

// With Helper Text
<FormField 
  label="Password" 
  type="password"
  helper="Must be at least 8 characters"
/>

// With Error
<FormField 
  label="Username"
  error="Username is required"
/>
```

### Cards

#### Usage
```tsx
// Basic Card
<Card>
  <CardHeader>Role Title</CardHeader>
  <CardContent>Description</CardContent>
  <CardFooter>
    <Button variant="primary">Apply</Button>
  </CardFooter>
</Card>

// With Tags
<Card>
  <CardHeader>
    <h3>Role Title</h3>
    <StatusTag type="Open" />
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### Status Tags

#### Types
```tsx
// Role Status
<StatusTag type="Open" />    // Green
<StatusTag type="Closed" />  // Red
<StatusTag type="Upcoming" /> // Yellow

// AI Status
<StatusTag type="AI Persona" /> // Blue
```

### Modals

#### Usage
```tsx
// Basic Modal
<Modal>
  <ModalHeader>Title</ModalHeader>
  <ModalContent>Content</ModalContent>
  <ModalFooter>
    <Button variant="secondary">Close</Button>
    <Button variant="primary">Confirm</Button>
  </ModalFooter>
</Modal>

// Chat Modal
<ChatModal>
  <ChatHeader>
    <StatusTag type="AI Persona" />
  </ChatHeader>
  <ChatContent>
    <MessageList />
    <MessageInput />
  </ChatContent>
</ChatModal>
```

## Animations (Blocked by T0.6)

### Framer Motion Patterns
```tsx
// Button Hover
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.2 }}
>
  Click Me
</motion.button>

// Modal Transitions
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 20 }}
  transition={{ duration: 0.3 }}
>
  <ModalContent />
</motion.div>
```

### Loading States
```tsx
// Chat Typing Indicator
<motion.div
  animate={{ 
    scale: [1, 1.2, 1],
    opacity: [0.5, 1, 0.5]
  }}
  transition={{ 
    duration: 1,
    repeat: Infinity
  }}
>
  <Dot />
</motion.div>
```

## Error States

### Form Errors
```tsx
// Input with Error
<FormField
  label="Email"
  error="Invalid email format"
  className="border-error"
>
  <Input />
  <ErrorText>{error}</ErrorText>
</FormField>
```

### API Error States
```tsx
// Error Modal
<ErrorModal
  title="Connection Error"
  message="Failed to connect to server"
  action="Retry"
  onAction={retryConnection}
/>
```

### Loading States
```tsx
// Skeleton Loader
<SkeletonLoader>
  <SkeletonCard />
  <SkeletonText />
</SkeletonLoader>
```

## Component Updates (Blocked by T0.7)

### Button Component
```tsx
// Updated with Error States
<Button
  variant="primary"
  loading={isLoading}
  error={error}
  disabled={disabled}
>
  {children}
</Button>
```

### Chat Components
```tsx
// Chat Message
<ChatMessage
  type="user"
  error={error}
  loading={loading}
>
  {content}
</ChatMessage>
```

## Accessibility Updates

### Error Handling
- All error states must be announced to screen readers
- Error messages must be programmatically associated with inputs
- Error states must maintain WCAG contrast ratios

### Loading States
- Loading indicators must be announced to screen readers
- Loading states must not trap keyboard focus
- Loading content must be properly labeled

## Recent Updates
- Added animation patterns (pending T0.6)
- Added error state documentation
- Updated component patterns
- Enhanced accessibility guidelines

## Accessibility

### Requirements
- All interactive elements must be keyboard accessible
- Color contrast meets WCAG AA standards
- ARIA labels for all form fields
- Focus states visible for all interactive elements
- Skip links for main navigation

### Implementation
```tsx
// Accessible Button
<Button 
  aria-label="Submit application"
  role="button"
  tabIndex={0}
>
  Submit
</Button>

// Accessible Form
<FormField
  label="Email"
  aria-required="true"
  aria-describedby="email-help"
/>
```

## File Structure

```
/components/
  ├── ui/
  │   ├── Button.tsx
  │   ├── Input.tsx
  │   ├── FormField.tsx
  │   ├── Card.tsx
  │   ├── Modal.tsx
  │   ├── StatusTag.tsx
  │   ├── Loader.tsx
  │   └── Tooltip.tsx
  ├── layout/
  │   ├── Header.tsx
  │   └── Footer.tsx
  └── branding/
      └── Logo.tsx
```

## Best Practices

1. **Component Usage**
   - Always use the provided components
   - Don't override styles unless necessary
   - Follow the component API

2. **Responsive Design**
   - Mobile-first approach
   - Use Tailwind's responsive utilities
   - Test on all breakpoints

3. **Performance**
   - Lazy load modals and heavy components
   - Optimize images and assets
   - Use CSS transitions over JavaScript animations

4. **Accessibility**
   - Test with screen readers
   - Ensure keyboard navigation
   - Maintain color contrast

5. **Code Quality**
   - Use TypeScript
   - Follow component documentation
   - Add proper comments and JSDoc 

## Component Documentation Requirements

### Required Fields for Each Component
```markdown
## Component Name
- **File Path**: `/components/[category]/ComponentName.tsx`
- **Dependencies**: List of required packages
- **Props**: TypeScript interface
- **Variants**: Available style variants
- **Accessibility**: ARIA requirements
- **Usage Notes**: Important implementation details
```

### Example Component Documentation
```markdown
## Button
- **File Path**: `/components/ui/Button.tsx`
- **Dependencies**: framer-motion, class-variance-authority
- **Props**:
  ```tsx
  interface ButtonProps {
    variant: 'primary' | 'secondary' | 'ghost';
    size: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
  }
  ```
- **Variants**:
  - Primary: Green gradient with hover effect
  - Secondary: Outline with border
  - Ghost: Transparent with hover state
- **Accessibility**:
  - ARIA labels for loading/disabled states
  - Keyboard focus visible
  - Screen reader announcements
- **Usage Notes**:
  - Always provide loading state for async actions
  - Use ghost variant for secondary actions
  - Maintain consistent spacing in button groups
```

## Development Hygiene Rules

### Component Creation Checklist
1. Check `task-rules.md` for existing task
2. Add component documentation to style guide
3. Use centralized design tokens
4. Add TypeScript interfaces
5. Include accessibility features
6. Document variants and props
7. Add usage examples
8. Update changelog

### File Organization
```
/components/
  ├── ui/           # Reusable UI components
  ├── layout/       # Layout components
  ├── forms/        # Form components
  ├── chat/         # Chat-specific components
  └── branding/     # Brand-specific components
```

### Design Token Usage
```tsx
// ✅ Correct: Using theme tokens
<Button className="bg-primary text-white" />

// ❌ Incorrect: Hardcoded values
<Button className="bg-[#3CBA83] text-[#FFFFFF]" />
```

## Changelog Requirements

### Format
```markdown
## [Date] - Component Updates
- Added: New component or feature
- Changed: Modified existing component
- Fixed: Bug fixes or improvements
- Deprecated: Components to be removed
```

### Example
```markdown
## [2024-03-20] - Button Component
- Added: Loading state animation
- Changed: Updated hover effects
- Fixed: Accessibility contrast issues
- Deprecated: Old variant styles
```

## Recent Updates
- Added component documentation requirements
- Enhanced development hygiene rules
- Added changelog format
- Updated file organization guidelines 

## Chat UI Components

### Message Bubbles
```tsx
// User Message
<MessageBubble
  type="user"
  content={message}
  timestamp={time}
  status="delivered"
/>

// AI Message
<MessageBubble
  type="ai"
  content={message}
  timestamp={time}
  status="typing"
/>
```

### Input Area
```tsx
<ChatInput
  value={message}
  onChange={handleChange}
  onSend={handleSend}
  onFileUpload={handleFileUpload}
  maxLength={500}
  placeholder="Type your message..."
  loading={isLoading}
  error={error}
/>
```

### Status Indicators
```tsx
// Connection Status
<ConnectionStatus
  status={connectionStatus}
  lastSeen={lastSeen}
/>

// Typing Indicator
<TypingIndicator
  visible={isTyping}
  dots={3}
/>

// Message Status
<MessageStatus
  status="sending" | "delivered" | "read" | "error"
  timestamp={time}
/>
```

## UI Implementation Guidelines

### Typography Implementation
```css
/* Space Grotesk for Headings */
@font-face {
  font-family: 'Space Grotesk';
  src: url('/fonts/SpaceGrotesk-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}

/* Inter for Body */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
```

### Color Implementation
```css
:root {
  --primary: #3CBA83;
  --accent: #1F4F3D;
  --background: #F4FDF9;
  --text-main: #1B1B1B;
  --border: #E2E8F0;
  --highlight: #E9C46A;
  --calm: #A5D8FF;
}
```

### Component States
```tsx
// Loading State
<Button
  loading={isLoading}
  loadingText="Processing..."
  className="opacity-75"
/>

// Error State
<FormField
  error={error}
  errorMessage="Please enter a valid email"
  className="border-error"
/>

// Success State
<Button
  success={isSuccess}
  successText="Success!"
  className="bg-success"
/>
```

## Accessibility Guidelines

### Chat-Specific Accessibility
- Announce new messages to screen readers
- Provide keyboard navigation for chat history
- Ensure proper ARIA labels for status indicators
- Maintain focus management in chat input

### Error Handling
- Clear error messages
- Visual error indicators
- Screen reader announcements
- Recovery options

## Recent Updates
- Added chat UI components
- Enhanced typography implementation
- Added component states
- Updated accessibility guidelines 

## UI Patterns & Animations

### Button Interactions
```tsx
// Basic Button
<Button variant="primary">
  Click Me
</Button>

// Loading State
<Button loading>
  Processing...
</Button>

// Success State
<Button success>
  Success!
</Button>
```

### Header & Navigation
```tsx
// Sticky Header
<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
  <nav className="container flex h-16 items-center justify-between">
    {/* Logo */}
    <Link href="/">
      <Image src="/logo.svg" alt="Logo" width={32} height={32} />
    </Link>
    
    {/* Navigation */}
    <div className="flex items-center space-x-4">
      <Link href="/roles">
        <Button variant="ghost">Find Roles</Button>
      </Link>
      <Link href="/company">
        <Button variant="primary">For Companies</Button>
      </Link>
    </div>
  </nav>
</header>
```

### Loading States
```tsx
// Button Loading
<Button loading>
  <div className="flex items-center gap-2">
    <LoadingSpinner />
    Processing...
  </div>
</Button>

// Page Loading
<div className="flex items-center justify-center min-h-screen">
  <LoadingSpinner size="lg" />
</div>
```

### Error States
```tsx
// Form Error
<FormField error="Invalid input">
  <Input />
  <ErrorText>Please enter a valid value</ErrorText>
</FormField>

// API Error
<ErrorModal
  title="Connection Error"
  message="Failed to connect to server"
  action="Retry"
  onAction={retryConnection}
/>
```

## Implementation Guidelines

### Animation Principles
1. Subtle and purposeful
2. Consistent timing (200-300ms)
3. Smooth transitions
4. Performance optimized
5. Accessible alternatives

### Component States
- Default
- Hover
- Focus
- Active
- Disabled
- Loading
- Error
- Success

### Responsive Design
- Mobile-first approach
- Fluid typography
- Flexible layouts
- Touch-friendly targets
- Consistent spacing

## Recent Updates
- Added button interactions
- Enhanced header patterns
- Updated loading states
- Improved error handling
- Added responsive guidelines 