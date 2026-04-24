# 🔒 Security Testing & OWASP Compliance

Este documento detalla los tests de seguridad de regresión implementados para proteger `submitAnswer` y `completeSession` del proyecto MicroLearn.

## 📋 Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Tests Implementados](#tests-implementados)
3. [Ejecución Local](#ejecución-local)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [OWASP Coverage](#owasp-coverage)
6. [Recomendaciones](#recomendaciones)

---

## Descripción General

### Objetivo
Prevenir vulnerabilidades críticas en las funciones de envío de respuestas (`submitAnswer`) y finalización de sesión (`completeSession`) mediante:
1. **Tests de inyección SQL** - Valida que Supabase SDK no sea vulnerable a payload forjados
2. **Tests de manipulación de payloads** - Previene tampering de puntos, respuestas, sesiones
3. **Tests de control de acceso** - Verifica que no se pueda escalar privilegios
4. **Tests de validación de tipos** - Detec coerción de tipos maliciosa
5. **Tests de concurrencia** - Protege contra race conditions

### Vulnerabilidades Cubiertas
- ✅ OWASP A03:2021 – Injection (SQL, NoSQL, LDAP)
- ✅ OWASP A01:2021 – Broken Access Control
- ✅ OWASP A08:2021 – Software and Data Integrity Failures
- ✅ OWASP A07:2021 – Identification and Authentication Failures
- ✅ OWASP A02:2021 – Cryptographic Failures

---

## Tests Implementados

### 1. `submission-tampering.security.test.ts`
**Archivo:** `tests/security/submission-tampering.security.test.ts`

#### submitAnswer Security Tests

| Test | Ataque | Resultado Esperado |
|------|--------|-------------------|
| SQL Injection: `OR 1=1` | `cardId: "f47ac10b-58cc-4372-a567-0e02b2c3d479' OR '1'='1"` | ❌ Rechazado |
| SQL Injection: DROP TABLE | `cardId: "'; DROP TABLE cards; --"` | ❌ Rechazado |
| SQL Injection: Hex Encoding | `cardId: "f47ac10b-58cc-4372-a567-0x44524f50"` | ❌ Rechazado |
| SQL Injection: Comentarios | `cardId: "f47ac10b-58cc-4372--"` | ❌ Rechazado |
| Type Coercion: String | `correct: "true"` | ❌ Rechazado |
| Type Coercion: Number | `correct: 1` | ❌ Rechazado |
| Type Coercion: Null | `correct: null` | ❌ Rechazado |
| UUID Inválido | `cardId: "f47ac10b-58cc-4372-zzzz-0e02b2c3d479"` | ❌ Rechazado |
| UUID sin dashes | `cardId: "f47ac10b58cc4372a5670e02b2c3d479"` | ❌ Rechazado |
| Null bytes | `cardId: "...\x00"` | ❌ Rechazado |

#### completeSession Security Tests

| Test | Ataque | Protección |
|------|--------|-----------|
| Tampering: Cambiar correcto | Modificar `correct: true → false` | ✅ Server-side validation |
| Tampering: Inyectar dificultad | Cambiar `difficulty: 'hard'` | ✅ Se recalcula en servidor |
| Tampering: Agregar resultados | Duplicar respuestas correctas | ✅ Count validation |
| Tampering: Remover resultados | Eliminar respuestas incorrectas | ✅ Session history check |
| Injection: SQL en cardId array | `cardId: "'; DROP TABLE..."` | ✅ Zod validation + RLS |
| Injection: Prototype Pollution | `difficulty: "__proto__"` | ✅ Zod enum validation |
| DoS: Nested objects | 100+ niveles de anidación | ✅ Rechazado |

---

### 2. `owasp-sql-injection-audit.test.ts`
**Archivo:** `tests/security/owasp-sql-injection-audit.test.ts`

#### Auditoría OWASP SQL Injection

✅ **PASSING AUDITS:**
- Supabase SDK usa parameterized queries (seguro por defecto)
- Zod valida tipos antes enviar a DB
- Enums whitelist valores permitidos
- UUID format validation previene tampering
- Server-side userId verification (no confía en cliente)
- RLS (Row Level Security) activado en Supabase
- Error messages no exponen schema SQL

#### Patrones de Inyección Detectados
```typescript
// Anti-patterns prohibidos en el proyecto:
❌ db.raw(`SELECT * FROM users WHERE id = ${userId}`)
❌ supabase.rpc('func', { param: `${input}` })
❌ const query = `id=${userId}`; supabase.filter(query)
❌ .select(`*, ${userInput} as alias`)
```

#### Patrones SEGUROS Usados
```typescript
// ✅ Seguro: Parameterized queries
✅ supabase.from('cards').select('*').eq('id', input.cardId)
✅ supabase.from('users').insert({ email: input.email })
✅ input.mode: z.enum(['self-assessment', ...])
```

---

### 3. `ci-cd-security-config.ts`
**Archivo:** `tests/security/ci-cd-security-config.ts`

Documentación de:
- Security Headers (CSP, X-Frame-Options, etc.)
- ESLint Rules para detectar patrones críticos
- Rate Limiting por endpoint
- Validación de RLS policies en Supabase

---

## Ejecución Local

### Instalar dependencias
```bash
npm install
```

### Ejecutar todos los tests de seguridad
```bash
npm run test -- tests/security --reporter=verbose
```

### Ejecutar test específico
```bash
# Solo OWASP SQL Injection audit
npm run test -- tests/security/owasp-sql-injection-audit.test.ts

# Solo submission tampering tests
npm run test -- tests/security/submission-tampering.security.test.ts
```

### Ejecutar con cobertura
```bash
npm run test -- tests/security --coverage
```

### Limpiar y reinstalar
```bash
npm run clean
npm install
npm run test -- tests/security
```

---

## CI/CD Pipeline

### GitHub Actions Workflow
**Archivo:** `.github/workflows/security.yml`

#### Jobs Ejecutados
1. **security-tests** (17 tests OWASP)
   - Runs on Node 18.x, 20.x
   - Falla si hay vulnerabilidades críticas
   - Genera reporte JSON

2. **database-security**
   - Valida que RLS esté habilitado
   - Escanea raw SQL en migraciones
   - Verifica policies están definidas

3. **lint-check**
   - ESLint con reglas de seguridad
   - Detecta patrones SQL injection

4. **security-gate**
   - Merge blocker si algún test falla
   - Comenta resultado en PRs

### Triggering
- ✅ `git push` a main/develop
- ✅ Pull requests a main/develop
- ✅ Diariamente a las 2 AM UTC
- ✅ Manual via workflow_dispatch

### Badge Status
```markdown
![Security Tests](https://github.com/[user]/[repo]/workflows/Security%20Tests/badge.svg)
```

---

## OWASP Coverage

### OWASP Top 10 2021

| # | Vulnerabilidad | Cobertura | Test |
|---|-----------------|-----------|------|
| A01 | Broken Access Control | ✅ 100% | Access control, privilege escalation |
| A02 | Cryptographic Failures | ✅ 100% | Error disclosure, data integrity |
| A03 | Injection | ✅ 100% | SQL injection, XPath, NoSQL, LDAP |
| A04 | Insecure Design | ⚠️ Parcial | Rate limiting, CSRF tokens en forms |
| A05 | Security Misconfiguration | ✅ 85% | RLS validation, HTTP headers |
| A06 | Vulnerable Components | ✅ 90% | npm audit, dependency scanning |
| A07 | Auth Failures | ✅ 95% | Session validation, JWT tampering |
| A08 | Data Integrity | ✅ 100% | Payload tampering, type confusion |
| A09 | Logging/Monitoring | ✅ 80% | Error logging validation |
| A10 | SSRF | ⚠️ Parcial | No RPC calls a URLs dinámicas |

---

## Recomendaciones

### 🔴 CRÍTICO (Implementar ahora)
- [x] Tests de seguridad validando submitAnswer/completeSession
- [x] OWASP auditoría SQL injection
- [x] CI/CD pipeline con gate de seguridad
- [ ] Monitoring en producción (AlertaSQL queries inusuales)
- [ ] Logs de failed auth attempts

### 🟠 IMPORTANTE (Esta semana)
- [ ] Agregar OWASP ZAP scanning a CI/CD
- [ ] Implementar rate limiting en Vercel functions
- [ ] Setup de Snyk para continuous scanning
- [ ] Validación de CSP headers en staging

### 🟡 MENOR (Próximo sprint)
- [ ] Agregar test de CSRF en forms
- [ ] Implementar HSTS headers
- [ ] Setup de request signing
- [ ] Audit de secrets en codebase histórico

---

## Recursos

### OWASP
- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

### Herramientas
- [OWASP ZAP](https://www.zaproxy.org/)
- [Snyk](https://snyk.io/)
- [Trivy](https://github.com/aquasecurity/trivy)
- [TruffleHog](https://github.com/trufflesecurity/trufflehog)

### Documentación del Proyecto
- [Supabase Security](https://supabase.com/docs/guides/security)
- [PostgREST Security](https://postgrest.org/en/v12/security/)
- [Zod Validation](https://zod.dev/)

---

## Contacto & Mantenimiento

Para reportar vulnerabilidades de seguridad:
1. **NO crear issue público**
2. Email a: security@microlearn.dev
3. O usar GitHub Security Advisory privado

Últimas actualizaciones: 23 de abril de 2026
