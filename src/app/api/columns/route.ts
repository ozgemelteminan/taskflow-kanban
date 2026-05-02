import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { boardId, name, color } = body;

  // Verify board ownership
  const board = await prisma.board.findFirst({
    where: { id: boardId, userId: session.user.id },
  });
  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const count = await prisma.column.count({ where: { boardId } });

  const column = await prisma.column.create({
    data: { boardId, name, color: color || "#7c6ef5", order: count },
    include: { cards: true },
  });

  return NextResponse.json(column);
}
