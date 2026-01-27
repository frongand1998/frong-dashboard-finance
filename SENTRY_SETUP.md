# 🔍 Sentry Error Monitoring Setup Guide

Sentry is now installed! Follow these steps to activate error monitoring.

## 📋 Quick Setup (5 minutes)

### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io/signup/)
2. Sign up (free tier: 5,000 errors/month)
3. Create new project:
   - Platform: **Next.js**
   - Project name: `frong-finance`

### 2. Get Your DSN

After creating project, copy the **DSN** (looks like this):

```
https://examplePublicKey@o0.ingest.sentry.io/0
```

### 3. Add to Environment Variables

**Local Development** (`.env.local`):

```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-key@o0.ingest.sentry.io/your-id
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=frong-finance
```

**Vercel Production**:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_SENTRY_DSN` = `your-dsn-here`
   - `SENTRY_ORG` = `your-org-name`
   - `SENTRY_PROJECT` = `frong-finance`
   - `SENTRY_AUTH_TOKEN` = (get from Sentry → Settings → Auth Tokens)

### 4. Test It Works

**Option A: Trigger Test Error**
Add this to any page temporarily:

```tsx
<button
  onClick={() => {
    throw new Error("Test Sentry!");
  }}
>
  Test Error
</button>
```

**Option B: Use Sentry CLI**

```bash
npx @sentry/wizard@latest --integration nextjs
```

### 5. Verify in Sentry

1. Go to [sentry.io](https://sentry.io)
2. Click your project
3. Should see test error within 1 minute

## ✅ What's Already Configured

### ✨ Features Enabled

- **Error Tracking** - All uncaught errors automatically logged
- **Performance Monitoring** - Page load times tracked (10% sample in prod)
- **Session Replay** - Video playback of error sessions
- **Source Maps** - See exact code lines causing errors
- **Privacy Protection** - User emails and IPs filtered out
- **Smart Filtering** - Browser extension errors ignored

### 📁 Files Created

- `sentry.client.config.ts` - Browser error tracking
- `sentry.server.config.ts` - Server error tracking
- `sentry.edge.config.ts` - Edge runtime tracking
- `instrumentation.ts` - Next.js integration
- `src/app/global-error.tsx` - Friendly error page
- `next.config.ts` - Updated with Sentry config

## 🎯 Using Sentry

### Automatic Error Tracking

Errors are caught automatically! Just write code normally:

```tsx
// This error will be automatically sent to Sentry
const data = await fetch("/api/transactions");
if (!data.ok) throw new Error("API failed");
```

### Manual Error Logging

For important custom errors:

```tsx
import * as Sentry from "@sentry/nextjs";

try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: "ocr" },
    level: "error",
  });
}
```

### Add User Context

```tsx
Sentry.setUser({
  id: userId,
  username: "user123", // Don't use email (privacy)
});
```

### Add Breadcrumbs

```tsx
Sentry.addBreadcrumb({
  category: "ocr",
  message: "Processing payment slip",
  level: "info",
});
```

## 📊 Monitoring Dashboard

Once running, you'll see in Sentry:

- **Errors**: Stack traces with exact code lines
- **Performance**: Page load times, API response times
- **Replays**: Video of what user did before error
- **Trends**: Error frequency over time
- **Affected Users**: How many users hit each error

## 🚨 Alert Setup

1. Go to Sentry → Alerts → Create Alert
2. Recommended alerts:
   - **High error rate**: >10 errors in 1 hour
   - **New error type**: First occurrence of new error
   - **Performance degradation**: Page load >3 seconds

3. Send notifications to:
   - Email
   - Slack (connect in Settings)
   - Discord webhook

## 💰 Pricing Tiers

**Free Tier** (You're on this):

- 5,000 errors/month
- 10,000 performance transactions/month
- 50 session replays/month
- 1 team member
- ✅ Perfect for MVP!

**When to Upgrade**:

- 500+ active users
- Need more team members
- Want unlimited replays

## 🎨 Optional: Customize Error Page

Edit `src/app/global-error.tsx`:

```tsx
// Add your logo, custom message, support email, etc.
```

## 🧪 Testing

### Test Error Tracking

```bash
# Start dev server
npm run dev

# Visit http://localhost:3000
# Open console and run:
throw new Error('Test Sentry Error!');

# Check Sentry dashboard in ~30 seconds
```

### Test Production Build

```bash
npm run build
npm run start

# Trigger error
# Check Sentry dashboard
```

## 🔧 Troubleshooting

### Errors not showing in Sentry?

1. Check DSN is correct in `.env.local`
2. Verify `NEXT_PUBLIC_` prefix (required!)
3. Restart dev server after env change
4. Wait 1-2 minutes for errors to appear
5. Check browser console for Sentry logs

### Source maps not uploading?

1. Add `SENTRY_AUTH_TOKEN` to Vercel env vars
2. Ensure `SENTRY_ORG` and `SENTRY_PROJECT` match exactly
3. Check Vercel build logs for Sentry plugin output

### Too many errors?

1. Check `ignoreErrors` in `sentry.client.config.ts`
2. Add more patterns to filter noise
3. Adjust `tracesSampleRate` for performance

## 📚 Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Error Tracking Best Practices](https://docs.sentry.io/product/sentry-basics/guides/error-tracking/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)

## 🎉 Next Steps

1. ✅ Sign up for Sentry
2. ✅ Add DSN to `.env.local`
3. ✅ Test error tracking
4. ✅ Add DSN to Vercel env vars
5. ✅ Deploy to production
6. ✅ Monitor first week closely
7. ✅ Set up alerts
8. ⏸️ Relax - errors are caught automatically!

---

**You're all set!** 🚀

Sentry will now:

- Catch all errors automatically
- Show you exact code causing issues
- Alert you when things break
- Help you fix bugs faster

Focus on building features - Sentry handles the monitoring! 💪
