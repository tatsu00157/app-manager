import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type AppRecord = {
  id: number;
  name: string;
  version: string;
  createdAt?: string;
  updatedAt: string;
  status?: string;
  platform?: string[];
  storeUrl?: string;
  memo?: string;
};

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
    id: Date.now(),
    ...body,
  };

  data.push(newItem);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  return NextResponse.json(newItem);
}


export async function DELETE(req: Request) {
  const { id } = (await req.json()) as { id: number };

  const data = JSON.parse(
    fs.readFileSync(filePath, "utf-8")
  ) as AppRecord[];

  const newData = data.filter((item) => item.id !== id);

  fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));

  return NextResponse.json({ success: true });
}
export async function PUT(req: Request) {
  const body = (await req.json()) as AppRecord;

  const data = JSON.parse(
    fs.readFileSync(filePath, "utf-8")
  ) as AppRecord[];

  const newData = data.map((item) =>
    item.id === body.id
      ? {
          ...item,
          name: body.name,
          version: body.version,
          createdAt: body.createdAt,
          updatedAt: body.updatedAt,
          status: body.status,
          platform: body.platform,
          storeUrl: body.storeUrl,
          memo: body.memo,
        }
      : item
  );

  fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));

  return NextResponse.json({ success: true });
}

