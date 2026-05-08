import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { LOCALE_COOKIE_KEY, getTranslations, resolveLocale } from "@/lib/i18n";
import {
  TrendingUp,
  Target,
  Upload,
  Search,
  Download,
  Smartphone,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { userId } = await auth();
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE_KEY)?.value);
  const t = getTranslations(locale);

  // If user is signed in, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-accent/5">
      <div className="container mx-auto flex justify-end px-4 pt-4 sm:pt-6">
        <LanguageSwitcher />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-accent to-accent/80 text-3xl font-bold text-white shadow-2xl">
            Y
          </div>

          <div className="space-y-4 max-w-3xl">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground tracking-tight">
              {t.home.brandName}
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t.home.heroSubtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/sign-up">
              <Button
                variant="primary"
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                {t.home.primaryCta}
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost" className="text-lg px-8 py-6">
                {t.home.secondaryCta}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t.home.featuresTitle}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.home.featuresSubtitle}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <Card className="border-2 hover:border-accent/50 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                {t.home.featureOcrTitle}
              </h3>
              <p className="text-muted-foreground">
                {t.home.featureOcrDescription}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent/50 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                {t.home.featureTrackingTitle}
              </h3>
              <p className="text-muted-foreground">
                {t.home.featureTrackingDescription}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent/50 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                {t.home.featureGoalsTitle}
              </h3>
              <p className="text-muted-foreground">
                {t.home.featureGoalsDescription}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent/50 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Search className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                {t.home.featureSearchTitle}
              </h3>
              <p className="text-muted-foreground">
                {t.home.featureSearchDescription}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent/50 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Download className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                {t.home.featureExportTitle}
              </h3>
              <p className="text-muted-foreground">
                {t.home.featureExportDescription}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent/50 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                {t.home.featureMobileTitle}
              </h3>
              <p className="text-muted-foreground">
                {t.home.featureMobileDescription}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-accent/5 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-accent mb-2">
                50+
              </div>
              <div className="text-muted-foreground">{t.home.statsScans}</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-accent mb-2">
                10
              </div>
              <div className="text-muted-foreground">{t.home.statsBatch}</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-accent mb-2">
                100%
              </div>
              <div className="text-muted-foreground">{t.home.statsFree}</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            {t.home.ctaTitle}
          </h2>
          <p className="text-lg text-muted-foreground">{t.home.ctaSubtitle}</p>
          <div className="pt-4">
            <Link href="/sign-up">
              <Button
                variant="primary"
                className="text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                {t.home.ctaButton}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonial/Social Proof Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8">
            {t.home.testimonialsTitle}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-accent">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic">
                  {t.home.testimonialOne}
                </p>
                <p className="text-xs font-semibold">- Sarah K.</p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-accent">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic">
                  {t.home.testimonialTwo}
                </p>
                <p className="text-xs font-semibold">- Mike T.</p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-accent">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic">
                  {t.home.testimonialThree}
                </p>
                <p className="text-xs font-semibold">- Lisa R.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-3xl border-2 border-accent/20 bg-white/80">
          <CardContent className="space-y-6 p-6 text-center sm:p-10">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              {t.home.supportTitle}
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {t.home.supportSubtitle}
            </p>
            <div className="mx-auto w-fit rounded-2xl border border-border bg-white p-3 shadow-sm">
              <Image
                src="/buy-me-coffee-qr.png?v=1"
                alt={t.home.supportHint}
                width={280}
                height={280}
                className="rounded-xl"
                priority
                unoptimized
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {t.home.supportHint}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-muted/20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div>
              <h3 className="font-semibold text-foreground mb-3">
                {t.home.product}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/#features"
                    className="hover:text-accent transition-colors"
                  >
                    {t.home.productFeatures}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sign-up"
                    className="hover:text-accent transition-colors"
                  >
                    {t.home.productPricing}
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/yourusername/frong-finance"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors"
                  >
                    {t.home.productRoadmap}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">
                {t.home.resources}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="https://github.com/yourusername/frong-finance/wiki"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors"
                  >
                    {t.home.resourcesDocumentation}
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/yourusername/frong-finance/blob/main/README.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors"
                  >
                    {t.home.resourcesApiGuide}
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/yourusername/frong-finance/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors"
                  >
                    {t.home.resourcesSupport}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">
                {t.home.community}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="https://github.com/yourusername/frong-finance"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors"
                  >
                    {t.home.communityGithub}
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com/frongfinance"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors"
                  >
                    {t.home.communityTwitter}
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.gg/frongfinance"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors"
                  >
                    {t.home.communityDiscord}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">
                {t.home.feedback}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {t.home.feedbackPrompt}
              </p>
              <Link href="/feedback">
                <Button variant="ghost" className="text-sm">
                  {t.home.feedbackAction}
                </Button>
              </Link>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              © 2026 Frong Finance. {t.home.builtWith}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
              <Link
                href="/privacy"
                className="hover:text-accent transition-colors"
              >
                {t.home.privacyPolicy}
              </Link>
              <span className="hidden sm:inline">•</span>
              <Link
                href="/terms"
                className="hover:text-accent transition-colors"
              >
                {t.home.termsOfService}
              </Link>
              <span className="hidden sm:inline">•</span>
              <a
                href="mailto:hello@frongfinance.com"
                className="hover:text-accent transition-colors"
              >
                {t.home.contact}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
