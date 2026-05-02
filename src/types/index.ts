export interface CardType {
  id: string;
  title: string;
  desc?: string | null;
  order: number;
  priority: string;
  due?: Date | null;
  assignee?: string | null;
  tags: string[];
  columnId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ColumnType {
  id: string;
  name: string;
  color: string;
  order: number;
  boardId: string;
  cards: CardType[];
}

export interface BoardType {
  id: string;
  name: string;
  color: string;
  emoji: string;
  userId: string;
  columns: ColumnType[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityType {
  id: string;
  action: string;
  fromCol?: string | null;
  toCol?: string | null;
  createdAt: Date;
  boardId: string;
  user: { name: string };
}
