import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Handles reordering cards across columns after a drag-drop
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { boardId, columns } = body;
  // columns: Array<{ id: string, cards: Array<{ id: string }> }>

  // Verify board ownership
  const board = await prisma.board.findFirst({
    where: { id: boardId, userId: session.user.id },
  });
  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Batch update card orders and column assignments
  const updates = columns.flatMap(
    (col: { id: string; cards: { id: string }[] }) =>
      col.cards.map((card: { id: string }, index: number) =>
        prisma.card.update({
          where: { id: card.id },
          data: { columnId: col.id, order: index },
        })
      )
  );

  await prisma.$transaction(updates);

  return NextResponse.json({ ok: true });
}
