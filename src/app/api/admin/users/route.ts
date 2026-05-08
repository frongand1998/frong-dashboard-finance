import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  DEFAULT_ADMIN_EMAIL,
  getPrimaryEmail,
  hasAdminAccess,
  isDefaultAdminEmail,
} from "@/lib/admin";

const toggleSchema = z.object({
  userId: z.string().min(1),
  isAdmin: z.boolean(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clerkClient();
  const requester = await client.users.getUser(userId);
  if (!hasAdminAccess(requester)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await client.users.getUserList({ limit: 500 });
  const users = result.data
    .map((user: any) => {
      const email = getPrimaryEmail(user);
      const isDefaultAdmin = isDefaultAdminEmail(email);
      const isAdmin = isDefaultAdmin || Boolean(user.publicMetadata?.isAdmin);

      return {
        id: user.id,
        email,
        name:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.username ||
          "-",
        isAdmin,
        isDefaultAdmin,
        createdAt: user.createdAt,
        lastSignInAt: user.lastSignInAt,
      };
    })
    .sort((a: any, b: any) => {
      if (a.isDefaultAdmin && !b.isDefaultAdmin) return -1;
      if (!a.isDefaultAdmin && b.isDefaultAdmin) return 1;
      return (a.email || "").localeCompare(b.email || "");
    });

  return NextResponse.json({
    users,
    currentUserId: userId,
    defaultAdminEmail: DEFAULT_ADMIN_EMAIL,
  });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const client = await clerkClient();
  const requester = await client.users.getUser(userId);
  if (!hasAdminAccess(requester)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const target = await client.users.getUser(parsed.data.userId);
  const targetEmail = getPrimaryEmail(target);
  const targetIsDefaultAdmin = isDefaultAdminEmail(targetEmail);

  if (targetIsDefaultAdmin && !parsed.data.isAdmin) {
    return NextResponse.json(
      { error: "Default admin cannot be removed." },
      { status: 400 },
    );
  }

  const nextPublicMetadata = {
    ...(target.publicMetadata || {}),
    isAdmin: parsed.data.isAdmin,
  };

  await client.users.updateUserMetadata(parsed.data.userId, {
    publicMetadata: nextPublicMetadata,
  });

  return NextResponse.json({ success: true });
}
