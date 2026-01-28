---
name: qa-agent
description: Quality assurance specialist for security, performance, accessibility, and comprehensive testing
---

# QA Agent - Quality Assurance Specialist

## Use this skill when

- Final review before deployment
- Security audits (OWASP Top 10)
- Performance analysis
- Accessibility compliance (WCAG 2.1 AA)
- Test coverage analysis

## Do not use this skill when

- Initial implementation (let specialists build first)
- Writing new features

## Review Areas

### 1. Security (CRITICAL)

OWASP Top 10 checks:
1. **Broken Access Control**: Authorization on all endpoints, user-scoped data
2. **Cryptographic Failures**: bcrypt/argon2 hashing, HTTPS, no sensitive data in logs
3. **Injection**: SQL injection (ORM usage), XSS (input sanitization), command injection
4. **Insecure Design**: Rate limiting, CSRF protection
5. **Security Misconfiguration**: No default credentials, CORS configured
6. **Vulnerable Components**: No outdated dependencies (npm audit, safety)
7. **Authentication Failures**: Password strength, account lockout
8. **Data Integrity**: Signed JWTs
9. **Logging Failures**: Auth failures logged
10. **SSRF**: URL validation for user-provided URLs

### 2. Performance

| Area | Target |
|------|--------|
| API Response (p95) | < 200ms |
| Database Queries | No N+1 |
| Lighthouse Score | > 90 |
| FCP | < 1.5s |
| LCP | < 2.5s |
| Bundle Size | < 500KB |
| Mobile Cold Start | < 2s |
| Frame Rate | 60fps |

### 3. Accessibility (WCAG 2.1 AA)

- All images have alt text
- Color contrast 4.5:1 (normal), 3:1 (large)
- Keyboard navigation works
- ARIA labels on interactive elements
- Semantic HTML

### 4. Code Quality

- Test coverage > 80%
- Cyclomatic complexity < 10
- Code duplication < 5%

## Output Format

See `resources/checklist.md` for full QA report template.

```markdown
# QA Report: [Project]
Status: PASS | WARNING | FAIL

## Security Audit
### Passed
- [x] Passwords hashed with bcrypt
- [x] JWT properly signed

### Failed
**CRITICAL: SQL Injection**
File: backend/api/users.py:45
Fix: Use parameterized query

## Performance
- API p95: 120ms [PASS]
- Lighthouse: 92 [PASS]
- Bundle: 650KB [FAIL - Target < 500KB]

## Recommendations
### High Priority (Before Launch)
1. Fix SQL injection
2. Add rate limiting

### Medium Priority (This Sprint)
1. Reduce bundle size
```

## Priority Levels

- **CRITICAL**: Security vulnerabilities, data loss - Fix immediately
- **HIGH**: Major bugs, performance issues - Fix before launch
- **MEDIUM**: Code quality, accessibility - Fix in sprint
- **LOW**: Optimizations - Backlog

## Tools

```bash
# Security
bandit -r backend/
npm audit

# Performance
npm run build && npm run analyze

# Accessibility
axe-cli http://localhost:3000
```

## Serena MCP

- `search_for_pattern("password.*=.*[\"']")`: Find hardcoded secrets
- `search_for_pattern("execute.*\\$\\{")`: Find SQL injection
- `search_for_pattern("innerHTML")`: Find XSS vulnerabilities
