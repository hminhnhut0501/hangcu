"use client";

import Image from "next/image";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import type { SiteAsset } from "@/modules/site-assets/types";
import type { SiteContentSettings } from "@/modules/site-settings/types";
import type { ProductSummary } from "@/modules/products/types";

type Props = {
  initialSettings: SiteContentSettings;
  initialAssets: SiteAsset[];
  initialProducts: ProductSummary[];
};

async function fetchJson(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json?.error?.message ?? "Request failed");
  }
  return json as any;
}

async function withCsrf(url: string, init: RequestInit) {
  const csrfJson = await fetchJson("/api/admin/csrf", { method: "GET", credentials: "include" });
  const token = csrfJson?.data?.token;
  if (!token) throw new Error("Missing CSRF token");
  return fetchJson(url, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      "x-csrf-token": token
    },
    credentials: "include"
  });
}

export function MediaManager({ initialSettings, initialAssets, initialProducts }: Props) {
  const [settings, setSettings] = useState(initialSettings);
  const [assets, setAssets] = useState(initialAssets);
  const [products, setProducts] = useState(initialProducts);
  const [selectedAssetKey, setSelectedAssetKey] = useState(initialAssets[0]?.assetKey ?? "");
  const [selectedProductSlug, setSelectedProductSlug] = useState(initialProducts[0]?.slug ?? "");
  const selectedAsset = useMemo(() => assets.find((asset) => asset.assetKey === selectedAssetKey) ?? null, [assets, selectedAssetKey]);
  const selectedProduct = useMemo(() => products.find((product) => product.slug === selectedProductSlug) ?? null, [products, selectedProductSlug]);
  const [heroDraft, setHeroDraft] = useState({
    heroImagePath: settings.heroImagePath ?? "",
    heroImageAltVi: settings.heroImageAltVi ?? "",
    heroImageAltEn: settings.heroImageAltEn ?? ""
  });
  const [siteForm, setSiteForm] = useState({
    assetKey: selectedAsset?.assetKey ?? "hero-home",
    category: selectedAsset?.category ?? "hero",
    altTextVi: selectedAsset?.altTextVi ?? "",
    altTextEn: selectedAsset?.altTextEn ?? "",
    sortOrder: selectedAsset?.sortOrder ?? 0
  });
  const [productForm, setProductForm] = useState({
    productSlug: selectedProduct?.slug ?? "",
    mediaType: "preview",
    altText: selectedProduct?.name ?? "",
    sortOrder: 0
  });
  const [status, setStatus] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(selectedAsset?.publicUrl ?? null);
  const [previewProductUrl, setPreviewProductUrl] = useState<string | null>(selectedProduct?.media[0]?.publicUrl ?? null);

  function applyAssetToHero(asset: SiteAsset) {
    setHeroDraft((current) => ({
      ...current,
      heroImagePath: asset.publicUrl ?? asset.storagePath,
      heroImageAltVi: asset.altTextVi ?? asset.assetKey,
      heroImageAltEn: asset.altTextEn ?? asset.assetKey
    }));
    setStatus(`Applied ${asset.assetKey} to hero preview.`);
  }

  function applyAssetToProduct(asset: SiteAsset) {
    setProductForm((current) => ({
      ...current,
      altText: asset.altTextEn ?? asset.assetKey
    }));
    setStatus(`Applied ${asset.assetKey} to product media preview.`);
  }

  async function refreshData() {
    const [assetsJson, productsJson] = await Promise.all([
      fetchJson("/api/admin/site-assets"),
      fetchJson("/api/admin/product-media?productSlug=" + encodeURIComponent(selectedProductSlug || initialProducts[0]?.slug || ""))
    ]);
    setAssets(assetsJson.data ?? []);
    setProducts((current) =>
      current.map((product) => (product.slug === selectedProductSlug ? { ...product, media: productsJson.data ?? product.media } : product))
    );
  }

  async function handleSiteUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Uploading site asset...");
    const formData = new FormData(event.currentTarget);
    try {
      await withCsrf("/api/admin/site-assets", { method: "POST", body: formData });
      await refreshData();
      setStatus("Site asset uploaded.");
    } catch {
      setStatus("Site asset upload failed.");
    }
  }

  async function handleProductUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Uploading product media...");
    const formData = new FormData(event.currentTarget);
    try {
      const result = await withCsrf("/api/admin/product-media", { method: "POST", body: formData });
      setProducts((current) =>
        current.map((product) => (product.slug === selectedProductSlug ? { ...product, media: result.data?.media ?? product.media } : product))
      );
      setStatus("Product media uploaded.");
    } catch {
      setStatus("Product media upload failed.");
    }
  }

  async function handleSaveHero(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Saving hero...");
    try {
      const payload = {
        ...settings,
        heroImagePath: heroDraft.heroImagePath || null,
        heroImageAltVi: heroDraft.heroImageAltVi || null,
        heroImageAltEn: heroDraft.heroImageAltEn || null,
        navigation: JSON.stringify(settings.navigation),
        faqItems: JSON.stringify(settings.faqItems)
      };
      const result = await withCsrf("/api/admin/site-settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      setSettings(result.data);
      setStatus("Hero saved.");
    } catch {
      setStatus("Hero save failed.");
    }
  }

  async function handleDeleteAsset(assetKey: string) {
    setStatus("Deleting asset...");
    try {
      await withCsrf(`/api/admin/site-assets?assetKey=${encodeURIComponent(assetKey)}`, { method: "DELETE" });
      setAssets((current) => current.filter((asset) => asset.assetKey !== assetKey));
      setStatus("Asset deleted.");
    } catch {
      setStatus("Asset delete failed.");
    }
  }

  async function handleDeleteMedia(mediaId: string) {
    if (!selectedProductSlug) return;
    setStatus("Deleting media...");
    try {
      const result = await withCsrf(
        `/api/admin/product-media?productSlug=${encodeURIComponent(selectedProductSlug)}&mediaId=${encodeURIComponent(mediaId)}`,
        { method: "DELETE" }
      );
      setProducts((current) =>
        current.map((product) => (product.slug === selectedProductSlug ? { ...product, media: result.data ?? product.media } : product))
      );
      setStatus("Media deleted.");
    } catch {
      setStatus("Media delete failed.");
    }
  }

  async function handleReorderMedia(mediaId: string, direction: "up" | "down") {
    if (!selectedProductSlug) return;
    const currentMedia = products.find((product) => product.slug === selectedProductSlug)?.media ?? [];
    const index = currentMedia.findIndex((media) => media.id === mediaId);
    if (index < 0) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentMedia.length) return;
    const next = [...currentMedia];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    const reordered = next.map((media, sortOrder) => ({ ...media, sortOrder }));
    setProducts((current) =>
      current.map((product) => (product.slug === selectedProductSlug ? { ...product, media: reordered } : product))
    );
    try {
      await withCsrf("/api/admin/product-media", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productSlug: selectedProductSlug,
          mediaId,
          sortOrder: reordered.find((media) => media.id === mediaId)?.sortOrder ?? 0
        })
      });
      setStatus("Media reordered.");
    } catch {
      setStatus("Media reorder failed.");
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold">Live preview</h3>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleSaveHero} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Hero image path</span>
              <input
                value={heroDraft.heroImagePath}
                onChange={(e) => setHeroDraft((current) => ({ ...current, heroImagePath: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Alt text EN</span>
              <input
                value={heroDraft.heroImageAltEn}
                onChange={(e) => setHeroDraft((current) => ({ ...current, heroImageAltEn: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Alt text VI</span>
              <input
                value={heroDraft.heroImageAltVi}
                onChange={(e) => setHeroDraft((current) => ({ ...current, heroImageAltVi: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
              />
            </label>
            <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white">Save hero settings</button>
          </form>
          <div className="relative min-h-[320px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
            {heroDraft.heroImagePath ? (
              <Image src={heroDraft.heroImagePath} alt={heroDraft.heroImageAltEn || "Hero preview"} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">No hero image selected</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Site assets picker</h3>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Hero / logo / banner</p>
          </div>
          <div className="mt-4 grid gap-3">
            <select
              value={selectedAssetKey}
              onChange={(e) => {
                setSelectedAssetKey(e.target.value);
                const asset = assets.find((item) => item.assetKey === e.target.value) ?? null;
                if (asset) {
                  setPreviewUrl(asset.publicUrl);
                  setSiteForm({
                    assetKey: asset.assetKey,
                    category: asset.category,
                    altTextVi: asset.altTextVi ?? "",
                    altTextEn: asset.altTextEn ?? "",
                    sortOrder: asset.sortOrder
                  });
                }
              }}
              className="rounded-xl border border-slate-200 px-4 py-3"
            >
              {assets.map((asset) => (
                <option key={asset.id} value={asset.assetKey}>
                  {asset.assetKey}
                </option>
              ))}
            </select>
            <div className="grid gap-2 sm:grid-cols-3">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => {
                    setSelectedAssetKey(asset.assetKey);
                    setPreviewUrl(asset.publicUrl);
                    applyAssetToHero(asset);
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-left text-xs hover:border-blue-300 hover:bg-blue-50"
                >
                  <p className="font-medium">{asset.assetKey}</p>
                  <p className="text-slate-500">{asset.category}</p>
                </button>
              ))}
            </div>
            {selectedAsset ? (
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="relative h-52 overflow-hidden rounded-lg bg-slate-50">
                  {previewUrl ? <Image src={previewUrl} alt={selectedAsset.altTextEn ?? selectedAsset.assetKey} fill className="object-cover" /> : null}
                </div>
                <div className="mt-3 space-y-2">
                  <label className="block">
                    <span className="text-sm">Alt text EN</span>
                    <input value={siteForm.altTextEn} onChange={(e) => setSiteForm((c) => ({ ...c, altTextEn: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                  <label className="block">
                    <span className="text-sm">Alt text VI</span>
                    <input value={siteForm.altTextVi} onChange={(e) => setSiteForm((c) => ({ ...c, altTextVi: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => applyAssetToHero(selectedAsset)} className="rounded-full bg-slate-950 px-4 py-2 text-xs font-medium text-white">
                      Use as hero
                    </button>
                    <button type="button" onClick={() => applyAssetToProduct(selectedAsset)} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700">
                      Use as product preview
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Product media gallery</h3>
          <div className="mt-4 grid gap-3">
            <select
              value={selectedProductSlug}
              onChange={(e) => {
                setSelectedProductSlug(e.target.value);
                const product = products.find((item) => item.slug === e.target.value) ?? null;
                if (product) {
                  setPreviewProductUrl(product.media[0]?.publicUrl ?? null);
                  setProductForm((c) => ({ ...c, productSlug: product.slug, altText: product.name }));
                }
              }}
              className="rounded-xl border border-slate-200 px-4 py-3"
            >
              {products.map((product) => (
                <option key={product.id} value={product.slug}>
                  {product.name}
                </option>
              ))}
            </select>
            {selectedProduct ? (
              <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="relative h-56 overflow-hidden rounded-lg bg-slate-50">
                      {previewProductUrl ? <Image src={previewProductUrl} alt={selectedProduct.media[0]?.altText ?? selectedProduct.name} fill className="object-cover" /> : null}
                    </div>
                    <form onSubmit={handleProductUpload} className="mt-4 space-y-3">
                    <input type="hidden" name="productSlug" value={selectedProduct.slug} />
                    <label className="block text-sm">
                      <span>Media type</span>
                      <input name="mediaType" defaultValue={productForm.mediaType} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                    </label>
                    <label className="block text-sm">
                      <span>Alt text</span>
                      <input name="altText" defaultValue={productForm.altText} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                    </label>
                    <label className="block text-sm">
                      <span>File</span>
                      <input name="file" type="file" accept="image/*" className="mt-1 block w-full text-sm" />
                    </label>
                    <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white">Upload to product</button>
                    </form>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm font-medium">Quick assign from site assets</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {assets.slice(0, 6).map((asset) => (
                        <button
                          key={asset.id}
                          type="button"
                          onClick={() => {
                            setPreviewProductUrl(asset.publicUrl);
                            setProductForm((current) => ({ ...current, altText: asset.altTextEn ?? asset.assetKey }));
                            setStatus(`Selected ${asset.assetKey} for product media.`);
                          }}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-left text-xs hover:border-blue-300 hover:bg-blue-50"
                        >
                          <p className="font-medium">{asset.assetKey}</p>
                          <p className="text-slate-500">{asset.category}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                <div className="grid gap-3">
                  {selectedProduct.media
                    .slice()
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((media, index) => (
                      <div key={media.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                        <button type="button" onClick={() => handleReorderMedia(media.id, "up")} disabled={index === 0} className="rounded border px-2 py-1 text-xs disabled:opacity-40">↑</button>
                        <button type="button" onClick={() => handleReorderMedia(media.id, "down")} disabled={index === selectedProduct.media.length - 1} className="rounded border px-2 py-1 text-xs disabled:opacity-40">↓</button>
                        <button type="button" onClick={() => setPreviewProductUrl(media.publicUrl)} className="relative h-16 w-16 overflow-hidden rounded-lg bg-slate-100">
                          {media.publicUrl ? <Image src={media.publicUrl} alt={media.altText} fill className="object-cover" /> : null}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{media.type}</p>
                          <p className="truncate text-xs text-slate-500">{media.storagePath}</p>
                          <input
                            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            defaultValue={media.altText}
                            onBlur={async (e) => {
                              await withCsrf("/api/admin/product-media", {
                                method: "PATCH",
                                headers: { "content-type": "application/json" },
                                body: JSON.stringify({ productSlug: selectedProduct.slug, mediaId: media.id, altText: e.target.value })
                              });
                            }}
                          />
                        </div>
                        <button type="button" onClick={() => handleDeleteMedia(media.id)} className="rounded-full border border-red-200 px-3 py-2 text-xs text-red-600">Delete</button>
                      </div>
                    ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <p className="text-sm text-slate-500">{status}</p>
    </div>
  );
}
