import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { userId } = await auth();
  
  // If user is signed in, redirect to dashboard
  if (userId) {
    redirect("/transactions");
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-b from-accent/10 to-surface px-4">
      <div className="space-y-4 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-accent text-2xl font-bold text-white shadow-lg">
          F
        </div>
        <h1 className="text-4xl font-bold text-foreground sm:text-5xl">Frong Finance</h1>
        <p className="max-w-md text-lg text-slate-600">
          Track your income, expenses, and reach your financial goals—all in one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mb-3 text-3xl">💰</div>
            <h3 className="font-semibold text-foreground">Smart Tracking</h3>
            <p className="mt-1 text-sm text-slate-600">Monitor income and expenses in real-time with visual dashboards.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mb-3 text-3xl">🎯</div>
            <h3 className="font-semibold text-foreground">Goal Setting</h3>
            <p className="mt-1 text-sm text-slate-600">Set financial targets and track your progress toward them.</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Link href="/sign-in">
          <Button variant="primary">Sign In</Button>
        </Link>
        <Link href="/sign-up">
          <Button variant="ghost">Create Account</Button>
        </Link>
      </div>
    </div>
  );
}
