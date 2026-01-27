# Testing Strategy for Frong Finance

## Current Status: Manual Testing ✅

For MVP launch, manual testing is sufficient. Add automated tests later when the project grows.

## Manual Testing Checklist

### Critical User Flows

- [ ] Sign up new account
- [ ] Sign in existing account
- [ ] Add transaction manually
- [ ] Upload 1 payment slip (OCR)
- [ ] Upload 10 payment slips (batch)
- [ ] Edit transaction
- [ ] Delete transaction
- [ ] Create goal
- [ ] Edit goal
- [ ] Delete goal
- [ ] Search transactions
- [ ] Filter by date range
- [ ] Export CSV
- [ ] Delete all transactions
- [ ] Sign out

### Browser Testing

- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Safari (iOS)
- [ ] Chrome (Android)

### Edge Cases

- [ ] Upload duplicate slip (should warn)
- [ ] Upload non-image file (should reject)
- [ ] Upload 11 slips (should block at 10)
- [ ] Reach 50 OCR limit (should block)
- [ ] Search with no results
- [ ] Filter with no matches
- [ ] Export with 0 transactions
- [ ] Create transaction with $0.00
- [ ] Create goal with past date
- [ ] Upload blurry slip (OCR fails gracefully)

### Performance Testing

- [ ] Page loads < 3 seconds
- [ ] OCR processing < 10 seconds per slip
- [ ] Dashboard with 100+ transactions loads smoothly
- [ ] No console errors in production
- [ ] No memory leaks (check DevTools)

## Future: Automated Testing Setup

When you're ready to add tests (after 100+ users), here's the plan:

### Phase 1: E2E Tests (Playwright)

**Priority: High** - Test critical user flows

- Sign up → Upload slip → Create transaction
- Create goal → Track progress
- Search → Filter → Export

### Phase 2: Component Tests (Vitest + React Testing Library)

**Priority: Medium** - Test complex components

- OCR parser logic
- Date conversion (Buddhist → Christian)
- Currency formatting
- Filter/search logic

### Phase 3: Unit Tests

**Priority: Low** - Test utility functions

- formatCurrency
- formatDate
- parsePaymentSlipText

## Recommended Testing Stack

```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.5",
    "vitest": "^1.0.0",
    "@vitejs/plugin-react": "^4.2.0"
  }
}
```

## When to Add Tests

### Green Flags (Add Tests):

- ✅ 100+ active users
- ✅ 2+ contributors
- ✅ Same bug appears twice
- ✅ Complex feature (budget tracking, automation)
- ✅ Refactoring critical code

### Red Flags (Tests Can Wait):

- ⏸️ Solo developer
- ⏸️ Under 50 users
- ⏸️ MVP iteration phase
- ⏸️ Changing features rapidly

## Error Monitoring (Add Now!)

Instead of tests, add error tracking for production:

### Option 1: Sentry (Recommended)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Option 2: Free Alternatives

- LogRocket (session replay)
- Highlight.io (open source)
- PostHog (product analytics + errors)

## Current Recommendation

**For your MVP launch:**

1. ✅ Manual test all features (1-2 hours)
2. ✅ Add Sentry for error tracking (30 min setup)
3. ✅ Monitor production for first week
4. ⏸️ Skip automated tests for now
5. ⏸️ Add tests after 100 users or first contributor

**Testing Time Investment:**

- Manual testing: 2 hours ✅ (Do this)
- Setting up automated tests: 8-16 hours ⏸️ (Skip for now)
- Maintaining tests: 2-4 hours/week ⏸️ (Not worth it yet)

Focus your time on:

1. Launch marketing
2. User feedback
3. Quick bug fixes
4. New feature iterations

---

**Remember:** Perfect code ships never. Working code ships now. 🚀

Test manually, launch, iterate!
