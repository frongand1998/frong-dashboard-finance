import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-accent/5">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost">&larr; Back to Home</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: January 26, 2026</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground">
                Frong Finance ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Account Information:</strong> Email address, name, and authentication data (via Clerk)</li>
                <li><strong>Financial Data:</strong> Transaction records, categories, amounts, and notes you enter</li>
                <li><strong>OCR Data:</strong> Payment slip images you upload (processed client-side, not stored on servers)</li>
                <li><strong>Usage Data:</strong> OCR usage counts, login times, and feature usage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide and maintain the Frong Finance service</li>
                <li>Process your transactions and financial data</li>
                <li>Track OCR usage limits</li>
                <li>Improve our service and develop new features</li>
                <li>Send important service updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Data Storage and Security</h2>
              <p className="text-muted-foreground">
                Your financial data is stored securely in Supabase with row-level security. Payment slip images are processed locally in your browser using Tesseract.js and are not transmitted to or stored on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Third-Party Services</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Clerk:</strong> Authentication and user management</li>
                <li><strong>Supabase:</strong> Database and data storage</li>
                <li><strong>Vercel:</strong> Application hosting</li>
                <li><strong>Tesseract.js:</strong> Client-side OCR processing (no data sent to servers)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
              <p className="text-muted-foreground mb-2">You have the right to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and all associated data</li>
                <li>Export your data (CSV export feature)</li>
                <li>Opt out of non-essential communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your data for as long as your account is active. When you delete your account, all associated data is permanently removed from our systems within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@frongfinance.com" className="text-accent hover:underline">
                  privacy@frongfinance.com
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
