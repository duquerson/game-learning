# 🛡️ Security Testing Guide

Guía completa para escribir y mantener tests de seguridad en MicroLearn.

## 📚 Tabla de Contenidos
1. [Quick Start](#quick-start)
2. [How to Add Security Tests](#how-to-add-security-tests)
3. [Test Patterns](#test-patterns)
4. [OWASP Mapping](#owasp-mapping)
5. [Common Vulnerabilities](#common-vulnerabilities)

---

## Quick Start

### Run All Security Tests
```bash
npm run test:security
```

### Run Specific Test
```bash
npm run test:tampering
npm run test:sql-injection
```

### View Coverage
```bash
npm run test:security:coverage
```

### Development Mode (watch)
```bash
npm run test:watch -- tests/security
```

---

## How to Add Security Tests

### 1. Create Test File

Follow naming convention: `{feature}.security.test.ts`

```typescript
// tests/security/badge-award.security.test.ts
import { describe, it, expect } from 'vitest'
import { server } from '../../src/actions/index'

describe('🔒 Security: awardBadge - Payload Validation', () => {
  // Tests go here
})
```

### 2. Test Structure

```typescript
describe('🔒 Security: [Action] - [Vulnerability Type]', () => {
  // Setup
  const validPayload = { /* ... */ }
  const mockContext = { cookies: {}, url: { pathname: '/test' } }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // OWASP Category
  describe('SQL Injection Prevention', () => {
    it('should reject payload with SQL injection pattern: [PATTERN NAME]', async () => {
      const payload = { /* malicious */ }
      const result = await server.action(payload, mockContext)
      expect(result.success).toBe(false)
    })
  })

  describe('Type Coercion Attacks', () => {
    it('should reject [field] as [wrong type]', async () => {
      const payload = { /* ... */ }
      const result = await server.action(payload, mockContext)
      expect(result.success).toBe(false)
    })
  })
})
```

### 3. Add to CI/CD

Update `.github/workflows/security.yml`:

```yaml
- name: 🛡️ Run badge-award security tests
  run: npm run test -- tests/security/badge-award.security.test.ts
```

---

## Test Patterns

### Pattern 1: SQL Injection Testing

```typescript
describe('SQL Injection Prevention', () => {
  const sqlInjectionPatterns = [
    "value' OR '1'='1",              // Classic
    "value'; DROP TABLE users; --",  // Destructive
    "value\' UNION SELECT *",        // UNION-based
    "value%' AND 1=1 AND '%'=",      // AND-based
    "value/**/AND/**/1=1",           // Comment-based
    "value' /*!50000AND*/ 1=1",      // MySQL-specific
  ]

  sqlInjectionPatterns.forEach((pattern) => {
    it(`should reject SQL pattern: ${pattern.substring(0, 20)}...`, async () => {
      const payload = { userId: pattern }
      const result = await server.action(payload, mockContext)
      expect(result.success).toBe(false)
      expect(result.error).toMatch(/BAD_REQUEST|INVALID/)
    })
  })
})
```

### Pattern 2: Type Coercion Testing

```typescript
describe('Type Coercion & Type Confusion', () => {
  const invalidTypes = [
    { value: 'true', type: 'string' },
    { value: 1, type: 'number' },
    { value: true, type: 'boolean (should fail)' },
    { value: null, type: 'null' },
    { value: undefined, type: 'undefined' },
    { value: {}, type: 'object' },
    { value: [], type: 'array' },
    { value: () => true, type: 'function' },
  ]

  invalidTypes.forEach(({ value, type }) => {
    it(`should reject boolean field as ${type}`, async () => {
      const payload = { correct: value }
      const result = await server.action(payload, mockContext)
      expect(result.success).toBe(false)
    })
  })
})
```

### Pattern 3: UUID Validation

```typescript
describe('UUID Format Validation', () => {
  const invalidUUIDs = [
    '',                                           // Empty
    'not-a-uuid',                                 // Invalid format
    'f47ac10b-58cc-4372-a567-0e02b2c3d4',        // Too short
    'f47ac10b-58cc-4372-a567-0e02b2c3d479-extra', // Too long
    'f47ac10b 58cc 4372 a567 0e02b2c3d479',      // Spaces
    'f47ac10b-58cc-4372-a567-0e02b2c3d4\x00',    // Null byte
    '00000000-0000-0000-0000-000000000000',       // Nil UUID (usually invalid)
  ]

  invalidUUIDs.forEach((uuid) => {
    it(`should reject invalid UUID: ${uuid}`, async () => {
      const payload = { id: uuid }
      const result = await server.action(payload, mockContext)
      expect(result.success).toBe(false)
    })
  })
})
```

### Pattern 4: Access Control Testing

```typescript
describe('Access Control - Prevent Privilege Escalation', () => {
  it('should not allow user to modify another user\'s data', async () => {
    const attackerUserId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    const victimUserId = 'a47ac10b-58cc-4372-a567-0e02b2c3d479'

    const payload = {
      cardId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      userId: victimUserId, // Try to spoof
      correct: true,
    }

    // Mock context with attacker's session
    const attackerContext = {
      cookies: { 'sb-auth-token': 'attacker-token' },
      url: { pathname: '/test' },
    }

    const result = await server.review.submitAnswer(payload, attackerContext)
    
    // Should fail or use server-side userId verification
    expect(result.success).toBe(false)
  })

  it('should not allow privilege escalation via isAdmin flag', async () => {
    const payload = {
      cardId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      correct: true,
      isAdmin: true, // Try to inject
    }

    const result = await server.action(payload, mockContext)
    expect(result.success).toBe(false)
  })
})
```

### Pattern 5: Business Logic Validation

```typescript
describe('Points & Score Validation', () => {
  it('should not allow negative points', async () => {
    const payload = {
      cardId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      pointsAdjustment: -9999, // Try to lose points
    }

    const result = await server.action(payload, mockContext)
    expect(result.data?.points).toBeGreaterThanOrEqual(0)
  })

  it('should handle integer overflow gracefully', async () => {
    const payload = {
      points: Number.MAX_SAFE_INTEGER + 1,
    }

    const result = await server.action(payload, mockContext)
    expect(result).toBeDefined() // Should not crash
    expect(result.success).toBe(true)
    expect(result.data?.points).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER)
  })
})
```

---

## OWASP Mapping

### A01:2021 – Broken Access Control
**Tests:** Access control, privilege escalation, IDOR
```typescript
✅ User can't modify other user's progress
✅ User can't spoof userId
✅ Server verifies authorization, not client
```

### A02:2021 – Cryptographic Failures
**Tests:** Data integrity, error exposure, secrets
```typescript
✅ Error messages don't expose database schema
✅ Sensitive data not logged
✅ Timestamps not manipulatable
```

### A03:2021 – Injection
**Tests:** SQL, NoSQL, LDAP, Command Injection
```typescript
✅ SQL injection patterns blocked (OR, UNION, DROP, etc.)
✅ Template literals in SQL rejected
✅ UUID format strictly validated
✅ Enum values whitelisted
```

### A05:2021 – Security Misconfiguration
**Tests:** Missing security headers, insecure defaults
```typescript
✅ CSP headers in responses
✅ CORS properly configured
✅ HTTPS enforced
```

### A07:2021 – Auth & Session Failures
**Tests:** Session validation, token tampering
```typescript
✅ Request without valid session rejected
✅ JWT tokens validated server-side
✅ Session ID can't be forged
```

### A08:2021 – Data Integrity Failures
**Tests:** Deserialization, object injection, payload tampering
```typescript
✅ Payload can't be modified by client
✅ Points can't be injected
✅ Prototype pollution prevented
```

---

## Common Vulnerabilities

### 🔴 CRITICAL

#### SQL Injection
```typescript
// ❌ VULNERABLE
let query = `SELECT * FROM users WHERE id = '${userId}'`

// ✅ SAFE
supabase.from('users').select('*').eq('id', userId)
```

**Test:**
```typescript
it('should reject SQL injection in userId', async () => {
  const payload = { userId: "1' OR '1'='1" }
  const result = await server.action(payload, mockContext)
  expect(result.success).toBe(false)
})
```

#### Broken Authentication
```typescript
// ❌ VULNERABLE
const userId = req.query.userId

// ✅ SAFE
const { user } = await supabase.auth.getUser()
const userId = user.id
```

**Test:**
```typescript
it('should reject unauthenticated request', async () => {
  const noAuthContext = { cookies: {}, url: { pathname: '/' } }
  const result = await server.action(payload, noAuthContext)
  expect(result.success).toBe(false)
  expect(result.error).toMatch(/UNAUTHORIZED/)
})
```

### 🟠 HIGH

#### Type Confusion
```typescript
// ❌ VULNERABLE
const correct = Boolean(input.correct) // "false" → true!

// ✅ SAFE
const correct = z.boolean().parse(input.correct)
```

**Test:**
```typescript
it('should reject correct as string "false"', async () => {
  const payload = { correct: "false" }
  const result = await server.action(payload, mockContext)
  expect(result.success).toBe(false)
})
```

#### TOCTOU (Time-of-check-time-of-use)
```typescript
// ❌ VULNERABLE
if (card.exists) {
  // Someone could delete between check and use
  await updateProgress(card.id)
}

// ✅ SAFE
try {
  await updateProgress(card.id) // Fails if card deleted
} catch (err) {
  // Handle gracefully
}
```

**Test:**
```typescript
it('should handle race condition: card deleted mid-request', async () => {
  // Simulate concurrent deletion
  const promises = [
    server.submitAnswer(payload1, context),
    server.submitAnswer(payload2, context),
  ]
  
  const results = await Promise.all(promises)
  expect(results.some(r => !r.success)).toBe(true)
})
```

---

## Best Practices

### ✅ DO
- Test with both valid AND invalid payloads
- Test edge cases (empty, null, very long, special chars)
- Isolate tests (no shared state)
- Use descriptive test names
- Document OWASP mapping in comments
- Run tests in CI/CD before any deployment
- Keep security tests separate from unit tests

### ❌ DON'T
- Mock security validations
- Skip tests for "edge cases"
- Commit test data with real secrets
- Disable security headers in tests
- Use `any` type to bypass Zod validation
- Trust client-side validation
- Log sensitive data in tests

---

## Resources

- OWASP Top 10: https://owasp.org/Top10/
- Vitest: https://vitest.dev/
- Zod: https://zod.dev/
- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
- CWE: https://cwe.mitre.org/
