import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const card = await prisma.card.findFirst({
    where: { id: params.id, column: { board: { userId: session.user.id } } },
  });
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  const updated = await prisma.card.update({
    where: { id: params.id },
    data: {
      title: body.title ?? card.title,
      desc: body.desc ?? card.desc,
      priority: body.priority ?? card.priority,
      due: body.due !== undefined ? (body.due ? new Date(body.due) : null) : card.due,
      assignee: body.assignee ?? card.assignee,
      tags: body.tags ?? card.tags,
      order: body.order ?? card.order,
      columnId: body.columnId ?? card.columnId,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const card = await prisma.card.findFirst({
    where: { id: params.id, column: { board: { userId: session.user.id } } },
  });
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.card.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
