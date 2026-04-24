# 🧪 E2E Testing Guide — Visual & A11y Audit

## Prerequisites

```bash
# Install dependencies if not already done
pnpm install

# Ensure dev server is NOT running (will start automatically)
```

---

## Run Tests

### Option 1: Run All Visual & A11y Tests
```bash
pnpm test:visual-a11y
```

### Option 2: Run Specific Test Suite
```bash
# Theme hydration tests only
pnpm test visual-and-accessibility.spec.ts --grep "Theme Flash"

# Accessibility tests only
pnpm test visual-and-accessibility.spec.ts --grep "Accessibility"

# Responsive design tests only
pnpm test visual-and-accessibility.spec.ts --grep "Responsive Design"

# Dark mode tests only
pnpm test visual-and-accessibility.spec.ts --grep "Dark Mode"
```

### Option 3: Run in UI Mode (Interactive)
```bash
pnpm test:ui visual-and-accessibility.spec.ts
```

### Option 4: Watch Mode (Auto-rerun on file changes)
```bash
pnpm test:watch visual-and-accessibility.spec.ts
```

---

## What These Tests Cover

### 🚨 [P0] Theme Flash on Hydration
- ✅ **Test:** No theme flash when system prefers dark mode
- ✅ **Test:** localStorage overrides system preference
- ✅ **Test:** Theme persists across navigation

**Why it matters:** Users with dark mode OS + no saved preference see a 0-100ms flash from dark → light, breaking UX.

**Expected outcome:** All 3 tests should PASS

---

### 🔴 [P1] Accessibility — ARIA Labels & Forms
- ✅ **Test:** Form inputs have associated `<label>` elements
- ✅ **Test:** Buttons have accessible text labels
- ✅ **Test:** Inputs have proper `type` attributes (email, password)

**Expected outcome:** All 3 tests should PASS

---

### ⌨️ [P1] Accessibility — Keyboard Navigation
- ✅ **Test:** Can Tab through login form inputs
- ✅ **Test:** Can submit form with Enter key
- ✅ **Test:** Focus is visible on interactive elements

**Expected outcome:** All 3 tests should PASS

---

### 🎨 [P1] Accessibility — Color Contrast
- ✅ **Test:** Text contrast in light mode
- ✅ **Test:** Text is readable in dark mode

**Note:** These are informational tests. Results logged to console for manual review.

---

### 📱 [P2] Responsive Design — Touch Targets
- ✅ **Test:** Buttons are ≥44px (WCAG standard) on mobile
- ✅ **Test:** Form inputs are ≥44px height on mobile

**Expected outcome:** All 2 tests should PASS

---

### 📐 [P2] Responsive Design — Layout Stability
- ✅ **Test:** No horizontal scroll on 375px viewport
- ✅ **Test:** Form fits on 320px narrow viewport
- ✅ **Test:** Layout is responsive on tablet (768px)

**Expected outcome:** All 3 tests should PASS

---

### 🎯 [P3] Visual Regression — Design Elements
- ✅ **Test:** Screenshot of login in light mode
- ✅ **Test:** Screenshot of login in dark mode
- ✅ **Test:** Glassmorphism effect applied (backdrop-filter)
- ✅ **Test:** Button has hover state

**Expected outcome:** All 4 tests should PASS

**Note:** First run creates baseline screenshots. Subsequent runs compare against baseline. If you see diffs, review them and update with:
```bash
pnpm test visual-and-accessibility.spec.ts --update-snapshots
```

---

### ⚡ [P2] Performance — Animation Performance
- ✅ **Test:** Animations use GPU acceleration (transform)
- ✅ **Test:** Respects prefers-reduced-motion

**Expected outcome:** All 2 tests should PASS

---

### 📱 [Integration] Mobile Device Testing
- ✅ **Test:** Responsive layout on Pixel 5
- ✅ **Test:** Responsive layout on iPhone 12

**Expected outcome:** All 2 tests should PASS

---

### 🔄 [Regression] Dark Mode Rendering
- ✅ **Test:** Text is readable in dark mode
- ✅ **Test:** Inputs are readable in dark mode

**Expected outcome:** All 2 tests should PASS

---

## Interpreting Results

### ✅ PASS Example
```
✓ should not flash light theme when system prefers dark mode (2.3s)
```

### ❌ FAIL Example
```
✗ should not flash light theme when system prefers dark mode (2.3s)
  Error: expect(flashes.length).toBeLessThanOrEqual(1)
  Received: 3
```

---

## Common Issues & Fixes

### **Issue: Tests timeout on first run**
**Fix:** Dev server takes time to start. Increase timeout:
```bash
pnpm test -- --timeout=120000
```

### **Issue: Screenshots differ from baseline**
**Fix:** If visual changes are intentional, update baselines:
```bash
pnpm test visual-and-accessibility.spec.ts --update-snapshots
```

### **Issue: "baseURL not set" error**
**Fix:** Ensure dev server is running:
```bash
# Terminal 1
pnpm dev

# Terminal 2
pnpm test visual-and-accessibility.spec.ts
```

### **Issue: Mobile device tests fail**
**Fix:** Check Playwright browser installation:
```bash
npx playwright install
```

---

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Run E2E tests
  run: pnpm test:visual-a11y

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: test-results/
```

---

## Next Steps

### If Tests PASS ✅
1. Review screenshots in `tests/e2e/__screenshots__/`
2. Verify visual design quality
3. Commit screenshots as baseline

### If Tests FAIL ❌
1. Review failure details in HTML report:
   ```bash
   pnpm test visual-and-accessibility.spec.ts
   # Opens: `playwright-report/index.html`
   ```

2. Fix issues in order of severity:
   - **P0 (Blocker):** Theme flash, a11y gaps
   - **P1 (Major):** Keyboard nav, focus
   - **P2 (Minor):** Touch targets, responsive
   - **P3 (Polish):** Visual details

3. Re-run tests:
   ```bash
   pnpm test visual-and-accessibility.spec.ts
   ```

---

## Expected Test Results by Area

| Test Area | Target | Status |
|-----------|--------|--------|
| Theme hydration | 3/3 PASS | 🟢 |
| ARIA labels | 3/3 PASS | 🟢 |
| Keyboard nav | 3/3 PASS | 🟡 (may fail) |
| Contrast | 2/2 INFO | 🔵 |
| Touch targets | 2/2 PASS | 🟢 |
| Layout stability | 3/3 PASS | 🟡 (320px may fail) |
| Visual regression | 4/4 PASS | 🟡 (need baseline) |
| Performance | 2/2 PASS | 🟢 |
| Mobile devices | 2/2 PASS | 🟢 |
| Dark mode | 2/2 PASS | 🟢 |

---

## Debugging a Specific Test

```bash
# Run single test with verbose output
pnpm test visual-and-accessibility.spec.ts --grep "Theme Flash" -v

# Run with browser visible (headed mode)
pnpm test visual-and-accessibility.spec.ts --headed

# Run with debug mode (step through)
pnpm test visual-and-accessibility.spec.ts --debug
```

---

## Recording Tests

```bash
# Create new test by recording interactions
npx playwright codegen http://localhost:4321/login
```

This opens Playwright Inspector — interact with the app and it generates test code.

---

## Success Criteria for Audit Fixes

After applying the action plan, these tests should show:

| Criteria | Before Fix | After Fix |
|----------|-----------|-----------|
| Theme flash | FAIL | PASS ✅ |
| A11y labels | FAIL | PASS ✅ |
| Keyboard nav | FAIL | PASS ✅ |
| Touch targets | FAIL | PASS ✅ |
| Dark mode contrast | WARN | PASS ✅ |
| Mobile layout | WARN | PASS ✅ |

---

## Questions?

Check test output with:
```bash
pnpm test visual-and-accessibility.spec.ts -- --reporter=verbose
```

Or debug specific failures:
```bash
pnpm test visual-and-accessibility.spec.ts --grep "failing test name" --headed --debug
```
