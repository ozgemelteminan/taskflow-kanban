import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { BoardClient } from "@/components/board/BoardClient";

export default async function BoardPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const board = await prisma.board.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      columns: {
        orderBy: { order: "asc" },
        include: { cards: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!board) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={session.user} boardName={board.name} boardId={board.id} />
      <main className="flex-1 overflow-hidden">
        <BoardClient initialBoard={board} userId={session.user.id} />
      </main>
    </div>
  );
}
