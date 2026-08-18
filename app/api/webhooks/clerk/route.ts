import { headers } from "next/headers";
import { Webhook } from "svix";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/utils";

interface ClerkUserEvent {
  data: {
    id: string;
    email_addresses: { email_address: string; id: string }[];
    primary_email_address_id: string;
    first_name?: string;
    last_name?: string;
    image_url?: string;
  };
  type: "user.created" | "user.updated" | "user.deleted";
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook secret not configured", { status: 500 });

  const headerPayload = headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const body = await req.text();

  let payload: ClerkUserEvent;
  try {
    payload = new Webhook(secret).verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return new Response("Invalid signature", { status: 401 });
  }

  const { data, type } = payload;

  try {
    if (type === "user.created" || type === "user.updated") {
      const primaryEmail = data.email_addresses.find(
        (e) => e.id === data.primary_email_address_id
      )?.email_address;

      if (!primaryEmail) return new Response("No email", { status: 400 });

      const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;

      // `undefined` rather than "USER" on the update path: Prisma omits undefined keys, so
      // an address that is not in ADMIN_EMAILS leaves the existing role alone instead of
      // demoting someone who was promoted by hand.
      const role = isAdmin(primaryEmail) ? ("ADMIN" as const) : undefined;

      await db.user.upsert({
        where: { clerkId: data.id },
        update: { email: primaryEmail, name, image: data.image_url, role },
        create: {
          clerkId: data.id,
          email: primaryEmail,
          name,
          image: data.image_url,
          role: role ?? "USER",
          streak: { create: {} },
        },
      });
    }

    if (type === "user.deleted") {
      await db.user.deleteMany({ where: { clerkId: data.id } });
    }
  } catch (err) {
    // Without this, a database error escaped as an unhandled rejection and Next returned a
    // bare 500 with nothing naming the event. A 500 is still the right status — svix
    // retries it — but now the failure is attributable, and lib/auth.ts's provisionUser
    // covers the user in the meantime.
    console.error("[Clerk webhook] failed to apply", type, "for", data.id, err);
    return new Response("Database error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
