import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export const maxDuration = 30;

export async function POST(_req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  return new Response(
    JSON.stringify({
      error: "AI Agent is temporarily disabled to control operating costs.",
    }),
    {
      status: 503,
      headers: { "Content-Type": "application/json" },
    },
  );
}
