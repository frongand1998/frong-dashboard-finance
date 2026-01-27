import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Target, FileText, Upload, Search, Download, Smartphone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { userId } = await auth();
  
  // If user is signed in, redirect to dashboard
  if (userId) {
    redirect("/transactions");
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-accent/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent/80 text-3xl font-bold text-white shadow-2xl">
            F
          </div>
          
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground tracking-tight">
              Frong Finance
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your smart personal finance companion. Track expenses, scan payment slips, and achieve your financial goals.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/sign-up">
              <Button variant="primary" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow">
                Get Started Free
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost" className="text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Manage Your Money
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to make personal finance management effortless.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <Card className="border-2 hover:border-accent/50 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Payment Slip OCR</h3>
              <p className="text-muted-foreground">
                Scan Thai payment slips instantly. Upload up to 10 slips at once with automatic data extraction.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent/50 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Smart Tracking</h3>
              <p className="text-muted-foreground">
                Monitor income and expenses in real-time with visual dashboards and detailed analytics.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent/50 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Goal Setting</h3>
              <p className="text-muted-foreground">
                Set financial targets and track your progress with clear milestones and visual indicators.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent/50 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Search className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Search & Filter</h3>
              <p className="text-muted-foreground">
                Quickly find any transaction with powerful search across categories, notes, and amounts.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent/50 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Download className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Export Data</h3>
              <p className="text-muted-foreground">
                Download your transactions as CSV for analysis in Excel or accounting software.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent/50 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Mobile Friendly</h3>
              <p className="text-muted-foreground">
                Fully responsive design. Manage your finances anywhere, on any device.
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
              <div className="text-4xl sm:text-5xl font-bold text-accent mb-2">50+</div>
              <div className="text-muted-foreground">Free OCR Scans/Month</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-accent mb-2">10</div>
              <div className="text-muted-foreground">Slips Per Batch</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-accent mb-2">100%</div>
              <div className="text-muted-foreground">Free to Use</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join now and start tracking your money smarter. No credit card required.
          </p>
          <div className="pt-4">
            <Link href="/sign-up">
              <Button variant="primary" className="text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-shadow">
                Start for Free
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonial/Social Proof Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8">
            What Users Say
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-accent">
                  {[1,2,3,4,5].map(i => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "The payment slip OCR feature is a game-changer! No more manual entry."
                </p>
                <p className="text-xs font-semibold">- Sarah K.</p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-accent">
                  {[1,2,3,4,5].map(i => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "Simple, clean interface. Finally a finance app that doesn't overwhelm me."
                </p>
                <p className="text-xs font-semibold">- Mike T.</p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-accent">
                  {[1,2,3,4,5].map(i => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "Love the goal tracking feature. Helps me stay motivated to save!"
                </p>
                <p className="text-xs font-semibold">- Lisa R.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-muted/20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div>
              <h3 className="font-semibold text-foreground mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/#features" className="hover:text-accent transition-colors">Features</Link></li>
                <li><Link href="/sign-up" className="hover:text-accent transition-colors">Pricing</Link></li>
                <li><a href="https://github.com/yourusername/frong-finance" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://github.com/yourusername/frong-finance/wiki" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Documentation</a></li>
                <li><a href="https://github.com/yourusername/frong-finance/blob/main/README.md" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">API Guide</a></li>
                <li><a href="https://github.com/yourusername/frong-finance/issues" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Community</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://github.com/yourusername/frong-finance" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">GitHub</a></li>
                <li><a href="https://twitter.com/frongfinance" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Twitter</a></li>
                <li><a href="https://discord.gg/frongfinance" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Discord</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Feedback</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Help us improve! Share your thoughts.
              </p>
              <a href="https://forms.gle/your-feedback-form" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" className="text-sm">
                  Give Feedback
                </Button>
              </a>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              © 2026 Frong Finance. Built with ❤️ using Next.js, Supabase, and Tesseract.js
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-accent transition-colors">Terms of Service</Link>
              <span>•</span>
              <a href="mailto:hello@frongfinance.com" className="hover:text-accent transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
