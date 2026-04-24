/**
 * Security Headers & CI/CD Configuration
 * 
 * Protect against:
 * - OWASP A01: Broken Access Control
 * - OWASP A02: Cryptographic Failures
 * - OWASP A03: Injection
 * - OWASP A04: Insecure Design
 * - OWASP A05: Security Misconfiguration
 */

// ═══════════════════════════════════════════════════════════════════════════
// ASTRO SECURITY CONFIG
// ═══════════════════════════════════════════════════════════════════════════

export const astroSecurityConfig = {
    // Disable early hydration of sensitive data
    hydrationDirective: {
        safe: ['client:idle', 'client:visible'],
        unsafe: ['client:load'], // ⚠️ Loads before checking auth
    },

    // Server-side environment variables
    env: {
        secrets: ['SUPABASE_SERVICE_ROLE_KEY', 'DATABASE_PASSWORD'],
        public: ['VITE_SUPABASE_URL', 'PUBLIC_API_BASE'],
    },

    // HTTPS only
    output: 'server',
    adapter: '@astrojs/vercel',
}

// ═══════════════════════════════════════════════════════════════════════════
// HTTP SECURITY HEADERS (Vercel)
// ═══════════════════════════════════════════════════════════════════════════

export const securityHeaders = {
    'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net", // Vue hydration needs inline scripts
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
        "connect-src 'self' https://*.supabase.co", // Supabase API
        "frame-ancestors 'self'", // Prevent clickjacking
        "base-uri 'self'",
        "form-action 'self'",
    ].join('; '),

    'X-Content-Type-Options': 'nosniff', // Prevent MIME type sniffing
    'X-Frame-Options': 'SAMEORIGIN', // Clickjacking protection
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': [
        'geolocation=()',
        'microphone=()',
        'camera=()',
        'payment=()',
    ].join(', '),
}

// ═══════════════════════════════════════════════════════════════════════════
// ZEST/ZAP AUTOMATION (OWASP Unified Security Testing)
// ═══════════════════════════════════════════════════════════════════════════

export const zapSecurityScan = {
    // Enable in CI/CD via GitHub Actions
    rules: {
        // SQL Injection (CWE-89)
        '90018': { enabled: true, threshold: 'CRITICAL' },

        // Cross-Site Scripting (CWE-79)
        '40018': { enabled: true, threshold: 'HIGH' },

        // Authentication Broken (CWE-287)
        '10102': { enabled: true, threshold: 'CRITICAL' },

        // Sensitive Data Exposure (CWE-200)
        '10021': { enabled: true, threshold: 'HIGH' },

        // CSRF (CWE-352)
        '10202': { enabled: true, threshold: 'CRITICAL' },
    },

    targets: [
        '/login',
        '/register',
        '/dashboard',
        '/review',
    ],

    excludePaths: [
        '/public/**',
        '/static/**',
    ],
}

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME PROTECTION: Input Validation Middleware
// ═══════════════════════════════════════════════════════════════════════════

export function createSecurityMiddleware() {
    return {
        // Rate limiting for auth endpoints
        rateLimit: {
            '/login': { max: 5, window: '15m' },
            '/register': { max: 3, window: '15m' },
            '/auth/callback': { max: 10, window: '1h' },
        },

        // Request size limits
        limits: {
            json: '1mb',
            urlencoded: '1mb',
            fileSize: '5mb',
        },

        // Output encoding
        outputEncoding: {
            enabled: true,
            type: 'UTF-8',
        },

        // Disable dangerous headers
        removeHeaders: [
            'X-Powered-By',
            'Server',
            'X-AspNet-Version',
        ],
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// VERCEL ENVIRONMENT SECURITY
// ═══════════════════════════════════════════════════════════════════════════

export const vercelEnvironmentConfig = {
    // In vercel.json or Vercel Dashboard:
    env: {
        // ✅ Secrets (encrypted)
        SUPABASE_SERVICE_ROLE_KEY: 'env',
        SUPABASE_JWT_SECRET: 'env',

        // ✅ Public (not secrets)
        VITE_SUPABASE_URL: 'https://xxx.supabase.co',
        PUBLIC_API_BASE: 'https://api.microlearn.dev',
    },

    // Function durations (prevent long-running exploits)
    functions: {
        'api/**': {
            maxDuration: 30, // 30 seconds max
            memory: '256 MB',
        },
    },

    // Ignore patterns (don't deploy test files)
    ignore: [
        'tests/**',
        '*.test.ts',
        '**/node_modules',
        '.git',
    ],
}

// ═══════════════════════════════════════════════════════════════════════════
// GITHUB ACTIONS: CI/CD SECURITY WORKFLOW
// ═══════════════════════════════════════════════════════════════════════════

export const githubActionsSecurityWorkflow = `
name: Security Tests & Validation

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      # 1. Dependency Scanning
      - name: Run dependency audit
        run: npm audit --audit-level=moderate
      
      - name: Check for vulnerable dependencies
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: 'package-lock.json'
      
      # 2. Static Code Analysis
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
      
      - name: Run SonarQube analysis
        uses: sonarsource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: \${{ secrets.SONAR_TOKEN }}
      
      # 3. SAST (Source Code Analysis)
      - name: Run ESLint security rules
        run: npm run lint -- --plugin security
      
      # 4. Secret Detection
      - name: Detect secrets in code
        uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --debug --only-verified
      
      # 5. Security tests
      - name: Install dependencies
        run: npm ci
      
      - name: Run security regression tests
        run: npm run test -- tests/security
        env:
          NODE_ENV: test
      
      - name: Run OWASP SQL injection tests
        run: npm run test -- tests/security/owasp-sql-injection-audit.test.ts
      
      - name: Run payload tampering tests
        run: npm run test -- tests/security/submission-tampering.security.test.ts
      
      # 6. Database security checks
      - name: Validate RLS policies
        run: |
          npx supabase status
          # Add custom checks for RLS policies
      
      # 7. Build validation
      - name: Build with security checks
        run: npm run build
        env:
          ENABLE_SECURITY_CHECKS: true
      
      # 8. Container scanning (if using Docker)
      - name: Scan Docker image for vulnerabilities
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: microlearn:latest
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
      
      # 9. Post results
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: false

  owasp-zap:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      # Run OWASP ZAP scan
      - name: Run OWASP ZAP scan
        uses: zaproxy/action-full-scan@v0
        with:
          target: 'https://staging.microlearn.dev'
          rules_file_name: '.zap/security-rules.yml'
          cmd_options: '-a'
      
      - name: Upload ZAP results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'report_md.sarif'
`

// ═══════════════════════════════════════════════════════════════════════════
// ESLINT SECURITY RULES
// ═══════════════════════════════════════════════════════════════════════════

export const eslintSecurityRules = {
    // Detect raw SQL
    'no-restricted-syntax': [
        'error',
        {
            selector:
                'TemplateLiteral[quasis.length=1] > LogicalExpression, CallExpression[callee.object.property.name="raw"]',
            message: 'SQL injection risk: Do not use template literals or .raw() for SQL',
        },
    ],

    // Detect unsafe object mutation
    'no-extend-native': 'error',

    // Prevent prototype pollution
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-unsafe-regex': 'error',

    // Detect hardcoded secrets
    'security/detect-possible-timing-attacks': 'warn',
}

// ═══════════════════════════════════════════════════════════════════════════
// RECOMMENDED DEPENDENCIES FOR SECURITY
// ═══════════════════════════════════════════════════════════════════════════

export const securityDependencies = {
    devDependencies: {
        // SAST Tools
        '@snyk/cli': '^1.1200.0',
        'eslint-plugin-security': '^latest',
        'typescript-eslint': '^latest',

        // Secret detection
        'detect-secrets': '^1.4.0',
        'trufflehog': '^latest',

        // Security testing
        '@owasp/zap-client': '^latest',
        'zapier-zap-cli': '^latest',

        // Input validation testing
        'mocha-json-output-reporter': '^latest',
    },

    dependencies: {
        // Runtime protection
        'helmet': '^7.0.0', // Security headers
        'rate-limit-redis': '^4.0.0', // Rate limiting
        'cors': '^2.8.5', // CORS policy
        'bcryptjs': '^2.4.3', // Password hashing (if needed)
        'jsonwebtoken': '^9.0.0', // JWT validation
    },
}
    `