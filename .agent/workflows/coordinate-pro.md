---
description: Thorough version of coordinate - high-quality development workflow with 11 review steps out of 17
---

# MANDATORY RULES — VIOLATION IS FORBIDDEN

- **Response language follows `language` setting in `.agent/config/user-preferences.yaml` if configured.**
- **NEVER skip steps.** Execute all review steps in order. Report completion of each step to user.
- **You MUST use MCP tools throughout the entire workflow.**
- **Follow multi-review protocol.** See `_shared/multi-review-protocol.md`.

---

## Phase 0: Initialization (DO NOT SKIP)

1. Read `_shared/multi-review-protocol.md` (11 review guides)
2. Read `_shared/quality-principles.md` (4 principles)
3. Read `_shared/phase-gates.md` (gate definitions)
4. Record session in memory: `session-coordinate-pro.md`

---

## Phase 1: PLAN (Steps 1-4)

### Step 1: Create Plan
Activate PM Agent → Requirements analysis, task decomposition, architecture design

### Step 2: Plan Review (Completeness)
- **Question**: "Is anything missing?"
- Verify requirements mapped to plan items

### Step 3: Review Verification (Meta Review)
- **Question**: "Was the review done properly?"
- Self-verify Step 2 review was sufficient

### Step 4: Over-Engineering Review (Simplicity)
- **Question**: "Is this over-engineered?"
- Ask "Is this needed for MVP?" for each component
- Remove speculative features

### PLAN_GATE
- [ ] Plan documented
- [ ] Assumptions listed
- [ ] Alternatives considered
- [ ] Over-engineering review done
- [ ] **User confirmation**

**Gate failure → Return to Step 1**

---

## Phase 2: IMPL (Step 5)

### Step 5: Implementation
Spawn agents → Implement according to plan

### IMPL_GATE
- [ ] Build succeeds
- [ ] Tests pass
- [ ] Only planned files modified

**Gate failure → Re-run Step 5**

---

## Phase 3: VERIFY (Steps 6-8)

### Step 6: Alignment Review
- **Question**: "Did we build what was requested?"
- Compare plan vs implementation 1:1

### Step 7: Security/Bug Review (Safety)
- **Question**: "Is there anything dangerous?"
- Tools: npm audit, bandit, lighthouse
- OWASP Top 10 check

### Step 8: Improvement Review (Regression Prevention)
- **Question**: "Did improvements break anything?"
- Run all existing tests
- Verify existing features work

### VERIFY_GATE
- [ ] Implementation = Requirements
- [ ] CRITICAL count: 0
- [ ] HIGH count: 0
- [ ] No regressions

**Gate failure → Return to Step 5 (fix implementation)**

---

## Phase 4: REFINE (Steps 9-13)

### Step 9: Split Large Files/Functions
- Files > 500 lines → Split
- Functions > 50 lines → Split

### Step 10: Integration/Reuse Review (Reusability)
- **Question**: "Can we leverage existing code?"
- Check for similar functions/components
- Integrate if reusable

### Step 11: Side Effect Review (Cascade Impact)
- **Question**: "Did we break anything elsewhere?"
- Use `find_referencing_symbols` for impact scope

### Step 12: Full Change Review (Consistency)
- **Question**: "Is everything harmonious?"
- Review complete diff
- Check naming, style consistency

### Step 13: Clean Up Unused Code
- Remove dead code created by this implementation
- Don't touch pre-existing dead code

### REFINE_GATE
- [ ] No large files/functions
- [ ] Integration opportunities captured
- [ ] Side effects verified
- [ ] Code cleaned

**Skip conditions**: Simple tasks < 50 lines

---

## Phase 5: SHIP (Steps 14-17)

### Step 14: Code Quality Review
- **Question**: "Does it meet quality standards?"
- lint, type check, coverage >= 80%
- Run `_shared/common-checklist.md`

### Step 15: UX Flow Verification
- End-to-end user journey test
- Check error states
- Accessibility verification

### Step 16: Related Issues Review (Cascade Impact 2nd)
- Check issues discovered during review
- Verify related areas not broken
- Document deferred items

### Step 17: Deployment Readiness Review (Final)
- **Question**: "Is this ready to deploy?"
- No secrets exposed
- Environment variables documented
- Migrations safe

### SHIP_GATE
- [ ] Quality checks pass
- [ ] UX verified
- [ ] Related issues resolved
- [ ] Deployment checklist complete
- [ ] **User final approval**

---

## Review Steps Summary

| Phase | Review Steps | Perspective |
|-------|-------------|-------------|
| PLAN | 2, 3, 4 | Completeness, Meta, Simplicity |
| VERIFY | 6, 7, 8 | Alignment, Safety, Regression |
| REFINE | 10, 11, 12 | Reusability, Cascade, Consistency |
| SHIP | 14, 15, 16, 17 | Quality, UX, Cascade 2nd, Deploy |

**Total 11 review steps → High quality guaranteed**
