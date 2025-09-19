import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import StudyBlock from "@/app/models/StudyBlock";
import { createClient } from "@supabase/supabase-js";
import mongoose from "mongoose";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    await connectDB();
    const { userId, startTime, endTime } = await req.json();

    // 1. Validate
    if (!startTime || !endTime) {
      return Response.json({ error: "Start and end time required" }, { status: 400 });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) {
      return Response.json({ error: "Start time must be before end time" }, { status: 400 });
    }

    // 2. Check overlapping
    const overlap = await StudyBlock.findOne({
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }, // any overlap
      ],
    });

    if (overlap) {
      return Response.json({ error: "Time block overlaps with existing block" }, { status: 400 });
    }

    // 3. Create
    const block = await StudyBlock.create({ userId, startTime: start, endTime: end });
    return Response.json(block, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}





export async function GET() {
  try {
    await connectDB();
    const blocks = await StudyBlock.find().sort({ startTime: 1 }); // sort by start time
    return Response.json(blocks, { status: 200 }); // return array
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}


