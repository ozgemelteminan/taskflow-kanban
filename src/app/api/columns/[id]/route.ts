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

  const col = await prisma.column.findFirst({
    where: { id: params.id, board: { userId: session.user.id } },
  });
  if (!col) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.column.update({
    where: { id: params.id },
    data: { name: body.name, color: body.color, order: body.order },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const col = await prisma.column.findFirst({
    where: { id: params.id, board: { userId: session.user.id } },
  });
  if (!col) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.column.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
