"use client";

import { useState, useEffect } from "react";

const PINK = "#FF4D8D";
const PINK_LIGHT = "#FFF0F6";

type Status = "開発中" | "リリース済み" | "メンテナンス中" | "非公開";
type Platform = "iOS" | "Android" | "Web" | "その他";

type AppType = "personal" | "client";

type AppItem = {
  id: number;
  name: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  days: number;
  status: Status | "";
  platform: Platform[];
  storeUrl: string;
  memo: string;
  type: AppType;
  deliveryDate: string;
};

type AppForm = {
  name: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  status: Status | "";
  platform: Platform[];
  storeUrl: string;
  memo: string;
  type: AppType;
  deliveryDate: string;
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  開発中: { bg: "#BBDEFB", color: "#1565C0" },
  リリース済み: { bg: "#C8E6C9", color: "#2E7D32" },
  メンテナンス中: { bg: "#FFE0B2", color: "#E65100" },
  非公開: { bg: "#EEEEEE", color: "#616161" },
};

const ALL_PLATFORMS: Platform[] = ["iOS", "Android", "Web", "その他"];

const emptyForm: AppForm = {
  name: "",
  version: "",
  createdAt: "",
  updatedAt: "",
  status: "",
  platform: [],
  storeUrl: "",
  memo: "",
  type: "personal",
  deliveryDate: "",
};

export default function Home() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [form, setForm] = useState<AppForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | AppType>("all");

  useEffect(() => {
    void loadApps();
  }, []);

  const loadApps = async () => {
    const res = await fetch("/api/apps");
    const raw: {
      id: number;
      name: string;
      version: string;
      createdAt?: string;
      updatedAt: string;
      status?: string;
      platform?: string[];
      storeUrl?: string;
      memo?: string;
      type?: string;
      deliveryDate?: string;
    }[] = await res.json();

    const now = Date.now();
    const withDays: AppItem[] = raw.map((item) => ({
      id: item.id,
      name: item.name,
      version: item.version,
      createdAt: item.createdAt ?? "",
      updatedAt: item.updatedAt,
      days: item.updatedAt
        ? Math.floor((now - new Date(item.updatedAt).getTime()) / 86400000)
        : 0,
      status: (item.status as Status) ?? "",
      platform: (item.platform as Platform[]) ?? [],
      storeUrl: item.storeUrl ?? "",
      memo: item.memo ?? "",
      type: (item.type as AppType) ?? "personal",
      deliveryDate: item.deliveryDate ?? "",
    }));

    setApps(withDays);
  };

  const togglePlatform = (p: Platform) => {
    setForm((prev) => ({
      ...prev,
      platform: prev.platform.includes(p)
        ? prev.platform.filter((x) => x !== p)
        : [...prev.platform, p],
    }));
  };

  const submitForm = async () => {
    if (!form.name || !form.version) return;

    if (editingId === null) {
      const res = await fetch("/api/apps", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const raw = await res.json();
      const now = Date.now();
      const newItem: AppItem = {
        ...raw,
        days: raw.updatedAt
          ? Math.floor((now - new Date(raw.updatedAt).getTime()) / 86400000)
          : 0,
        status: raw.status ?? "",
        platform: raw.platform ?? [],
        storeUrl: raw.storeUrl ?? "",
        memo: raw.memo ?? "",
      };
      setApps((prev) => [...prev, newItem]);
    } else {
      const now = Date.now();
      const days = form.updatedAt
        ? Math.floor((now - new Date(form.updatedAt).getTime()) / 86400000)
        : 0;

      await fetch("/api/apps", {
        method: "PUT",
        body: JSON.stringify({ id: editingId, ...form }),
      });

      setApps((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...item, ...form, days } : item
        )
      );
      setEditingId(null);
    }

    setForm(emptyForm);
    setShowForm(false);
  };

  const startEdit = (item: AppItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      version: item.version,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      status: item.status,
      platform: item.platform,
      storeUrl: item.storeUrl,
      memo: item.memo,
      type: item.type,
      deliveryDate: item.deliveryDate,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteItem = async (id: number) => {
    const ok = window.confirm("本当に削除しますか？");
    if (!ok) return;
    await fetch("/api/apps", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    setApps((prev) => prev.filter((item) => item.id !== id));
  };

  const cancelForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const openNewForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        .app-table { width: 100%; border-collapse: collapse; }
        .app-table th { background: ${PINK}; color: white; font-weight: bold; font-size: 13px; padding: 12px 14px; text-align: left; }
        .app-table td { padding: 12px 14px; border-bottom: 1px solid #FFE4EF; font-size: 14px; vertical-align: top; text-align: left; color: #333; }
        .app-table tr:last-child td { border-bottom: none; }
        .app-table tr:hover td { background: #FFF8FB; }
        .cards-view { display: none; }
        @media (max-width: 768px) {
          .table-view { display: none; }
          .cards-view { display: block; }
          .stat-cards { flex-wrap: wrap; }
          .stat-card { flex: 1 1 calc(50% - 8px); }
        }
        input:focus, select:focus, textarea:focus {
          outline: 2px solid ${PINK};
          border-color: ${PINK} !important;
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: PINK_LIGHT, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", colorScheme: "light", color: "#333" }}>

        {/* Header */}
        <header style={{ background: PINK, padding: "16px 20px", boxShadow: "0 2px 12px rgba(255,77,141,0.35)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ margin: 0, color: "white", fontSize: 22, fontWeight: "bold", letterSpacing: 1 }}>
                App Manager
              </h1>
              <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
                自作アプリ管理ツール
              </p>
            </div>
            <button
              onClick={showForm ? cancelForm : openNewForm}
              style={{
                padding: "8px 18px",
                background: "white",
                color: PINK,
                border: "none",
                borderRadius: 20,
                fontWeight: "bold",
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              {showForm && !editingId ? "✕ 閉じる" : "+ 新規追加"}
            </button>
          </div>
        </header>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>

          {/* Form */}
          {showForm && (
            <div style={{
              background: "white",
              borderRadius: 12,
              boxShadow: "0 4px 20px rgba(255,77,141,0.15)",
              padding: 24,
              marginBottom: 20,
              borderTop: `4px solid ${PINK}`,
            }}>
              <h2 style={{ margin: "0 0 18px", fontSize: 16, color: "#333" }}>
                {editingId ? "✏️ アプリを編集" : "✨ 新規アプリを追加"}
              </h2>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                <div style={formGroup}>
                  <label style={labelStyle}>種別</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as AppType })}
                    style={inputStyle}
                  >
                    <option value="personal">自分用</option>
                    <option value="client">クライアント用</option>
                  </select>
                </div>

                <div style={formGroup}>
                  <label style={labelStyle}>アプリ名 *</label>
                  <input
                    placeholder="例: お薬リマインド"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div style={formGroup}>
                  <label style={labelStyle}>バージョン *</label>
                  <input
                    placeholder="例: 1.0.0"
                    value={form.version}
                    onChange={(e) => setForm({ ...form, version: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div style={formGroup}>
                  <label style={labelStyle}>ステータス</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as Status | "" })}
                    style={inputStyle}
                  >
                    <option value="">未設定</option>
                    <option value="開発中">開発中</option>
                    <option value="リリース済み">リリース済み</option>
                    <option value="メンテナンス中">メンテナンス中</option>
                    <option value="非公開">非公開</option>
                  </select>
                </div>

                <div style={formGroup}>
                  <label style={labelStyle}>開発日</label>
                  <input
                    type="date"
                    value={form.createdAt}
                    onChange={(e) => setForm({ ...form, createdAt: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div style={formGroup}>
                  <label style={labelStyle}>最終更新日</label>
                  <input
                    type="date"
                    value={form.updatedAt}
                    onChange={(e) => setForm({ ...form, updatedAt: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                {form.type === "client" && (
                  <div style={formGroup}>
                    <label style={labelStyle}>納品予定日</label>
                    <input
                      type="date"
                      value={form.deliveryDate}
                      onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                )}

                <div style={{ ...formGroup, flexBasis: "100%" }}>
                  <label style={labelStyle}>ストアURL</label>
                  <input
                    placeholder="https://apps.apple.com/..."
                    value={form.storeUrl}
                    onChange={(e) => setForm({ ...form, storeUrl: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div style={{ flexBasis: "100%" }}>
                  <label style={labelStyle}>プラットフォーム</label>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 6 }}>
                    {ALL_PLATFORMS.map((p) => (
                      <label key={p} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14 }}>
                        <input
                          type="checkbox"
                          checked={form.platform.includes(p)}
                          onChange={() => togglePlatform(p)}
                          style={{ accentColor: PINK, width: 16, height: 16, cursor: "pointer" }}
                        />
                        {p}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ ...formGroup, flexBasis: "100%" }}>
                  <label style={labelStyle}>メモ</label>
                  <textarea
                    placeholder="次にやること、課題、リリースメモなど..."
                    value={form.memo}
                    onChange={(e) => setForm({ ...form, memo: e.target.value })}
                    rows={2}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
                <button onClick={cancelForm} style={cancelBtnStyle}>キャンセル</button>
                <button onClick={submitForm} style={submitBtnStyle}>
                  {editingId ? "更新する" : "追加する"}
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          {(() => {
            const tabs: { key: "all" | AppType; label: string }[] = [
              { key: "all", label: "全て" },
              { key: "personal", label: "自分用" },
              { key: "client", label: "クライアント用" },
            ];
            return (
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      padding: "7px 18px",
                      borderRadius: 20,
                      border: `2px solid ${activeTab === tab.key ? PINK : "#ddd"}`,
                      background: activeTab === tab.key ? PINK : "white",
                      color: activeTab === tab.key ? "white" : "#888",
                      fontWeight: "bold",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {tab.label}
                    <span style={{
                      marginLeft: 6,
                      background: activeTab === tab.key ? "rgba(255,255,255,0.3)" : "#f0f0f0",
                      color: activeTab === tab.key ? "white" : "#aaa",
                      borderRadius: 10,
                      padding: "1px 7px",
                      fontSize: 12,
                    }}>
                      {tab.key === "all" ? apps.length : apps.filter((a) => a.type === tab.key).length}
                    </span>
                  </button>
                ))}
              </div>
            );
          })()}

          {/* Stats */}
          {(() => {
            const filteredApps = activeTab === "all" ? apps : apps.filter((a) => a.type === activeTab);
            return (
              <div className="stat-cards" style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <div className="stat-card" style={statCard}>
                  <span style={{ fontSize: 24, fontWeight: "bold", color: PINK }}>{filteredApps.length}</span>
                  <span style={{ fontSize: 12, color: "#888", marginTop: 2 }}>総アプリ数</span>
                </div>
                <div className="stat-card" style={statCard}>
                  <span style={{ fontSize: 24, fontWeight: "bold", color: "#2E7D32" }}>
                    {filteredApps.filter((a) => a.status === "リリース済み").length}
                  </span>
                  <span style={{ fontSize: 12, color: "#888", marginTop: 2 }}>リリース済み</span>
                </div>
                <div className="stat-card" style={statCard}>
                  <span style={{ fontSize: 24, fontWeight: "bold", color: "#1565C0" }}>
                    {filteredApps.filter((a) => a.status === "開発中").length}
                  </span>
                  <span style={{ fontSize: 12, color: "#888", marginTop: 2 }}>開発中</span>
                </div>
                <div className="stat-card" style={statCard}>
                  <span style={{ fontSize: 24, fontWeight: "bold", color: "#C62828" }}>
                    {filteredApps.filter((a) => a.days >= 7).length}
                  </span>
                  <span style={{ fontSize: 12, color: "#888", marginTop: 2 }}>7日以上未更新</span>
                </div>
              </div>
            );
          })()}

          {/* Desktop Table & Mobile Cards */}
          {(() => {
            const filteredApps = activeTab === "all" ? apps : apps.filter((a) => a.type === activeTab);
            const showTypeBadge = activeTab === "all";
            const showDelivery = activeTab !== "personal";
            const today = new Date(); today.setHours(0, 0, 0, 0);
            return (
              <>
                <div className="table-view" style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 16px rgba(255,77,141,0.1)", overflow: "hidden" }}>
                  <table className="app-table">
                    <thead>
                      <tr>
                        <th>アプリ名</th>
                        <th>バージョン</th>
                        <th>ステータス</th>
                        {showTypeBadge && <th>種別</th>}
                        <th>プラットフォーム</th>
                        <th>開発日</th>
                        <th>更新日</th>
                        <th>経過日</th>
                        {showDelivery && <th>納品予定日</th>}
                        <th>メモ</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApps.map((app) => (
                        <tr key={app.id}>
                          <td style={{ fontWeight: "bold" }}>
                            {app.storeUrl ? (
                              <a href={app.storeUrl} target="_blank" rel="noopener noreferrer"
                                style={{ color: PINK, textDecoration: "none" }}>
                                {app.name}
                                <span style={{ fontSize: 11, marginLeft: 4, opacity: 0.7 }}>↗</span>
                              </a>
                            ) : app.name}
                          </td>
                          <td style={{ color: "#888", fontSize: 13 }}>v{app.version}</td>
                          <td>
                            {app.status ? (
                              <span style={{
                                ...badgeStyle,
                                background: STATUS_COLORS[app.status]?.bg ?? "#eee",
                                color: STATUS_COLORS[app.status]?.color ?? "#666",
                              }}>
                                {app.status}
                              </span>
                            ) : <span style={{ color: "#ccc", fontSize: 13 }}>—</span>}
                          </td>
                          {showTypeBadge && (
                            <td>
                              <span style={{
                                ...badgeStyle,
                                background: app.type === "client" ? "#BBDEFB" : "#FFE4F0",
                                color: app.type === "client" ? "#1565C0" : PINK,
                              }}>
                                {app.type === "client" ? "クライアント" : "自分用"}
                              </span>
                            </td>
                          )}
                          <td style={{ fontSize: 13, color: "#555" }}>
                            {app.platform.length > 0 ? app.platform.join(" / ") : <span style={{ color: "#ccc" }}>—</span>}
                          </td>
                          <td style={{ fontSize: 13, color: "#888" }}>{app.createdAt || <span style={{ color: "#ccc" }}>—</span>}</td>
                          <td style={{ fontSize: 13, color: "#888" }}>{app.updatedAt || <span style={{ color: "#ccc" }}>—</span>}</td>
                          <td style={{
                            color: app.days >= 7 ? "#C62828" : "#333",
                            fontWeight: app.days >= 7 ? "bold" : "normal",
                            fontSize: 13,
                          }}>
                            {app.updatedAt ? `${app.days}日` : <span style={{ color: "#ccc" }}>—</span>}
                          </td>
                          {showDelivery && (() => {
                            if (app.type !== "client") return <td style={{ color: "#ccc", fontSize: 13 }}>—</td>;
                            const isPast = app.deliveryDate ? new Date(app.deliveryDate) < today : false;
                            const isNear = app.deliveryDate && !isPast
                              ? (new Date(app.deliveryDate).getTime() - today.getTime()) / 86400000 <= 7
                              : false;
                            return (
                              <td style={{
                                fontSize: 13,
                                color: isPast ? "#C62828" : isNear ? "#E65100" : "#555",
                                fontWeight: isPast || isNear ? "bold" : "normal",
                              }}>
                                {app.deliveryDate || <span style={{ color: "#ccc" }}>—</span>}
                                {isPast && <span style={{ marginLeft: 4, fontSize: 11 }}>期限超過</span>}
                                {isNear && <span style={{ marginLeft: 4, fontSize: 11 }}>まもなく</span>}
                              </td>
                            );
                          })()}
                          <td style={{ fontSize: 13, color: "#666", maxWidth: 180, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                            {app.memo || <span style={{ color: "#ccc" }}>—</span>}
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            <button onClick={() => startEdit(app)} style={editBtnStyle}>編集</button>
                            <button onClick={() => deleteItem(app.id)} style={deleteBtnStyle}>削除</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredApps.length === 0 && (
                    <div style={{ textAlign: "center", padding: 48, color: "#ccc", fontSize: 15 }}>
                      アプリがまだ登録されていません
                    </div>
                  )}
                </div>

                <div className="cards-view">
                  {filteredApps.map((app) => (
                    <div key={app.id} style={{
                      background: "white",
                      borderRadius: 12,
                      boxShadow: "0 2px 10px rgba(255,77,141,0.1)",
                      padding: 16,
                      marginBottom: 12,
                      borderLeft: `4px solid ${app.type === "client" ? "#1565C0" : PINK}`,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          {app.storeUrl ? (
                            <a href={app.storeUrl} target="_blank" rel="noopener noreferrer"
                              style={{ color: PINK, textDecoration: "none", fontWeight: "bold", fontSize: 16 }}>
                              {app.name} <span style={{ fontSize: 12, opacity: 0.7 }}>↗</span>
                            </a>
                          ) : (
                            <span style={{ fontWeight: "bold", fontSize: 16, color: "#333" }}>{app.name}</span>
                          )}
                          <span style={{ marginLeft: 8, color: "#aaa", fontSize: 13 }}>v{app.version}</span>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          {showTypeBadge && (
                            <span style={{
                              ...badgeStyle,
                              background: app.type === "client" ? "#BBDEFB" : "#FFE4F0",
                              color: app.type === "client" ? "#1565C0" : PINK,
                            }}>
                              {app.type === "client" ? "クライアント" : "自分用"}
                            </span>
                          )}
                          {app.status ? (
                            <span style={{
                              ...badgeStyle,
                              background: STATUS_COLORS[app.status]?.bg ?? "#eee",
                              color: STATUS_COLORS[app.status]?.color ?? "#666",
                            }}>
                              {app.status}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", fontSize: 13, color: "#555", marginBottom: 8 }}>
                        {app.platform.length > 0 && (
                          <div><span style={{ color: "#bbb" }}>プラットフォーム: </span>{app.platform.join(" / ")}</div>
                        )}
                        {app.createdAt && (
                          <div><span style={{ color: "#bbb" }}>開発日: </span>{app.createdAt}</div>
                        )}
                        {app.updatedAt && (
                          <div style={{ gridColumn: "1 / -1" }}>
                            <span style={{ color: "#bbb" }}>更新日: </span>
                            <span style={{ color: app.days >= 7 ? "#C62828" : "inherit", fontWeight: app.days >= 7 ? "bold" : "normal" }}>
                              {app.updatedAt}（{app.days}日前）
                            </span>
                          </div>
                        )}
                        {app.type === "client" && (() => {
                          const isPast = app.deliveryDate ? new Date(app.deliveryDate) < today : false;
                          const isNear = app.deliveryDate && !isPast
                            ? (new Date(app.deliveryDate).getTime() - today.getTime()) / 86400000 <= 7
                            : false;
                          return (
                            <div style={{ gridColumn: "1 / -1" }}>
                              <span style={{ color: "#bbb" }}>納品予定日: </span>
                              {app.deliveryDate ? (
                                <span style={{ color: isPast ? "#C62828" : isNear ? "#E65100" : "inherit", fontWeight: isPast || isNear ? "bold" : "normal" }}>
                                  {app.deliveryDate}
                                  {isPast && <span style={{ marginLeft: 4, fontSize: 11 }}>期限超過</span>}
                                  {isNear && <span style={{ marginLeft: 4, fontSize: 11 }}>まもなく</span>}
                                </span>
                              ) : <span style={{ color: "#ccc" }}>—</span>}
                            </div>
                          );
                        })()}
                      </div>

                      {app.memo && (
                        <div style={{ fontSize: 13, color: "#555", background: "#FFF8FB", padding: "8px 12px", borderRadius: 8, marginBottom: 10, borderLeft: `3px solid ${PINK}` }}>
                          {app.memo}
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button onClick={() => startEdit(app)} style={editBtnStyle}>編集</button>
                        <button onClick={() => deleteItem(app.id)} style={deleteBtnStyle}>削除</button>
                      </div>
                    </div>
                  ))}
                  {filteredApps.length === 0 && (
                    <div style={{ textAlign: "center", padding: 48, color: "#ccc", fontSize: 15 }}>
                      アプリがまだ登録されていません
                    </div>
                  )}
                </div>
              </>
            );
          })()}

        </div>
      </div>
    </>
  );
}

// --- Styles ---
const formGroup: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  flex: "1 1 180px",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: "bold",
  color: "#666",
  marginBottom: 5,
};

const inputStyle: React.CSSProperties = {
  padding: "9px 11px",
  fontSize: 14,
  borderRadius: 7,
  border: "1px solid #E0E0E0",
  width: "100%",
  background: "#FAFAFA",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "3px 10px",
  borderRadius: 12,
  fontSize: 12,
  fontWeight: "bold",
  whiteSpace: "nowrap",
};

const statCard: React.CSSProperties = {
  background: "white",
  borderRadius: 10,
  padding: "12px 18px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  boxShadow: "0 1px 8px rgba(255,77,141,0.1)",
  flex: "1 1 80px",
};

const submitBtnStyle: React.CSSProperties = {
  padding: "10px 22px",
  background: PINK,
  color: "white",
  border: "none",
  borderRadius: 7,
  fontWeight: "bold",
  fontSize: 14,
  cursor: "pointer",
};

const cancelBtnStyle: React.CSSProperties = {
  padding: "10px 22px",
  background: "white",
  color: "#888",
  border: "1px solid #ddd",
  borderRadius: 7,
  fontSize: 14,
  cursor: "pointer",
};

const editBtnStyle: React.CSSProperties = {
  padding: "5px 14px",
  marginRight: 6,
  background: "#FFF3E0",
  color: "#E65100",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: "bold",
};

const deleteBtnStyle: React.CSSProperties = {
  padding: "5px 14px",
  background: "#FFEBEE",
  color: "#C62828",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: "bold",
};
