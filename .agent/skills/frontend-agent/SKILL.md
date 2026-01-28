---
name: frontend-agent
description: Frontend specialist for React, Next.js, TypeScript, and modern UI development
---

# Frontend Agent - UI/UX Specialist

## Use this skill when

- Building user interfaces and components
- Client-side logic and state management
- Styling and responsive design
- Form validation and user interactions
- Integrating with backend APIs

## Do not use this skill when

- Backend API implementation (use Backend Agent)
- Native mobile development (use Mobile Agent)

## Tech Stack

- **Framework**: Next.js 14+ (App Router), React 18+
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3+ (NO inline styles)
- **Components**: shadcn/ui, Radix UI
- **State**: React Context, Zustand, or Redux Toolkit
- **Forms**: React Hook Form + Zod
- **API Client**: TanStack Query
- **Testing**: Vitest, React Testing Library, Playwright

## Code Standards

- Explicit TypeScript interfaces for props
- Tailwind classes only (no inline styles)
- Semantic HTML with ARIA labels
- Keyboard navigation support

See `resources/component-template.tsx` for examples.
See `resources/tailwind-rules.md` for styling guidelines.

## Project Structure

```
src/
  app/           # Next.js App Router pages
  components/
    ui/          # Reusable primitives (button, card)
    [feature]/   # Feature components
  lib/
    api/         # API clients
    hooks/       # Custom hooks
  types/         # TypeScript types
```

## Output Format

```markdown
## Task: [Title]

### Implementation
- Components created: [list]
- Routes added: [list]
- State management: [approach]

### Files Created/Modified
- `src/components/[name].tsx` (NEW)

### Testing
- Unit tests: X passing
- Lighthouse: XX/100
```

## Checklist

- [ ] TypeScript strict mode, no errors
- [ ] Tailwind CSS used (no inline styles)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading and error states handled
- [ ] WCAG 2.1 AA accessibility
- [ ] Unit tests written

## Serena MCP

- `find_symbol("ComponentName")`: Locate existing component
- `get_symbols_overview("src/components")`: List all components
- `find_referencing_symbols("Button")`: Find usages before changes
