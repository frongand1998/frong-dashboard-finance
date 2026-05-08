"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/contexts/I18nContext";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isDefaultAdmin: boolean;
  createdAt: number;
  lastSignInAt: number | null;
};

export default function AdminPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [adminFilter, setAdminFilter] = useState<"all" | "admin" | "non-admin">(
    "all",
  );

  const nonAdminCount = useMemo(
    () => users.filter((u) => !u.isAdmin).length,
    [users],
  );

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchByRole =
        adminFilter === "all" ||
        (adminFilter === "admin" && user.isAdmin) ||
        (adminFilter === "non-admin" && !user.isAdmin);

      if (!matchByRole) return false;
      if (!q) return true;

      return (
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q)
      );
    });
  }, [users, query, adminFilter]);

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/users", { cache: "no-store" }).catch(
      () => null,
    );

    if (!res || !res.ok) {
      setLoading(false);
      setError(t.adminPage.forbidden);
      return;
    }

    const data = await res.json();
    setUsers(data.users || []);
    setCurrentUserId(data.currentUserId || "");
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onToggleAdmin = async (user: AdminUser, next: boolean) => {
    if (user.isDefaultAdmin) return;

    setSavingUserId(user.id);
    setError("");

    const previous = users;
    setUsers((curr) =>
      curr.map((u) => (u.id === user.id ? { ...u, isAdmin: next } : u)),
    );

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, isAdmin: next }),
    }).catch(() => null);

    if (!res || !res.ok) {
      const body = await res?.json().catch(() => null);
      setUsers(previous);
      setError(body?.error || t.adminPage.updateFailed);
    }

    setSavingUserId(null);
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-foreground">
          {t.adminPage.title}
        </h1>
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="space-y-4 p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-foreground">
          {t.adminPage.title}
        </h1>
        <p className="text-sm text-danger">{error}</p>
        <Link href="/dashboard">
          <Button variant="ghost">{t.adminPage.backDashboard}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          {t.adminPage.title}
        </h1>
        <p className="text-sm text-muted-foreground">{t.adminPage.subtitle}</p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {t.adminPage.summary
                .replace("{total}", String(users.length))
                .replace("{nonAdmin}", String(nonAdminCount))}
            </p>
            <Button
              variant="soft"
              onClick={loadUsers}
              disabled={Boolean(savingUserId)}
            >
              {t.adminPage.refresh}
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.adminPage.searchPlaceholder}
              className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-accent"
            />
            <select
              value={adminFilter}
              onChange={(e) =>
                setAdminFilter(e.target.value as "all" | "admin" | "non-admin")
              }
              className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-accent"
            >
              <option value="all">{t.adminPage.filterAll}</option>
              <option value="admin">{t.adminPage.filterAdmin}</option>
              <option value="non-admin">{t.adminPage.filterNonAdmin}</option>
            </select>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-175 divide-y divide-border text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    {t.adminPage.user}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    {t.adminPage.email}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    {t.adminPage.adminAccess}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => {
                  const isSelf = user.id === currentUserId;
                  return (
                    <tr key={user.id}>
                      <td className="px-4 py-3 text-foreground">
                        <div className="flex items-center gap-2">
                          <span>{user.name}</span>
                          {isSelf && (
                            <span className="rounded bg-accent/10 px-2 py-0.5 text-xs text-accent">
                              {t.adminPage.you}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground break-all">
                        {user.email || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <label className="inline-flex items-center gap-2 text-foreground">
                          <input
                            type="checkbox"
                            checked={user.isAdmin}
                            disabled={
                              user.isDefaultAdmin || savingUserId === user.id
                            }
                            onChange={(e) =>
                              onToggleAdmin(user, e.target.checked)
                            }
                          />
                          <span>
                            {user.isDefaultAdmin
                              ? t.adminPage.defaultAdmin
                              : t.adminPage.admin}
                          </span>
                        </label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t.adminPage.noResults}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
