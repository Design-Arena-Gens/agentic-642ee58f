import { NextResponse } from "next/server";
import { z } from "zod";
import { runAgent } from "@/lib/agent";
import type { AgentRequestPayload } from "@/lib/types";

const bodySchema = z.object({
  topic: z.string().min(3).max(160),
  targetAudience: z.string().min(3).max(120),
  tone: z.string().min(3).max(60),
  deliverables: z.array(z.string()).min(1).max(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bodySchema.parse(body) as AgentRequestPayload;

    const result = await runAgent(parsed);

    return NextResponse.json(result);
  } catch (error) {
    console.error("API /generate error", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to generate research" },
      { status: 500 },
    );
  }
}

