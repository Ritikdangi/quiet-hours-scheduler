import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import StudyBlock from "@/app/models/StudyBlock";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    await connectDB();

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { startTime, endTime } = await req.json();

    if (!startTime || !endTime) {
      return NextResponse.json({ error: "Start and end time required" }, { status: 400 });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) {
      return NextResponse.json({ error: "Start time must be before end time" }, { status: 400 });
    }

    const overlap = await StudyBlock.findOne({
      userId: user.id,
      $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }],
    });

    if (overlap) {
      return NextResponse.json({ error: "Time block overlaps with your existing block" }, { status: 400 });
    }

    const block = await StudyBlock.create({
      userId: user.id,
      userEmail: user.email,
      startTime: start,
      endTime: end,
      reminderSent: false,
    });

    return NextResponse.json(block, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const blocks = await StudyBlock.find({ userId: user.id }).sort({ startTime: 1 });

    return NextResponse.json(blocks, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
