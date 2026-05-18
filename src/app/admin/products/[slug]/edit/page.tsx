"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const PRESET_COLORS = ["Black", "White", "Cream", "Brown", "Grey", "Navy", "Red", "Green", "Blue", "Olive", "Orange", "Pink"];

interface UploadedImage {
  url: string;
  preview: string;
  uploading?: boolean;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loadingProduct, setLoadingProduct] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "tops",
    collectionId: "",
    stock: "",
    sizes: [] as string[],
    colors: [] as string[],
    isActive: true,
  });
  const [customColor, setCustomColor] = useState("");

  useEffect(() => {
    fetch("/api/collections?all=true")
      .then((r) => r.json())
      .then((data) => setCollections(data.collections ?? []))
      .catch((err) => console.error("Error loading collections:", err));
  }, []);

  useEffect(() => {
    if (params.slug) {
      fetch(`/api/products/${params.slug}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.product) {
            const p = data.product;
            setForm({
              name: p.name,
              description: p.description,
              price: String(p.price / 100),
              category: p.category,
              collectionId: p.collectionId ?? "",
              stock: String(p.stock),
              sizes: p.sizes ?? [],
              colors: p.colors ?? [],
              isActive: p.isActive,
            });
            setImages((p.images ?? []).map((url: string) => ({ url, preview: url })));
          }
          setLoadingProduct(false);
        })
        .catch(() => setLoadingProduct(false));
    }
  }, [params.slug]);

  const toggleSize = (size: string) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
    }));
  };

  const toggleColor = (color: string) => {
    setForm((f) => ({
      ...f,
      colors: f.colors.includes(color) ? f.colors.filter((c) => c !== color) : [...f.colors, color],
    }));
  };

  const addCustomColor = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!customColor.trim()) return;
    const formatted = customColor.trim();
    if (!form.colors.includes(formatted)) {
      setForm((f) => ({
        ...f,
        colors: [...f.colors, formatted],
      }));
    }
    setCustomColor("");
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 5 - images.length);
    if (newFiles.length === 0) { toast.error("Maximum 5 images allowed"); return; }

    const previews: UploadedImage[] = newFiles.map((f) => ({
      url: "",
      preview: URL.createObjectURL(f),
      uploading: true,
    }));
    setImages((prev) => [...prev, ...previews]);

    for (let i = 0; i < newFiles.length; i++) {
      try {
        const fd = new FormData();
        fd.append("file", newFiles[i]);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (res.ok) {
          setImages((prev) => {
            const updated = [...prev];
            const idx = prev.findIndex((img) => img.preview === previews[i].preview);
            if (idx !== -1) updated[idx] = { url: data.url, preview: previews[i].preview, uploading: false };
            return updated;
          });
        } else {
          toast.error(`Failed to upload ${newFiles[i].name}`);
          setImages((prev) => prev.filter((img) => img.preview !== previews[i].preview));
        }
      } catch {
        toast.error(`Upload failed for ${newFiles[i].name}`);
        setImages((prev) => prev.filter((img) => img.preview !== previews[i].preview));
      }
    }
  };

  const removeImage = (preview: string) => setImages((prev) => prev.filter((img) => img.preview !== preview));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.some((img) => img.uploading)) { toast.error("Wait for uploads to finish"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${params.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Number(form.price) * 100,
          category: form.category,
          collectionId: form.collectionId || null,
          stock: Number(form.stock),
          sizes: form.sizes.length > 0 ? form.sizes : ["S", "M", "L", "XL"],
          colors: form.colors,
          images: images.map((img) => img.url),
          isActive: form.isActive,
        }),
      });
      if (res.ok) {
        toast.success("Product updated!");
        router.push("/admin/products");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update product");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const labelStyle = {
    display: "block",
    fontFamily: "var(--font-body)",
    fontWeight: 600 as const,
    fontSize: "0.75rem",
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    marginBottom: "0.5rem",
  };

  if (loadingProduct) {
    return (
      <div className="container" style={{ padding: "4rem 1.5rem" }}>
        <div style={{ height: "40px", background: "var(--gray-100)", width: "200px", marginBottom: "2rem" }} />
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: "48px", background: "var(--gray-100)" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "3rem 1.5rem", maxWidth: "860px" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <a href="/admin/products" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--gray-400)", letterSpacing: "0.05em" }}>
          ← Back to Products
        </a>
        <h1 style={{ marginTop: "0.75rem", fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>EDIT PRODUCT</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "2rem" }}>
        {/* Image Upload */}
        <div>
          <label style={labelStyle}>Product Images</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "0.75rem", marginBottom: "0.75rem" }}>
            {images.map((img) => (
              <div key={img.preview} style={{ position: "relative", aspectRatio: "3/4", background: "var(--gray-100)", overflow: "hidden" }}>
                <img src={img.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: img.uploading ? 0.5 : 1 }} />
                {img.uploading && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--gray-600)" }}>UPLOADING…</span>
                  </div>
                )}
                {!img.uploading && (
                  <button type="button" onClick={() => removeImage(img.preview)}
                    style={{ position: "absolute", top: "4px", right: "4px", width: "22px", height: "22px", background: "var(--black)", color: "var(--white)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", cursor: "pointer" }}>
                    ✕
                  </button>
                )}
              </div>
            ))}
            {images.length < 5 && (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                style={{ aspectRatio: "3/4", border: "2px dashed var(--gray-300)", background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer", minHeight: "110px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.05em", color: "var(--gray-400)" }}>ADD IMAGE</span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
        </div>

        {/* Name */}
        <div>
          <label style={labelStyle}>Product Name *</label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description *</label>
          <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" />
        </div>

        {/* Price + Stock */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div>
            <label style={labelStyle}>Price (NGN) *</label>
            <input type="number" required min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
          </div>
          <div>
            <label style={labelStyle}>Stock *</label>
            <input type="number" required min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" />
          </div>
        </div>

        {/* Category */}
        <div>
          <label style={labelStyle}>Category *</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" style={{ appearance: "none", cursor: "pointer" }}>
            <option value="tops">Tops</option>
            <option value="bottoms">Bottoms</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>

        {/* Collection */}
        <div>
          <label style={labelStyle}>Linked Collection (Drop)</label>
          <select value={form.collectionId} onChange={(e) => setForm({ ...form, collectionId: e.target.value })} className="input-field" style={{ appearance: "none", cursor: "pointer" }}>
            <option value="">No Collection (Standalone product)</option>
            {collections.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name} {!col.isActive ? " (Inactive)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Sizes */}
        <div>
          <label style={labelStyle}>Available Sizes</label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {SIZES.map((size) => (
              <button key={size} type="button" onClick={() => toggleSize(size)}
                style={{ width: "48px", height: "48px", border: "2px solid var(--black)", background: form.sizes.includes(size) ? "var(--black)" : "transparent", color: form.sizes.includes(size) ? "var(--white)" : "var(--black)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", transition: "all 0.15s ease" }}>
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div>
          <label style={labelStyle}>Available Colors</label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => toggleColor(color)}
                style={{
                  padding: "0.5rem 1rem",
                  border: "2px solid var(--black)",
                  background: form.colors.includes(color) ? "var(--black)" : "transparent",
                  color: form.colors.includes(color) ? "var(--white)" : "var(--black)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {color}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            <input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="input-field"
              placeholder="Or type a custom color (e.g. Sage Green)..."
              style={{ marginBottom: 0, flex: 1 }}
            />
            <button
              onClick={addCustomColor}
              className="btn-primary"
              style={{ padding: "0 1.5rem", height: "46px" }}
            >
              Add
            </button>
          </div>
          
          {form.colors.length > 0 && (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--gray-600)", marginTop: "0.75rem" }}>
              SELECTED: {form.colors.join(", ")}
            </p>
          )}
        </div>

        {/* Active toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <input
            type="checkbox"
            id="isActive"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            style={{ width: "18px", height: "18px", cursor: "pointer" }}
          />
          <label htmlFor="isActive" style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
            Product is Active (visible on the shop)
          </label>
        </div>

        <div style={{ display: "flex", gap: "1rem", paddingTop: "0.5rem" }}>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <a href="/admin/products" className="btn-secondary">Cancel</a>
        </div>
      </form>
    </div>
  );
}
