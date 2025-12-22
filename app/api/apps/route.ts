import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "apps.json");

// GET: 一覧取得
export async function GET() {
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return NextResponse.json(data);
}

// POST: 新規追加
export async function POST(req: Request) {
  const body = await req.json();
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const newItem = {
    id: Date.now(), // ← server なので呼んでOK
    ...body,
  };

  data.push(newItem);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  return NextResponse.json(newItem);
}
type AppRecord = {
  id: number;
  name: string;
  version: string;
  createdAt?: string;
  updatedAt: string;
};

export async function DELETE(req: Request) {
  const { id } = (await req.json()) as { id: number };

  const data = JSON.parse(
    fs.readFileSync(filePath, "utf-8")
  ) as AppRecord[];

  const newData = data.filter((item) => item.id !== id);

  fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));

  return NextResponse.json({ success: true });
}
