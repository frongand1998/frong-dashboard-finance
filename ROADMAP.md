# Frong Finance Roadmap

## ✅ Completed (v1.0)

### Core Features

- [x] Payment slip OCR (Tesseract.js, Thai + English)
- [x] Multi-slip batch upload (up to 10)
- [x] Duplicate detection by reference number
- [x] Usage tracking (50 scans/month)
- [x] Transaction CRUD operations
- [x] Goal tracking with progress indicators
- [x] Dashboard with income/expense charts
- [x] Search & filter transactions
- [x] CSV export
- [x] PDF statement export
- [x] Multi-currency support (THB, USD, EUR)
- [x] Responsive mobile-first design

### Infrastructure

- [x] Vercel production deployment
- [x] Supabase PostgreSQL with RLS
- [x] Clerk authentication
- [x] Landing page with features
- [x] SEO optimization (metadata, sitemap, robots.txt)
- [x] Privacy Policy & Terms of Service
- [x] User documentation

## ✅ Completed (v1.1) - Released May 2026

### Analytics & Monitoring

- [ ] Google Analytics 4 integration
- [x] Error tracking (Sentry) — `sentry.{client,server,edge}.config.ts` wired up
- [ ] User behavior analytics
- [ ] Performance monitoring (Web Vitals)

### User Experience

- [ ] Dark mode toggle
- [ ] Onboarding tutorial for new users
- [ ] Toast notifications (success/error)
- [ ] Loading skeleton improvements
- [ ] Empty state illustrations

### Feature Enhancements

- [ ] Custom categories management (add/edit/delete)
- [ ] Transaction attachments (receipt images)
- [ ] Notes with markdown support
- [ ] Bulk transaction editing
- [ ] Transaction templates for recurring expenses

### Added in v1.1 (beyond original plan)

- [x] Bilingual UI — Thai / English i18n via custom Context + cookie
- [x] Noto Sans Thai font via Google Fonts
- [x] Admin role management — Clerk `publicMetadata.isAdmin`, default admin guard
- [x] Admin UI — user list with checkbox toggle, search, and filter
- [x] Feedback page — React Hook Form + Zod, forwarded to Google Sheets via Apps Script, anti-spam
- [x] Budget Limits page (`/limits`) — monthly CRUD, month selector, BudgetProgress component
- [x] Settings page cleanup — removed duplicate budget section, links to `/limits`
- [x] Sidebar hides Admin nav item for non-admin users
- [x] Add page UX — clear form on save, alert on success
- [x] Responsive polish — PageShell overflow fix, Navbar mobile layout, admin table overflow

## 🚀 Next Release (v1.2) - In Progress

### Budget & Planning

- [x] Monthly budget setting per category
- [x] Budget vs actual comparison (BudgetProgress component)
- [ ] Spending alerts when approaching limits
- [ ] Budget recommendations based on history
- [ ] Forecasting future expenses

## 🎯 Future Releases

### v1.3 - Advanced Analytics

- [ ] Category breakdown pie charts
- [ ] Spending trends over time
- [ ] Year-over-year comparisons
- [ ] Custom date range reports
- [ ] Export to PDF reports
- [ ] Email digest (weekly/monthly summaries)

### v1.4 - Automation & Recurring

- [ ] Recurring transactions — `/recurring` route scaffolded, page not yet implemented
- [ ] Automatic categorization via AI
- [ ] Smart notifications for unusual spending
- [ ] Bill payment reminders
- [ ] Bank account sync (via Plaid or similar)

### v1.5 - Collaboration (June 2026)

- [ ] Shared accounts (family/household)
- [ ] Multiple user roles (admin, viewer)
- [ ] Activity log for shared accounts
- [ ] Collaborative goals
- [ ] Expense splitting

### v2.0 - Mobile Apps (Q3 2026)

- [ ] React Native mobile app (iOS/Android)
- [ ] Offline mode with sync
- [ ] Push notifications
- [ ] Camera integration for instant OCR
- [ ] Widget for home screen

## 🎨 Design Improvements

### UI/UX Polish

- [ ] Animated transitions between pages
- [ ] Micro-interactions (hover states, loading animations)
- [ ] Improved data visualization
- [ ] Accessibility audit (WCAG 2.1 AA)
- [x] Multi-language support (Thai, English) — i18n Context with cookie-driven locale switching

### Performance

- [ ] Image optimization
- [ ] Code splitting improvements
- [ ] Cache optimization
- [ ] Database query optimization
- [ ] Progressive Web App (PWA) support

## 🛠️ Technical Debt

- [ ] Add comprehensive unit tests (Jest, React Testing Library)
- [ ] E2E testing (Playwright)
- [ ] API documentation
- [ ] Component Storybook
- [ ] TypeScript strict mode
- [ ] Migrate to Supabase v2 SDK
- [ ] Database backup automation

## 🌟 Community & Growth

### Marketing

- [ ] Product Hunt launch
- [ ] Blog post series on Dev.to
- [ ] YouTube tutorial videos
- [ ] Case studies from real users
- [ ] Newsletter for updates

### Community

- [ ] Discord server for support
- [ ] GitHub Discussions
- [ ] Twitter account for announcements
- [ ] User feedback voting board
- [ ] Monthly feature request poll

### Monetization (Future)

- [ ] Premium tier (unlimited OCR, advanced features)
- [ ] API for third-party integrations
- [ ] White-label licensing
- [ ] Affiliate program

## 📊 Success Metrics

### v1.0 Goals (End of Jan 2026)

- [ ] 100 sign-ups
- [ ] 1,000 transactions created
- [ ] 500 OCR scans performed
- [ ] 50 goals set

### v1.1 Goals (End of Feb 2026)

- [ ] 500 active users
- [ ] 5,000 transactions
- [ ] 90% OCR accuracy rate
- [ ] < 2s average page load time

## 🤝 Contributing

See issues tagged with:

- `good first issue` - Great for new contributors
- `help wanted` - Need community help
- `feature request` - Requested by users
- `bug` - Needs fixing

## 💡 Feature Requests

Submit your ideas via:

- GitHub Discussions
- Discord #feature-requests channel
- Feedback form on website
- Email: feedback@frongfinance.com

---

**Last Updated**: May 11, 2026
**Current Version**: v1.1
**Next Release**: v1.2 (in progress)
