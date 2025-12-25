"use client";

import { useState, useEffect } from "react";

type AppItem = {
  id: number;
  name: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  days: number;
};

type AppForm = {
  name: string;
  version: string;
  createdAt: string;
  updatedAt: string;
};

export default function Home() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [form, setForm] = useState<AppForm>({
    name: "",
    version: "",
    createdAt: "",
    updatedAt: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  // 初回ロード
    useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/apps");

      const raw: {
        id: number;
        name: string;
        version: string;
        createdAt?: string;
        updatedAt: string;
      }[] = await res.json();

      const now = Date.now();

      const withDays: AppItem[] = raw.map((item) => ({
        id: item.id,
        name: item.name,
        version: item.version,
        createdAt: item.createdAt ?? "",
        updatedAt: item.updatedAt,
        days: Math.floor((now - new Date(item.updatedAt).getTime()) / 86400000),
      }));

      setApps(withDays);
    };

    void load();
  }, []);

  // 追加 or 編集
  const submitForm = async () => {
    if (editingId === null) {
      const res = await fetch("/api/apps", {
        method: "POST",
        body: JSON.stringify(form),
      });

      const raw = await res.json();
      const now = Date.now();

      const newItem: AppItem = {
        ...raw,
        days: Math.floor((now - new Date(raw.updatedAt).getTime()) / 86400000),
      };

      setApps((prev) => [...prev, newItem]);
    } else {
  const now = Date.now();

  const days =
    form.updatedAt && form.updatedAt !== ""
      ? Math.floor(
          (now - new Date(form.updatedAt).getTime()) / 86400000
        )
      : 0;

  // ★ サーバーに保存（ここが今まで無かった）
  await fetch("/api/apps", {
    method: "PUT",
    body: JSON.stringify({
      id: editingId,
      name: form.name,
      version: form.version,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    }),
  });

  // ★ 画面も更新
  setApps((prev) =>
    prev.map((item) =>
      item.id === editingId
        ? {
            ...item,
            name: form.name,
            version: form.version,
            createdAt: form.createdAt,
            updatedAt: form.updatedAt,
            days,
          }
        : item
    )
  );

  setEditingId(null);
}

    setForm({
      name: "",
      version: "",
      createdAt: "",
      updatedAt: "",
    });
  };

  const startEdit = (item: AppItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      version: item.version,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  };

  const deleteItem = async (id: number) => {
  const ok = window.confirm("本当に削除しますか？");
  if (!ok) return;

  // API に削除リクエストを送る
  await fetch("/api/apps", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });

  // 画面上でも消す
  setApps((prev) => prev.filter((item) => item.id !== id));
};


  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f1f1",
        padding: "30px 0",
        fontFamily: "sans-serif",
      }}
    >
      {/* ★★★ 登録フォームを小さく上に配置 ★★★ */}
      <div
        style={{
          width: "100%",
          maxWidth: 700,
          margin: "0 auto 20px auto",
          background: "white",
          padding: 12,
          borderRadius: 6,
          boxShadow: "0 0 6px rgba(0,0,0,0.1)",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
        }}
      >
        <input
          placeholder="アプリ名"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={smallInput}
        />
        <input
          placeholder="バージョン"
          value={form.version}
          onChange={(e) => setForm({ ...form, version: e.target.value })}
          style={smallInput}
        />
        <input
          type="date"
          value={form.createdAt}
          onChange={(e) => setForm({ ...form, createdAt: e.target.value })}
          style={smallInput}
          placeholder="開発日"
        />
        <input
          type="date"
          value={form.updatedAt}
          onChange={(e) => setForm({ ...form, updatedAt: e.target.value })}
          style={smallInput}
          placeholder="更新日"
        />

        <button
          onClick={submitForm}
          style={{
            padding: "8px 14px",
            background: editingId ? "#ff9800" : "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          {editingId ? "更新" : "追加"}
        </button>
      </div>

      {/* ★★★ 一覧をメイン・大画面中央表示 ★★★ */}
      <div
        style={{
          width: "95%",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "white",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 0 8px rgba(0,0,0,0.15)",
          }}
        >
          <thead>
            <tr style={{ background: "#444" }}>
              <th style={th}>名前</th>
              <th style={th}>バージョン</th>
              <th style={th}>開発日</th>
              <th style={th}>更新日</th>
              <th style={th}>経過日</th>
              <th style={th}>操作</th>
            </tr>
          </thead>

          <tbody>
            {apps.map((app) => (
              <tr key={app.id} style={{ background: "white" }}>
                <td style={td}>{app.name}</td>
                <td style={td}>{app.version}</td>
                <td style={td}>{app.createdAt}</td>
                <td style={td}>{app.updatedAt}</td>
                 <td
                style={{
                  ...td,
                  color: app.days >= 7 ? "red" : "black",
                  fontWeight: app.days >= 7 ? "bold" : "normal",
                }}
              >
                {app.days} 日
              </td>
                <td style={td}>
                  <button onClick={() => startEdit(app)} style={editBtn}>
                    📝
                  </button>
                  <button onClick={() => deleteItem(app.id)} style={deleteBtn}>
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Styles ---
const smallInput: React.CSSProperties = {
  padding: "6px 8px",
  fontSize: 14,
  borderRadius: 4,
  border: "1px solid #ccc",
  flex: "1 1 140px",
};

const th: React.CSSProperties = {
  padding: 12,
  color: "white",
  fontWeight: "bold",
  borderBottom: "1px solid #666",
};

const td: React.CSSProperties = {
  padding: 12,
  color: "black",
  borderBottom: "1px solid #eee",
  textAlign: "center",
};

const editBtn: React.CSSProperties = {
  padding: "5px 8px",
  marginRight: 6,
  background: "#FFA726",
  color: "white",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};

const deleteBtn: React.CSSProperties = {
  padding: "5px 8px",
  background: "#E53935",
  color: "white",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};
