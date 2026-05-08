"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/contexts/I18nContext";

const feedbackFormSchema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z.string().trim().email("Please enter a valid email").optional(),
  category: z.enum(["bug", "feature", "ux", "other"]),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
  website: z.string().optional(),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

export default function FeedbackPage() {
  const { t, locale } = useI18n();
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [startedAt] = useState(() => Date.now());

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      name: "",
      email: "",
      category: "other",
      message: "",
      website: "",
    },
  });

  const onSubmit = async (values: FeedbackFormValues) => {
    setSubmitState("submitting");
    setServerMessage("");

    const payload = {
      ...values,
      name: values.name?.trim() || undefined,
      email: values.email?.trim() || undefined,
      locale,
      startedAt,
    };

    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    if (!res || !res.ok) {
      const errorBody = await res?.json().catch(() => null);

      setSubmitState("error");
      if (res?.status === 429) {
        setServerMessage(t.feedbackPage.rateLimitedMessage);
      } else {
        setServerMessage(errorBody?.error || t.feedbackPage.errorMessage);
      }
      return;
    }

    setSubmitState("success");
    setServerMessage(t.feedbackPage.successMessage);
    reset();
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-white to-accent/5 px-4 py-12 sm:py-16">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <Link
          href="/"
          className="text-sm font-medium text-accent hover:underline"
        >
          {t.feedbackPage.backHome}
        </Link>

        <Card className="border-2 border-border bg-white/90">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                {t.feedbackPage.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t.feedbackPage.subtitle}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-foreground"
                >
                  {t.feedbackPage.nameLabel}
                </label>
                <input
                  id="name"
                  type="text"
                  className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-accent"
                  placeholder={t.feedbackPage.namePlaceholder}
                  {...register("name")}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  {t.feedbackPage.emailLabel}
                </label>
                <input
                  id="email"
                  type="email"
                  className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-accent"
                  placeholder={t.feedbackPage.emailPlaceholder}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-danger">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="category"
                  className="text-sm font-medium text-foreground"
                >
                  {t.feedbackPage.categoryLabel}
                </label>
                <select
                  id="category"
                  className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-accent"
                  {...register("category")}
                >
                  <option value="bug">{t.feedbackPage.categoryBug}</option>
                  <option value="feature">
                    {t.feedbackPage.categoryFeature}
                  </option>
                  <option value="ux">{t.feedbackPage.categoryUx}</option>
                  <option value="other">{t.feedbackPage.categoryOther}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className="text-sm font-medium text-foreground"
                >
                  {t.feedbackPage.messageLabel}
                </label>
                <textarea
                  id="message"
                  rows={6}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent"
                  placeholder={t.feedbackPage.messagePlaceholder}
                  {...register("message")}
                />
                {errors.message && (
                  <p className="text-xs text-danger">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
                {...register("website")}
              />

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={submitState === "submitting"}>
                  {submitState === "submitting"
                    ? t.feedbackPage.submitting
                    : t.feedbackPage.submit}
                </Button>
                {serverMessage && (
                  <p
                    className={`text-sm ${submitState === "success" ? "text-success" : "text-danger"}`}
                  >
                    {serverMessage}
                  </p>
                )}
              </div>
            </form>

            <p className="text-xs text-muted-foreground">
              {t.feedbackPage.sheetHint}
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
