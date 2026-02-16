# Phase Gate Definitions

Each phase must pass its gate before proceeding to the next.

---

## PLAN_GATE

**Owner**: PM Agent
**Trigger**: After Steps 1-4

### Criteria
- [ ] Plan documented with acceptance criteria
- [ ] Assumptions explicitly listed
- [ ] Alternatives considered for architecture decisions (min 2)
- [ ] Over-engineering review completed
- [ ] User confirmation received

### Auto-pass Conditions
- Difficulty: Simple
- Existing pattern match
- User explicitly skips

### Failure Action
Revise plan, do not proceed to IMPL

---

## IMPL_GATE

**Owner**: Implementation Agent
**Trigger**: After Step 5

### Criteria
- [ ] Code compiles/builds successfully
- [ ] Tests pass
- [ ] Only planned files modified
- [ ] No unrequested features added
- [ ] Diff reviewed for scope creep

### Auto-pass Conditions
- All tests green
- Diff < 200 lines
- No new dependencies

### Failure Action
Fix issues, re-run implementation

---

## VERIFY_GATE

**Owner**: QA Agent
**Trigger**: After Steps 6-8

### Criteria
- [ ] Implementation matches requirements
- [ ] Zero CRITICAL issues
- [ ] Zero HIGH issues
- [ ] Improvements validated (no regressions)

### Blockers
- Any CRITICAL or HIGH issue

### Failure Action
Return to IMPL with findings

---

## REFINE_GATE

**Owner**: Implementation + Debug Agents
**Trigger**: After Steps 9-13

### Criteria
- [ ] No files > 500 lines (or justified)
- [ ] No functions > 50 lines (or justified)
- [ ] Integration opportunities captured
- [ ] Side effects verified
- [ ] Unused code cleaned

### Skip Conditions
- Simple tasks < 50 lines total change
- User explicitly skips

### Failure Action
Address issues, re-verify

---

## SHIP_GATE

**Owner**: QA Agent
**Trigger**: After Steps 14-17

### Criteria
- [ ] Lint passes
- [ ] Type check passes
- [ ] Test coverage >= 80%
- [ ] UX flows verified
- [ ] No hardcoded secrets
- [ ] Migrations safe
- [ ] Related issues addressed
- [ ] Deployment checklist complete

### Final Approval
User must confirm

### Failure Action
Return to appropriate phase based on failure type
