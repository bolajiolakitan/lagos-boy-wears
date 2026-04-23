"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

interface UploadedImage {
  url: string;
  preview: string;
  uploading?: boolean;
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "tops",
    stock: "",
    sizes: [] as string[],
  });
  const [images, setImages] = useState<UploadedImage[]>([]);

  const toggleSize = (size: string) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size)
        ? f.sizes.filter((s) => s !== size)
        : [...f.sizes, size],
    }));
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 5 - images.length);
    if (newFiles.length === 0) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    // Create previews immediately
    const previews: UploadedImage[] = newFiles.map((f) => ({
      url: "",
      preview: URL.createObjectURL(f),
      uploading: true,
    }));

    setImages((prev) => [...prev, ...previews]);

    // Upload each file
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok) {
          setImages((prev) => {
            const updated = [...prev];
            const idx = prev.findIndex((img) => img.preview === previews[i].preview);
            if (idx !== -1) updated[idx] = { url: data.url, preview: previews[i].preview, uploading: false };
            return updated;
          });
        } else {
          toast.error(`Failed to upload ${file.name}`);
          setImages((prev) => prev.filter((img) => img.preview !== previews[i].preview));
        }
      } catch {
        toast.error(`Upload failed for ${file.name}`);
        setImages((prev) => prev.filter((img) => img.preview !== previews[i].preview));
      }
    }
  };

  const removeImage = (preview: string) => {
    setImages((prev) => prev.filter((img) => img.preview !== preview));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.some((img) => img.uploading)) {
      toast.error("Please wait for all images to finish uploading");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price) * 100,
          stock: Number(form.stock),
          images: images.map((img) => img.url),
          sizes: form.sizes.length > 0 ? form.sizes : ["S", "M", "L", "XL"],
        }),
      });

      if (res.ok) {
        toast.success("Product created!");
        router.push("/admin/products");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create product");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
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

  return (
    <div className="container" style={{ padding: "3rem 1.5rem", maxWidth: "860px" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <a
          href="/admin/products"
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--gray-400)", letterSpacing: "0.05em" }}
        >
          ← Back to Products
        </a>
        <h1 style={{ marginTop: "0.75rem", fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>ADD PRODUCT</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "2rem" }}>
        {/* Image Upload */}
        <div>
          <label style={labelStyle}>Product Images</label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
              gap: "0.75rem",
              marginBottom: "0.75rem",
            }}
          >
            {images.map((img) => (
              <div key={img.preview} style={{ position: "relative", aspectRatio: "3/4", background: "var(--gray-100)", overflow: "hidden" }}>
                <img src={img.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: img.uploading ? 0.5 : 1 }} />
                {img.uploading && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--gray-600)", letterSpacing: "0.05em" }}>UPLOADING…</span>
                  </div>
                )}
                {!img.uploading && (
                  <button
                    type="button"
                    onClick={() => removeImage(img.preview)}
                    style={{
                      position: "absolute", top: "4px", right: "4px",
                      width: "22px", height: "22px", background: "var(--black)", color: "var(--white)",
                      border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.7rem", cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            {images.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  aspectRatio: "3/4",
                  border: "2px dashed var(--gray-300)",
                  background: "transparent",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                  transition: "border-color 0.2s ease",
                  minHeight: "110px",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.05em", color: "var(--gray-400)" }}>
                  ADD IMAGE
                </span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gray-400)", letterSpacing: "0.03em" }}>
            Up to 5 images. JPG/PNG/WEBP. First image is the cover.
          </p>
        </div>

        {/* Name */}
        <div>
          <label style={labelStyle}>Product Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
            placeholder="e.g. Lagos Boy Heavyweight Hoodie"
          />
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description *</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field"
            placeholder="Product details, material, fit..."
          />
        </div>

        {/* Price + Stock */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div>
            <label style={labelStyle}>Price (NGN) *</label>
            <input
              type="number"
              required
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="input-field"
              placeholder="e.g. 25000"
            />
          </div>
          <div>
            <label style={labelStyle}>Stock *</label>
            <input
              type="number"
              required
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="input-field"
              placeholder="e.g. 50"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label style={labelStyle}>Category *</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="input-field"
            style={{ appearance: "none", cursor: "pointer" }}
          >
            <option value="tops">Tops</option>
            <option value="bottoms">Bottoms</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>

        {/* Sizes */}
        <div>
          <label style={labelStyle}>Available Sizes</label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                style={{
                  width: "48px",
                  height: "48px",
                  border: "2px solid var(--black)",
                  background: form.sizes.includes(size) ? "var(--black)" : "transparent",
                  color: form.sizes.includes(size) ? "var(--white)" : "var(--black)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {size}
              </button>
            ))}
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gray-400)", marginTop: "0.5rem", letterSpacing: "0.03em" }}>
            If none selected, defaults to S/M/L/XL
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem", paddingTop: "0.5rem" }}>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving…" : "Save Product"}
          </button>
          <a href="/admin/products" className="btn-secondary">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
