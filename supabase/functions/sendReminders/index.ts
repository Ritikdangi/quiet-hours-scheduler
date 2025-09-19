// index.ts
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { MongoClient, Database } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

const MONGODB_URI = Deno.env.get("MONGODB_URI")!;
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY")!;
const EMAIL_FROM = Deno.env.get("EMAIL_FROM")!;

// Connect to MongoDB
const client = new MongoClient();
await client.connect(MONGODB_URI);
const db: Database = client.database("studyblocks");
const blocks = db.collection("studyblocks");

async function sendEmail(to: string, startTime: Date) {
  const body = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: EMAIL_FROM },
    subject: "📚 Study Block Reminder",
    content: [{ type: "text/plain", value: `Hi! Your study block starts at ${new Date(startTime).toLocaleString()}` }],
  };

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("Failed to send email", await res.text());
  }
}

serve(async (req) => {
  const now = new Date();
  const inTenMinutes = new Date(now.getTime() + 10 * 60000);

  const upcomingBlocks = await blocks.find({
    startTime: { $gte: now, $lte: inTenMinutes },
    reminderSent: false,
  }).toArray();

  for (const block of upcomingBlocks) {
    await sendEmail(block.userEmail, block.startTime);
    await blocks.updateOne({ _id: block._id }, { $set: { reminderSent: true } });
    console.log(`✅ Reminder sent to ${block.userEmail}`);
  }

  return new Response(JSON.stringify({ sent: upcomingBlocks.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
