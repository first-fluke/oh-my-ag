# Quality Score Continuum

Replaces binary PASS/FAIL gate evaluation with a **continuous quantitative score** (0-100).
Inspired by autoresearch's val_bpb metric: objective, comparable, and trackable over time.

---

## Score Dimensions

| Dimension | Weight | Measurement Method | Measurer |
|-----------|--------|--------------------|----------|
| **Correctness** | 0.30 | Structured test result pass rate | Agent runs the project test command |
| **Security** | 0.25 | OWASP checklist completion rate | QA Agent review |
| **Performance** | 0.15 | No regression vs baseline (estimate) | Agent or QA estimate |
| **Coverage** | 0.15 | Structured coverage result when configured | Agent runs configured coverage command |
| **Consistency** | 0.15 | Structured lint/type diagnostics when available | Agent runs configured checks |

### Composite Score Formula

```
composite = (correctness * 0.30) + (security * 0.25) + (performance * 0.15)
          + (coverage * 0.15) + (consistency * 0.15)
```

---

## Measurement Protocol

### How to Measure (Practical)

Use a project-provided JSON, JUnit, SARIF, or LCOV output when available. Keep
the original command's exit status and capture the result artifact before
summarizing it. Do not infer an error count from a truncated console line.

```bash
test_command --reporter=json > test-results.json
test_status=$?
# Read totals from test-results.json; retain test_status as the check result.

coverage_command --json > coverage.json
coverage_status=$?
# Read coverage.json or lcov.info; retain coverage_status.

lint_command --format json > lint.json
lint_status=$?
# Count structured diagnostics; retain lint_status.
```

When a structured measurement cannot be produced, mark the dimension
`missing`, state why, and use the applicable binary check or manual evidence.
An estimate may be shown as commentary but is excluded from the composite and
from score comparisons. Publish a composite only when every configured,
applicable dimension is measured. Otherwise set `Composite: unavailable` and
compare only dimensions measured with the same method at both checkpoints.

### When to Measure

Quality Score is measured **on demand**, not at every step. Load `quality-score.md` only at these checkpoints:

| Checkpoint | Trigger | Measurer |
|-----------|---------|----------|
| IMPL baseline | After implementation complete, before VERIFY | Orchestrator (inline) or impl agent |
| Post-VERIFY | After QA verification complete | QA Agent |
| Post-REFINE | After refinement complete | Debug Agent or Orchestrator |
| Final | Before SHIP_GATE | QA Agent |

---

## Score Thresholds

| Range | Grade | Gate Decision |
|-------|-------|---------------|
| 90-100 | A | PASS, proceed immediately |
| 75-89 | B | CONDITIONAL PASS, proceed with noted improvements |
| 60-74 | C | FAIL, must improve before proceeding |
| 0-59 | D | HARD FAIL, rollback and re-plan required |

---

## Keep/Discard Rule

Changes are evaluated by their **impact on the score**, not just by whether they pass review.

```
IF score_after >= score_before:
    KEEP change
ELSE IF (score_before - score_after) < 5:
    REVIEW (minor regression, justify in experiment ledger)
ELSE:
    DISCARD change (revert and try alternative)
```

### Delta Recording

Every scored change is recorded in the Experiment Ledger (see `experiment-ledger.md`).
Record via memory protocol: `[EDIT]("experiment-ledger.md", append row)`.

---

## Score Record Format

```markdown
### Quality Score @ {PHASE}_{checkpoint}
| Dimension | Score | Detail |
|-----------|-------|--------|
| Correctness | 100 | `test-results.json`, 20/20; command exit 0 |
| Security | 90 | No CRITICAL/HIGH, 1 MEDIUM |
| Performance | missing | no target or measurement available |
| Coverage | 70 | `coverage.json`, 70% line coverage; command exit 0 |
| Consistency | 95 | `lint.json`, 0 errors, 1 warning; command exit 0 |
| **Composite** | **unavailable** | performance is missing; no partial-weight normalization |
| **Comparability** | **comparable dimensions only** | method and scope recorded |
```

---

## Dimension Customization (Optional)

<!-- oma-docs:ignore-start -->
Projects can override weights in `.agents/config/quality-score.yaml`:

```yaml
weights:
  correctness: 0.25
  security: 0.35
  performance: 0.10
  coverage: 0.15
  consistency: 0.15
thresholds:
  pass: 85
  hard_fail: 60
```
<!-- oma-docs:ignore-end -->

If config file is absent, use the defaults defined in this document.

---

## Integration Points

| Component | How It Uses Quality Score |
|-----------|--------------------------|
| **Phase Gates** | Gate criteria reference composite score threshold |
| **Experiment Ledger** | Records score delta per experiment |
| **Exploration Loop** | Compares scores across alternative approaches |
| **Session Metrics** | Tracks score progression through session |
| **Lessons Learned** | Discarded experiments (delta <= -5) auto-feed lessons |
