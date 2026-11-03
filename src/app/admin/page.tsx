"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, ShieldCheck, LogOut, Plus, Trash2, RefreshCw,
  ImageIcon, Heart, Search, Upload, X, ChevronLeft, ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";

/* ─── Types ────────────────────────────────────────── */
interface ImageRecord {
  _id: string;
  title: string;
  imageUrl: string;
  prompt: string;
  model: string;
  category: string;
  tags: string[];
  likes: number;
  createdAt: string;
}

const CATEGORIES = [
  "Professional ID Photo","LinkedIn Profile Photo","Professional Portrait",
  "Cinematic Photography","Anime","Fantasy Art","Product Photography",
  "Fashion Photography","Nature","Architecture","3D Art","Digital Art",
  "Social Media","Illustration","Other",
];

const MODELS = [
  "Midjourney v6","DALL·E 3","Stable Diffusion XL","Adobe Firefly","Ideogram","Flux","Other",
];

/* ─── Helpers ──────────────────────────────────────── */
function getToken() { return typeof window !== "undefined" ? localStorage.getItem("admin_token") : null; }
function authHeader() { return { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" }; }

/* ═══════════════════════════════════════════════════ */
export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  // Login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loadingImages, setLoadingImages] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Upload form
  const [form, setForm] = useState({
    title: "", imageUrl: "", prompt: "", model: MODELS[0],
    category: CATEGORIES[0], tags: "", imageKitFileId: "",
  });
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  /* ── Auth check ─────────────────────────────────── */
  useEffect(() => {
    const token = getToken();
    setAuthed(!!token);
    setChecking(false);
  }, []);

  /* ── Login ──────────────────────────────────────── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Login failed"); return; }
      localStorage.setItem("admin_token", data.token);
      setAuthed(true);
      toast.success("Welcome back, Admin!");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setAuthed(false);
    toast.success("Logged out");
  };

  /* ── Fetch images ───────────────────────────────── */
  const fetchImages = useCallback(async () => {
    setLoadingImages(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "12", search });
      const res = await fetch(`/api/admin/images?${params}`, { headers: authHeader() });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      setImages(data.images || []);
      setTotal(data.total || 0);
    } catch { toast.error("Failed to load images"); }
    finally { setLoadingImages(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  useEffect(() => { if (authed) fetchImages(); }, [authed, fetchImages]);

  /* ── Upload to ImageKit then save ──────────────── */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.prompt || !form.model) {
      toast.error("Title, prompt, and model are required");
      return;
    }

    setUploading(true);
    try {
      let imageUrl = form.imageUrl;
      let imageKitFileId = form.imageKitFileId;

      // Upload file to ImageKit if a file was selected
      if (previewFile) {
        // Get auth params
        const authRes = await fetch("/api/admin/upload-auth", { headers: { Authorization: `Bearer ${getToken()}` } });
        if (!authRes.ok) { toast.error("Upload auth failed"); return; }
        const { signature, expire, token } = await authRes.json();

        const ikForm = new FormData();
        ikForm.append("file", previewFile);
        ikForm.append("fileName", `pixnora_${Date.now()}_${previewFile.name}`);
        ikForm.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "");
        ikForm.append("signature", signature);
        ikForm.append("expire", String(expire));
        ikForm.append("token", token);
        ikForm.append("folder", "/pixnora");

        const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
          method: "POST", body: ikForm,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) { toast.error("Image upload failed"); return; }
        imageUrl = uploadData.url;
        imageKitFileId = uploadData.fileId;
      }

      if (!imageUrl) { toast.error("Provide an image URL or upload a file"); return; }

      const res = await fetch("/api/admin/images", {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ ...form, imageUrl, imageKitFileId }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to save"); return; }

      toast.success("Image added successfully!");
      setShowForm(false);
      setForm({ title: "", imageUrl: "", prompt: "", model: MODELS[0], category: CATEGORIES[0], tags: "", imageKitFileId: "" });
      setPreviewFile(null);
      setPreviewUrl("");
      fetchImages();
    } finally {
      setUploading(false);
    }
  };

  /* ── Delete ─────────────────────────────────────── */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this image? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/images/${id}`, { method: "DELETE", headers: authHeader() });
      if (res.ok) { toast.success("Deleted!"); fetchImages(); }
      else toast.error("Delete failed");
    } finally { setDeletingId(null); }
  };

  /* ─── Loading ─────────────────────────────────── */
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg)" }}>
        <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "var(--accent1)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  /* ═══════════ LOGIN SCREEN ═══════════════════════ */
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--bg)", backgroundImage: "var(--grad-hero)" }}>
        <div className="w-full max-w-sm rounded-3xl p-8 fade-in" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "var(--grad-btn)" }}>
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black grad-text">Admin Login</h1>
            <p className="text-sm text-center" style={{ color: "var(--fg-muted)" }}>Pixnora management portal</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--fg-muted)" }}>Email</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--bg-glass)", border: "1px solid var(--border)", color: "var(--fg)" }}
                placeholder="admin@pixnora.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--fg-muted)" }}>Password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--bg-glass)", border: "1px solid var(--border)", color: "var(--fg)" }}
                placeholder="••••••••"
              />
            </div>
            <button
              id="admin-login-btn"
              type="submit"
              disabled={loginLoading}
              className="mt-2 py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: "var(--grad-btn)" }}
            >
              {loginLoading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs" style={{ color: "var(--fg-muted)" }}>
            Default: admin@pixnora.com / Admin@123
          </p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / 12);

  /* ═══════════ DASHBOARD ══════════════════════════ */
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--grad-btn)" }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-black grad-text">Pixnora Admin</p>
            <p className="text-xs" style={{ color: "var(--fg-muted)" }}>{total} images total</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="add-image-btn"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--grad-btn)" }}
          >
            <Plus className="w-4 h-4" /> Add Image
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all hover:opacity-80"
            style={{ background: "var(--bg-glass)", border: "1px solid var(--border)", color: "var(--fg-muted)" }}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search + refresh */}
      <div className="px-4 md:px-8 py-4 flex items-center gap-3">
        <div className="flex items-center flex-1 max-w-sm gap-2 px-3 py-2 rounded-xl" style={{ background: "var(--bg-glass)", border: "1px solid var(--border)" }}>
          <Search className="w-4 h-4" style={{ color: "var(--fg-muted)" }} />
          <input
            type="text"
            placeholder="Search images…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "var(--fg)" }}
          />
        </div>
        <button onClick={fetchImages} className="p-2.5 rounded-xl transition-all hover:opacity-80" style={{ background: "var(--bg-glass)", border: "1px solid var(--border)" }}>
          <RefreshCw className="w-4 h-4" style={{ color: "var(--fg-muted)" }} />
        </button>
      </div>

      {/* Grid */}
      <div className="px-4 md:px-8 pb-12">
        {loadingImages ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl" style={{ height: 220, background: "var(--bg-card)", border: "1px solid var(--border)", animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <ImageIcon className="w-12 h-12" style={{ color: "var(--fg-muted)" }} />
            <h2 className="text-lg font-bold" style={{ color: "var(--fg)" }}>No images yet</h2>
            <p style={{ color: "var(--fg-muted)" }}>Click &quot;Add Image&quot; to get started</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img) => (
                <div key={img._id} className="relative group rounded-2xl overflow-hidden fade-in" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.imageUrl} alt={img.title} className="w-full h-44 object-cover" />
                  <div className="p-3">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--fg)" }}>{img.title}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "var(--fg-muted)" }}>{img.model} · {img.category}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--fg-muted)" }}>
                        <Heart className="w-3 h-3" /> {img.likes}
                      </span>
                      <button
                        onClick={() => handleDelete(img._id)}
                        disabled={deletingId === img._id}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all hover:opacity-80"
                        style={{ background: "var(--bg-glass)", color: "var(--fg)" }}
                      >
                        <Trash2 className="w-3 h-3" />
                        {deletingId === img._id ? "…" : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-full disabled:opacity-30" style={{ background: "var(--bg-glass)", border: "1px solid var(--border)" }}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm" style={{ color: "var(--fg-muted)" }}>Page {page} / {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-full disabled:opacity-30" style={{ background: "var(--bg-glass)", border: "1px solid var(--border)" }}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Add image drawer/modal ─────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div
            className="w-full max-w-lg rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black grad-text">Add New Image</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-full" style={{ background: "var(--bg-glass)" }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* File upload */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--fg-muted)" }}>Upload Image (via ImageKit)</label>
                {previewUrl ? (
                  <div className="relative rounded-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="preview" className="w-full h-44 object-cover" />
                    <button type="button" onClick={() => { setPreviewUrl(""); setPreviewFile(null); }} className="absolute top-2 right-2 p-1 rounded-full bg-black/60">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 rounded-xl cursor-pointer border-2 border-dashed transition-all hover:opacity-80"
                    style={{ borderColor: "var(--border)", background: "var(--bg-glass)" }}>
                    <Upload className="w-6 h-6 mb-2" style={{ color: "var(--fg-muted)" }} />
                    <span className="text-sm" style={{ color: "var(--fg-muted)" }}>Click to upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                  </label>
                )}
              </div>

              {/* OR manual URL */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--fg-muted)" }}>
                  — or paste Image URL —
                </label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--bg-glass)", border: "1px solid var(--border)", color: "var(--fg)" }}
                />
              </div>

              {[
                { label: "Title *", key: "title", type: "text", placeholder: "e.g. Cosmic Solitude" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--fg-muted)" }}>{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    required={label.includes("*")}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--bg-glass)", border: "1px solid var(--border)", color: "var(--fg)" }}
                  />
                </div>
              ))}

              {/* Prompt */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--fg-muted)" }}>Prompt *</label>
                <textarea
                  value={form.prompt}
                  onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
                  required
                  rows={4}
                  placeholder="Full AI image prompt…"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={{ background: "var(--bg-glass)", border: "1px solid var(--border)", color: "var(--fg)" }}
                />
              </div>

              {/* Model */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--fg-muted)" }}>AI Model *</label>
                <select
                  value={form.model}
                  onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--bg-glass)", border: "1px solid var(--border)", color: "var(--fg)" }}
                >
                  {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--fg-muted)" }}>Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--bg-glass)", border: "1px solid var(--border)", color: "var(--fg)" }}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--fg-muted)" }}>Tags (comma separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="portrait, dark, cinematic"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--bg-glass)", border: "1px solid var(--border)", color: "var(--fg)" }}
                />
              </div>

              <button
                id="submit-image-btn"
                type="submit"
                disabled={uploading}
                className="mt-2 py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: "var(--grad-btn)" }}
              >
                {uploading ? "Uploading & Saving…" : "Save Image"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
