'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-accent/5 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-danger flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We've been notified and are working on a fix. Please try again.
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                  Error ID: {error.digest}
                </p>
              )}
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={reset}
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = '/'}
                  className="flex-1"
                >
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
