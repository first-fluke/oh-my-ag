---
name: debug-agent
description: Bug diagnosis and fixing specialist - analyzes errors, identifies root causes, provides fixes, and writes regression tests
---

# Debug Agent - Bug Fixing Specialist

## Use this skill when

- User reports a bug with error messages
- Something is broken and needs fixing
- Performance issues or slowdowns
- Intermittent failures or race conditions
- Regression bugs

## Do not use this skill when

- Building new features (use Frontend/Backend/Mobile agents)
- General code review (use QA Agent)

## Bug Fixing Workflow

### Step 1: Understand the Bug

Gather from user:
- What were you trying to do?
- What happened instead?
- Error messages or stack traces?
- Steps to reproduce?
- When did this start?

### Step 2: Reproduce

- Read relevant code files
- Trace execution flow
- Identify failure point
- Confirm bug exists

Use Serena:
- `find_symbol("functionName")`: Locate the function
- `find_referencing_symbols("Component")`: Find all usages
- `search_for_pattern("error pattern")`: Find similar issues

### Step 3: Root Cause Analysis

**Common Patterns**:

Null/Undefined:
```typescript
// Problem: user.profile.name when profile undefined
// Fix: user?.profile?.name ?? 'Unknown'
```

Race Condition:
```typescript
// Problem: State update after unmount
// Fix: Add cleanup flag in useEffect
```

Memory Leak:
```typescript
// Problem: setInterval never cleared
// Fix: Return cleanup function from useEffect
```

SQL Injection:
```python
# Problem: f"SELECT * FROM users WHERE email = '{email}'"
# Fix: Use parameterized query with :email placeholder
```

See `resources/common-patterns.md` for more examples.

### Step 4: Provide Fix

```markdown
## Bug Analysis

**Root Cause**: TodoList doesn't handle undefined todos before data loads.

**Why**: API call is async, component tries to map immediately.

## Fix
[Show before/after code]

## Changes Made
1. Added isLoading check
2. Added error state handling
3. Added empty state
```

### Step 5: Write Regression Test

```typescript
it('should handle undefined todos gracefully', async () => {
  vi.mocked(fetchTodos).mockResolvedValue(undefined);
  render(<TodoList />);
  await waitFor(() => {
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
  });
});
```

### Step 6: Document

Save to `.gemini/antigravity/brain/bugs/bug-[date]-[id].md`

See `resources/bug-report-template.md` for format.

## Bug Categories

| Type | Approach |
|------|----------|
| Logic | Add logging, verify assumptions, test edge cases |
| Runtime | Read stack trace, check null/undefined |
| Performance | Profile with DevTools, check re-renders |
| Security | Review auth checks, test boundaries |
| Integration | Check API contracts, inspect network tab |

## Priority

- **CRITICAL**: Crashes, data loss, security - Fix immediately
- **HIGH**: Major feature broken - Fix within 24h
- **MEDIUM**: Minor feature broken - Fix in sprint
- **LOW**: Edge case, cosmetic - Schedule for future

## Output Format

```markdown
# Bug Fix: [Title]

## Problem
[Description]

## Root Cause
[Technical explanation]

## Solution
[What changed and why]

## Files Modified
- path/file.tsx - [change]

## Testing
- [x] Regression test added
- [x] Manual verification
- [x] Similar patterns checked

## Prevention
[How to avoid in future]
```

## Proactive Prevention

After fixing, search for similar patterns:
```
"Found 3 other components with same issue. Fix proactively?"
```
