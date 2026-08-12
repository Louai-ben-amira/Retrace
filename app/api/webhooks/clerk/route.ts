import { headers } from "next/headers";
import { Webhook } from "svix";
import { db } from "@/lib/db";

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

  if (type === "user.created" || type === "user.updated") {
    const primaryEmail = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id
    )?.email_address;

    if (!primaryEmail) return new Response("No email", { status: 400 });

    const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;

    await db.user.upsert({
      where: { clerkId: data.id },
      update: { email: primaryEmail, name, image: data.image_url },
      create: {
        clerkId: data.id,
        email: primaryEmail,
        name,
        image: data.image_url,
        streak: { create: {} },
      },
    });
  }

  if (type === "user.deleted") {
    await db.user.deleteMany({ where: { clerkId: data.id } });
  }

  return new Response("OK", { status: 200 });
}
