import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const activities = await prisma.activity.findMany({
    where: { boardId: params.id, board: { userId: session.user.id } },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(activities);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const activity = await prisma.activity.create({
    data: {
      action: body.action,
      fromCol: body.fromCol || null,
      toCol: body.toCol || null,
      boardId: params.id,
      userId: session.user.id,
    },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json(activity);
}
