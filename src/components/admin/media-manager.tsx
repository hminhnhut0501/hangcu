"use client";

import Image from "next/image";
import { useMemo, useState, type FormEvent } from "react";
import type { ProductSummary } from "@/modules/products/types";
import type { SiteAsset } from "@/modules/site-assets/types";
import type { SiteContentSettings } from "@/modules/site-settings/types";

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

function findProduct(products: ProductSummary[], slug: string) {
  return products.find((product) => product.slug === slug) ?? null;
}

export function MediaManager({ initialSettings, initialAssets, initialProducts }: Props) {
  const [settings, setSettings] = useState(initialSettings);
  const [assets, setAssets] = useState(initialAssets);
  const [products, setProducts] = useState(initialProducts);
  const [selectedAssetKey, setSelectedAssetKey] = useState(initialAssets[0]?.assetKey ?? "");
  const [selectedProductSlug, setSelectedProductSlug] = useState(initialProducts[0]?.slug ?? "");
  const [assetQuery, setAssetQuery] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [status, setStatus] = useState("");

  const selectedAsset = useMemo(() => assets.find((asset) => asset.assetKey === selectedAssetKey) ?? null, [assets, selectedAssetKey]);
  const selectedProduct = useMemo(() => findProduct(products, selectedProductSlug), [products, selectedProductSlug]);

  const visibleAssets = useMemo(() => {
    const query = assetQuery.trim().toLowerCase();
    return assets.filter((asset) => {
      if (!query) return true;
      return [asset.assetKey, asset.category, asset.altTextEn ?? "", asset.altTextVi ?? ""].some((value) =>
        value.toLowerCase().includes(query)
      );
    });
  }, [assetQuery, assets]);

  const visibleProducts = useMemo(() => {
    const query = productQuery.trim().toLowerCase();
    return products.filter((product) => {
      if (!query) return true;
      return [product.name, product.slug].some((value) => value.toLowerCase().includes(query));
    });
  }, [productQuery, products]);

  const heroDraft = useMemo(
    () => ({
      heroImagePath: settings.heroImagePath ?? "",
      heroImageAltVi: settings.heroImageAltVi ?? "",
      heroImageAltEn: settings.heroImageAltEn ?? ""
    }),
    [settings.heroImageAltEn, settings.heroImageAltVi, settings.heroImagePath]
  );
  const [heroForm, setHeroForm] = useState(heroDraft);

  const [siteForm, setSiteForm] = useState({
    assetKey: initialAssets[0]?.assetKey ?? "hero-home",
    category: initialAssets[0]?.category ?? "hero",
    altTextVi: initialAssets[0]?.altTextVi ?? "",
    altTextEn: initialAssets[0]?.altTextEn ?? "",
    sortOrder: initialAssets[0]?.sortOrder ?? 0
  });

  const [productForm, setProductForm] = useState({
    mediaType: "preview",
    altText: selectedProduct?.name ?? "",
    sortOrder: 0
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(selectedAsset?.publicUrl ?? null);
  const [previewProductUrl, setPreviewProductUrl] = useState<string | null>(selectedProduct?.media[0]?.publicUrl ?? null);

  const assetStats = useMemo(
    () => ({
      total: assets.length,
      hero: assets.filter((asset) => asset.category === "hero").length,
      logo: assets.filter((asset) => asset.category === "logo").length,
      banner: assets.filter((asset) => asset.category === "banner").length
    }),
    [assets]
  );

  const productMediaStats = useMemo(
    () => ({
      total: selectedProduct?.media.length ?? 0,
      preview: selectedProduct?.media.filter((media) => media.type === "preview").length ?? 0,
      detail: selectedProduct?.media.filter((media) => media.type === "detail").length ?? 0
    }),
    [selectedProduct]
  );

  function selectAsset(asset: SiteAsset) {
    setSelectedAssetKey(asset.assetKey);
    setPreviewUrl(asset.publicUrl);
    setSiteForm({
      assetKey: asset.assetKey,
      category: asset.category,
      altTextVi: asset.altTextVi ?? "",
      altTextEn: asset.altTextEn ?? "",
      sortOrder: asset.sortOrder
    });
  }

  function selectProduct(slug: string) {
    const product = findProduct(products, slug);
    if (!product) return;
    setSelectedProductSlug(product.slug);
    setPreviewProductUrl(product.media[0]?.publicUrl ?? null);
    setProductForm((current) => ({ ...current, altText: product.name }));
  }

  function applyAssetToHero(asset: SiteAsset) {
    setHeroForm({
      heroImagePath: asset.publicUrl ?? asset.storagePath,
      heroImageAltVi: asset.altTextVi ?? asset.assetKey,
      heroImageAltEn: asset.altTextEn ?? asset.assetKey
    });
    setStatus(`Đã áp dụng ${asset.assetKey} cho hero preview.`);
  }

  function applyAssetToProduct(asset: SiteAsset) {
    setPreviewProductUrl(asset.publicUrl);
    setProductForm((current) => ({
      ...current,
      altText: asset.altTextEn ?? asset.assetKey
    }));
    setStatus(`Đã áp dụng ${asset.assetKey} cho preview media sản phẩm.`);
  }

  async function refreshData() {
    const [assetsJson, productsJson] = await Promise.all([
      fetchJson("/api/admin/site-assets"),
      selectedProductSlug ? fetchJson(`/api/admin/product-media?productSlug=${encodeURIComponent(selectedProductSlug)}`) : Promise.resolve({ data: [] })
    ]);
    setAssets(assetsJson.data ?? []);
    setProducts((current) =>
      current.map((product) => (product.slug === selectedProductSlug ? { ...product, media: productsJson.data ?? product.media } : product))
    );
  }

  async function handleSiteUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Đang tải lên site asset...");
    const formData = new FormData(event.currentTarget);
    try {
      await withCsrf("/api/admin/site-assets", { method: "POST", body: formData });
      await refreshData();
      setStatus("Đã tải lên site asset.");
    } catch {
      setStatus("Tải lên site asset thất bại.");
    }
  }

  async function handleProductUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProductSlug) return;
    setStatus("Đang tải lên product media...");
    const formData = new FormData(event.currentTarget);
    try {
      const result = await withCsrf("/api/admin/product-media", { method: "POST", body: formData });
      setProducts((current) =>
        current.map((product) => (product.slug === selectedProductSlug ? { ...product, media: result.data?.media ?? product.media } : product))
      );
      setStatus("Đã tải lên product media.");
    } catch {
      setStatus("Tải lên product media thất bại.");
    }
  }

  async function handleSaveHero(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Đang lưu hero...");
    try {
      const payload = {
        ...settings,
        heroImagePath: heroForm.heroImagePath || null,
        heroImageAltVi: heroForm.heroImageAltVi || null,
        heroImageAltEn: heroForm.heroImageAltEn || null,
        navigation: JSON.stringify(settings.navigation),
        faqItems: JSON.stringify(settings.faqItems)
      };
      const result = await withCsrf("/api/admin/site-settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      setSettings(result.data);
      setStatus("Đã lưu hero.");
    } catch {
      setStatus("Lưu hero thất bại.");
    }
  }

  async function handleDeleteMedia(mediaId: string) {
    if (!selectedProductSlug) return;
    setStatus("Đang xóa media...");
    try {
      const result = await withCsrf(
        `/api/admin/product-media?productSlug=${encodeURIComponent(selectedProductSlug)}&mediaId=${encodeURIComponent(mediaId)}`,
        { method: "DELETE" }
      );
      setProducts((current) =>
        current.map((product) => (product.slug === selectedProductSlug ? { ...product, media: result.data ?? product.media } : product))
      );
      setStatus("Đã xóa media.");
    } catch {
      setStatus("Xóa media thất bại.");
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
      setStatus("Đã đổi thứ tự media.");
    } catch {
      setStatus("Đổi thứ tự media thất bại.");
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Asset</p>
          <p className="mt-2 text-3xl font-semibold">{assetStats.total}</p>
          <p className="mt-1 text-sm text-slate-600">Tất cả site asset đã tải lên</p>
        </article>
        <article className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-700">Hero</p>
          <p className="mt-2 text-3xl font-semibold">{assetStats.hero}</p>
          <p className="mt-1 text-sm text-slate-600">Ảnh sẵn sàng cho hero</p>
        </article>
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Media sản phẩm</p>
          <p className="mt-2 text-3xl font-semibold">{productMediaStats.total}</p>
          <p className="mt-1 text-sm text-slate-600">Số media của sản phẩm đang chọn</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Trạng thái</p>
          <p className="mt-2 text-sm font-medium text-slate-950">Thư viện asset và gallery sản phẩm</p>
          <p className="mt-1 text-sm text-slate-600">Gán nhanh, sửa nhanh, đổi thứ tự và xóa</p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Chỉnh hero</p>
              <h3 className="mt-2 text-xl font-semibold">Xem trước trực tiếp</h3>
            </div>
            <p className="text-xs text-slate-500">Chọn asset từ thư viện hoặc tải ảnh mới lên</p>
          </div>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            <form onSubmit={handleSaveHero} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Đường dẫn ảnh hero</span>
                <input
                  value={heroForm.heroImagePath}
                  onChange={(e) => setHeroForm((current) => ({ ...current, heroImagePath: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Alt text EN</span>
                <input
                  value={heroForm.heroImageAltEn}
                  onChange={(e) => setHeroForm((current) => ({ ...current, heroImageAltEn: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Alt text VI</span>
                <input
                  value={heroForm.heroImageAltVi}
                  onChange={(e) => setHeroForm((current) => ({ ...current, heroImageAltVi: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>
              <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white">Lưu hero</button>
            </form>
            <div className="relative min-h-[320px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
              {heroForm.heroImagePath ? (
                <Image
                  src={heroForm.heroImagePath}
                  alt={heroForm.heroImageAltEn || "Hero preview"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">Chưa chọn ảnh hero</div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Site asset</p>
              <h3 className="mt-2 text-xl font-semibold">Thư viện và bộ chọn</h3>
            </div>
            <p className="text-xs text-slate-500">Lọc, xem và gán tại một chỗ</p>
          </div>
          <div className="mt-4 grid gap-3">
            <input
              value={assetQuery}
              onChange={(e) => setAssetQuery(e.target.value)}
              placeholder="Tìm asset key, category hoặc alt text"
              className="rounded-xl border border-slate-200 px-4 py-3"
            />
            <select
              value={selectedAssetKey}
              onChange={(e) => {
                const asset = assets.find((item) => item.assetKey === e.target.value) ?? null;
                if (asset) {
                  selectAsset(asset);
                }
              }}
              className="rounded-xl border border-slate-200 px-4 py-3"
            >
              {visibleAssets.map((asset) => (
                <option key={asset.id} value={asset.assetKey}>
                  {asset.assetKey}
                </option>
              ))}
            </select>
            <div className="grid gap-3 sm:grid-cols-2">
              {visibleAssets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => selectAsset(asset)}
                  className={`rounded-xl border px-3 py-3 text-left text-xs transition ${
                    asset.assetKey === selectedAssetKey ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
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
                <div className="mt-3 grid gap-3">
                  <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <p>Storage: {selectedAsset.storagePath}</p>
                    <p>Loại: {selectedAsset.mimeType ?? "unknown"}</p>
                    <p>Kích thước: {selectedAsset.width && selectedAsset.height ? `${selectedAsset.width}×${selectedAsset.height}` : "unknown"}</p>
                    <p>Đang bật: {selectedAsset.isActive ? "Có" : "Không"}</p>
                  </div>
                  <label className="block">
                    <span className="text-sm">Alt text EN</span>
                    <input
                      value={siteForm.altTextEn}
                      onChange={(e) => setSiteForm((c) => ({ ...c, altTextEn: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm">Alt text VI</span>
                    <input
                      value={siteForm.altTextVi}
                      onChange={(e) => setSiteForm((c) => ({ ...c, altTextVi: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => applyAssetToHero(selectedAsset)} className="rounded-full bg-slate-950 px-4 py-2 text-xs font-medium text-white">
                      Dùng làm hero
                    </button>
                    <button type="button" onClick={() => applyAssetToProduct(selectedAsset)} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700">
                      Dùng làm preview sản phẩm
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Tải lên</p>
              <h3 className="mt-2 text-xl font-semibold">Tải site asset</h3>
            </div>
            <p className="text-xs text-slate-500">Tải một lần, dùng ở nhiều nơi</p>
          </div>
          <form onSubmit={handleSiteUpload} className="mt-4 space-y-3">
            <label className="block text-sm">
              <span>Asset key</span>
              <input name="assetKey" defaultValue={siteForm.assetKey} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span>Danh mục</span>
              <select name="category" defaultValue={siteForm.category} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2">
                <option value="hero">Hero</option>
                <option value="logo">Logo</option>
                <option value="banner">Banner</option>
                <option value="favicon">Favicon</option>
                <option value="misc">Khác</option>
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
              <span>Alt text VI</span>
                <input name="altTextVi" defaultValue={siteForm.altTextVi} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>
              <label className="block text-sm">
              <span>Alt text EN</span>
                <input name="altTextEn" defaultValue={siteForm.altTextEn} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>
            </div>
            <label className="block text-sm">
              <span>Thứ tự</span>
              <input name="sortOrder" type="number" defaultValue={String(siteForm.sortOrder)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span>Tệp</span>
              <input name="file" type="file" accept="image/*" className="mt-1 block w-full text-sm" />
            </label>
            <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white">Tải asset lên</button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Media sản phẩm</p>
              <h3 className="mt-2 text-xl font-semibold">Gallery và trình chỉnh</h3>
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Preview / detail / lifestyle</p>
          </div>
          <div className="mt-4 grid gap-3">
            <input
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              placeholder="Tìm sản phẩm theo tên hoặc slug"
              className="rounded-xl border border-slate-200 px-4 py-3"
            />
            <select
              value={selectedProductSlug}
              onChange={(e) => {
                const product = findProduct(products, e.target.value);
                if (product) {
                  setSelectedProductSlug(product.slug);
                  setPreviewProductUrl(product.media[0]?.publicUrl ?? null);
                  setProductForm((current) => ({ ...current, altText: product.name }));
                }
              }}
              className="rounded-xl border border-slate-200 px-4 py-3"
            >
              {visibleProducts.map((product) => (
                <option key={product.id} value={product.slug}>
                  {product.name}
                </option>
              ))}
            </select>
            {selectedProduct ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="relative h-56 overflow-hidden rounded-lg bg-slate-50">
                    {previewProductUrl ? (
                      <Image src={previewProductUrl} alt={selectedProduct.media[0]?.altText ?? selectedProduct.name} fill className="object-cover" />
                    ) : null}
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                    <p>Tổng: {productMediaStats.total}</p>
                    <p>Preview: {productMediaStats.preview}</p>
                    <p>Detail: {productMediaStats.detail}</p>
                  </div>
                  <form onSubmit={handleProductUpload} className="mt-4 space-y-3">
                    <input type="hidden" name="productSlug" value={selectedProduct.slug} />
                    <label className="block text-sm">
                      <span>Loại media</span>
                      <select name="mediaType" defaultValue={productForm.mediaType} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2">
                        <option value="preview">Preview</option>
                        <option value="detail">Detail</option>
                        <option value="lifestyle">Lifestyle</option>
                      </select>
                    </label>
                    <label className="block text-sm">
                      <span>Alt text</span>
                      <input name="altText" defaultValue={productForm.altText} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                    </label>
                    <label className="block text-sm">
                      <span>Tệp</span>
                      <input name="file" type="file" accept="image/*" className="mt-1 block w-full text-sm" />
                    </label>
                    <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white">Tải lên sản phẩm</button>
                  </form>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">Gán nhanh từ site asset</p>
                    <p className="text-xs text-slate-500">Dùng ảnh thư viện làm preview sản phẩm</p>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {visibleAssets.slice(0, 6).map((asset) => (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => applyAssetToProduct(asset)}
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
                        <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => handleReorderMedia(media.id, "up")}
                              disabled={index === 0}
                              className="rounded border px-2 py-1 text-xs disabled:opacity-40"
                            >
                            ↑
                          </button>
                            <button
                              type="button"
                              onClick={() => handleReorderMedia(media.id, "down")}
                              disabled={index === selectedProduct.media.length - 1}
                              className="rounded border px-2 py-1 text-xs disabled:opacity-40"
                            >
                            ↓
                          </button>
                        </div>
                        <button type="button" onClick={() => setPreviewProductUrl(media.publicUrl)} className="relative h-16 w-16 overflow-hidden rounded-lg bg-slate-100">
                          {media.publicUrl ? <Image src={media.publicUrl} alt={media.altText} fill className="object-cover" /> : null}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{media.type}</p>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                              #{media.sortOrder}
                            </span>
                          </div>
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
                        <button type="button" onClick={() => handleDeleteMedia(media.id)} className="rounded-full border border-red-200 px-3 py-2 text-xs text-red-600">
                          Xóa
                        </button>
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
