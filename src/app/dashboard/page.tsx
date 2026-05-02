import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { BoardsClient } from "@/components/board/BoardsClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const boards = await prisma.board.findMany({
    where: { userId: session.user.id },
    include: {
      columns: {
        include: { cards: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={session.user} />
      <main className="flex-1 p-8 md:p-10">
        <BoardsClient initialBoards={boards} />
      </main>
    </div>
  );
}
