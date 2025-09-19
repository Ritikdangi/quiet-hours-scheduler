import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import StudyBlock from "@/app/models/StudyBlock";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const deleted = await StudyBlock.findOneAndDelete({
      _id: params.id,
      userId: user.id,
    });

    if (!deleted) {
      return NextResponse.json({ error: "Block not found or not yours" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: params.id });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
