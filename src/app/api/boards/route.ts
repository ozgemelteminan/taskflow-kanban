import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const boards = await prisma.board.findMany({
    where: { userId: session.user.id },
    include: {
      columns: {
        orderBy: { order: "asc" },
        include: { cards: { orderBy: { order: "asc" } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(boards);
}

const createSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().default("#7c6ef5"),
  emoji: z.string().default("📋"),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, color, emoji } = createSchema.parse(body);

  const board = await prisma.board.create({
    data: {
      name,
      color,
      emoji,
      userId: session.user.id,
      columns: {
        create: [
          { name: "Yapılacak", color: "#4da6ff", order: 0 },
          { name: "Devam Ediyor", color: "#f5a623", order: 1 },
          { name: "Tamamlandı", color: "#4eca8b", order: 2 },
        ],
      },
    },
    include: {
      columns: {
        orderBy: { order: "asc" },
        include: { cards: { orderBy: { order: "asc" } } },
      },
    },
  });

  return NextResponse.json(board);
}
