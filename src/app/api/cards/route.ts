import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { columnId, title, desc, priority, due, assignee, tags } = body;

  // Verify ownership
  const col = await prisma.column.findFirst({
    where: { id: columnId, board: { userId: session.user.id } },
  });
  if (!col) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const count = await prisma.card.count({ where: { columnId } });

  const card = await prisma.card.create({
    data: {
      columnId,
      title,
      desc: desc || null,
      priority: priority || "low",
      due: due ? new Date(due) : null,
      assignee: assignee || null,
      tags: tags || [],
      order: count,
    },
  });

  return NextResponse.json(card);
}
