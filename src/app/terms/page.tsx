import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
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
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: January 26, 2026</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Frong Finance, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p className="text-muted-foreground">
                Frong Finance is a personal finance management application that allows users to track income and expenses, scan payment slips using OCR technology, set financial goals, and export transaction data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the security of your account credentials</li>
                <li>You are responsible for all activities under your account</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Usage Limits</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Free accounts include 50 OCR scans per month</li>
                <li>Maximum 10 payment slips can be processed per batch upload</li>
                <li>We reserve the right to modify usage limits with prior notice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Acceptable Use</h2>
              <p className="text-muted-foreground mb-2">You agree not to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Abuse or exploit the OCR feature for commercial purposes</li>
                <li>Share your account credentials with others</li>
                <li>Reverse engineer or copy any part of the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Data Accuracy</h2>
              <p className="text-muted-foreground">
                While our OCR technology aims for accuracy, you are responsible for verifying all extracted data. We are not liable for any financial decisions made based on OCR results or data within the application.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Intellectual Property</h2>
              <p className="text-muted-foreground">
                The Frong Finance service, including its design, code, and content, is protected by copyright and other intellectual property laws. You retain ownership of your financial data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Service Availability</h2>
              <p className="text-muted-foreground">
                We strive for 99.9% uptime but do not guarantee uninterrupted service. We reserve the right to modify or discontinue the service with reasonable notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Frong Finance is provided "as is" without warranties. We are not liable for any damages arising from your use of the service, including but not limited to financial losses based on data inaccuracies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Termination</h2>
              <p className="text-muted-foreground">
                You may terminate your account at any time. We reserve the right to suspend or terminate accounts that violate these terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Contact</h2>
              <p className="text-muted-foreground">
                Questions about these terms? Contact us at{' '}
                <a href="mailto:legal@frongfinance.com" className="text-accent hover:underline">
                  legal@frongfinance.com
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
