"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AdminBanner, getAdminErrorMessage } from "@/components/admin/admin-feedback";
import { AdminDrawer } from "@/components/admin/admin-drawer";
import { AdminPanel } from "@/components/admin/admin-shell";
import type { SiteContentSettings } from "@/modules/site-settings/types";

type Props = {
  initialSettings: SiteContentSettings;
  source: "supabase" | "fallback" | null;
  errorMessage?: string | null;
};

type FieldType = "text" | "textarea" | "checkbox";

type Field = {
  name: keyof SiteContentSettings;
  label: string;
  type?: FieldType;
  rows?: number;
  placeholder?: string;
};

function readText(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function readBoolean(value: unknown) {
  return typeof value === "boolean" ? value : Boolean(value);
}

function readNullableText(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function readDraftValue(value: unknown, type?: FieldType) {
  if (type === "checkbox") {
    return readBoolean(value);
  }
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value) || (value && typeof value === "object")) {
    return JSON.stringify(value, null, 2);
  }
  return "";
}

function jsonString(value: unknown) {
  if (typeof value === "string") return value;
  return JSON.stringify(value ?? [], null, 2);
}

function buildPayload(settings: SiteContentSettings, overrides: Partial<Record<keyof SiteContentSettings, unknown>>) {
  const merged = { ...settings, ...overrides };

  return {
    siteNameVi: readText(merged.siteNameVi),
    siteNameEn: readText(merged.siteNameEn),
    heroEyebrowVi: readText(merged.heroEyebrowVi),
    heroEyebrowEn: readText(merged.heroEyebrowEn),
    heroTitleVi: readText(merged.heroTitleVi),
    heroTitleEn: readText(merged.heroTitleEn),
    heroDescriptionVi: readText(merged.heroDescriptionVi),
    heroDescriptionEn: readText(merged.heroDescriptionEn),
    heroSecondaryTextVi: readText(merged.heroSecondaryTextVi),
    heroSecondaryTextEn: readText(merged.heroSecondaryTextEn),
    featuresSectionLabelVi: readText(merged.featuresSectionLabelVi),
    featuresSectionLabelEn: readText(merged.featuresSectionLabelEn),
    featuresSectionTitleVi: readText(merged.featuresSectionTitleVi),
    featuresSectionTitleEn: readText(merged.featuresSectionTitleEn),
    featuresSectionDescriptionVi: readText(merged.featuresSectionDescriptionVi),
    featuresSectionDescriptionEn: readText(merged.featuresSectionDescriptionEn),
    demoSectionLabelVi: readText(merged.demoSectionLabelVi),
    demoSectionLabelEn: readText(merged.demoSectionLabelEn),
    demoSectionTitleVi: readText(merged.demoSectionTitleVi),
    demoSectionTitleEn: readText(merged.demoSectionTitleEn),
    demoSectionDescriptionVi: readText(merged.demoSectionDescriptionVi),
    demoSectionDescriptionEn: readText(merged.demoSectionDescriptionEn),
    plansSectionLabelVi: readText(merged.plansSectionLabelVi),
    plansSectionLabelEn: readText(merged.plansSectionLabelEn),
    plansSectionTitleVi: readText(merged.plansSectionTitleVi),
    plansSectionTitleEn: readText(merged.plansSectionTitleEn),
    plansSectionDescriptionVi: readText(merged.plansSectionDescriptionVi),
    plansSectionDescriptionEn: readText(merged.plansSectionDescriptionEn),
    faqSectionLabelVi: readText(merged.faqSectionLabelVi),
    faqSectionLabelEn: readText(merged.faqSectionLabelEn),
    faqSectionTitleVi: readText(merged.faqSectionTitleVi),
    faqSectionTitleEn: readText(merged.faqSectionTitleEn),
    heroPrimaryCtaLabelVi: readText(merged.heroPrimaryCtaLabelVi),
    heroPrimaryCtaLabelEn: readText(merged.heroPrimaryCtaLabelEn),
    heroPrimaryCtaHref: readText(merged.heroPrimaryCtaHref),
    heroSecondaryCtaLabelVi: readText(merged.heroSecondaryCtaLabelVi),
    heroSecondaryCtaLabelEn: readText(merged.heroSecondaryCtaLabelEn),
    heroSecondaryCtaHref: readText(merged.heroSecondaryCtaHref),
    heroImagePath: readNullableText(merged.heroImagePath),
    heroImageAltVi: readNullableText(merged.heroImageAltVi),
    heroImageAltEn: readNullableText(merged.heroImageAltEn),
    announcementTextVi: readText(merged.announcementTextVi),
    announcementTextEn: readText(merged.announcementTextEn),
    announcementVisible: readBoolean(merged.announcementVisible),
    showFeaturedPlansSection: readBoolean(merged.showFeaturedPlansSection),
    showDonateSection: readBoolean(merged.showDonateSection),
    showFaqSection: readBoolean(merged.showFaqSection),
    navigation: jsonString(merged.navigation),
    footerNoteVi: readText(merged.footerNoteVi),
    footerNoteEn: readText(merged.footerNoteEn),
    faqItems: jsonString(merged.faqItems),
    heroChips: jsonString(merged.heroChips),
    featureCards: jsonString(merged.featureCards),
    workflowSteps: jsonString(merged.workflowSteps),
    planHighlights: jsonString(merged.planHighlights),
    paymentGateways: jsonString(merged.paymentGateways)
  };
}

function FieldEditor({
  field,
  value,
  onChange
}: {
  field: Field;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
}) {
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-slate-700">{field.label}</span>
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="block">
        <span className="text-sm font-medium text-slate-700">{field.label}</span>
        <textarea
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          rows={field.rows ?? 4}
          placeholder={field.placeholder}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
      </label>
    );
  }

  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{field.label}</span>
      <input
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
      />
    </label>
  );
}

function DrawerForm({
  triggerLabel,
  title,
  description,
  fields,
  settings,
  onSaved
}: {
  triggerLabel: string;
  title: string;
  description: string;
  fields: Field[];
  settings: SiteContentSettings;
  onSaved: (settings: SiteContentSettings) => void;
}) {
  const [draft, setDraft] = useState<Record<string, string | boolean>>(() =>
    Object.fromEntries(fields.map((field) => [field.name, readDraftValue(settings[field.name], field.type)]))
  );
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  /* eslint-disable react-hooks/exhaustive-deps */
  const fieldsKey = useMemo(() => fields.map((field) => `${field.name}:${field.type ?? "text"}`).join("|"), [fields]);
  const initialDraft = useMemo(
    () => Object.fromEntries(fields.map((field) => [field.name, readDraftValue(settings[field.name], field.type)])),
    [fieldsKey, settings.updatedAt]
  );

  useEffect(() => {
    setDraft(initialDraft);
  }, [initialDraft]);
  /* eslint-enable react-hooks/exhaustive-deps */

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const csrfResponse = await fetch("/api/admin/csrf", { method: "GET", credentials: "include" });
      const csrfJson = (await csrfResponse.json()) as { data?: { token?: string } };
      const token = csrfJson.data?.token;
      if (!token) throw new Error("Missing CSRF token");

      const payload = buildPayload(settings, draft as Partial<Record<keyof SiteContentSettings, unknown>>);
      const response = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-csrf-token": token
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const json = (await response.json().catch(() => null)) as { data?: SiteContentSettings; error?: { code?: string; message?: string } } | null;
      if (!response.ok) {
        throw new Error(json?.error?.code ?? json?.error?.message ?? "Request failed");
      }
      if (!json?.data) {
        throw new Error("Missing settings response");
      }

      onSaved(json.data);
      setStatus("done");
      setMessage("Đã cập nhật nội dung.");
    } catch (error) {
      setStatus("error");
      setMessage(getAdminErrorMessage(error, "Lưu nội dung thất bại."));
    }
  }

  return (
    <AdminDrawer
      trigger={
        <button type="button" className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">
          {triggerLabel}
        </button>
      }
      title={title}
      description={description}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <FieldEditor
              key={field.name}
              field={field}
              value={draft[field.name] ?? ""}
              onChange={(value) => setDraft((current) => ({ ...current, [field.name]: value }))}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {status === "loading" ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <div className="text-sm">
            {status === "done" ? <AdminBanner tone="success" message={message} /> : null}
            {status === "error" ? <AdminBanner tone="error" message={message} /> : null}
          </div>
        </div>
      </form>
    </AdminDrawer>
  );
}

function OverviewCard({
  label,
  title,
  text,
  meta,
  action
}: {
  label: string;
  title: string;
  text: string;
  meta: string;
  action: ReactNode;
}) {
  return (
    <AdminPanel className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-blue-600">{label}</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-950">{title}</h3>
          <p className="mt-2 text-sm text-slate-600">{text}</p>
        </div>
        <div className="shrink-0 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">{meta}</div>
      </div>
      <div className="flex flex-wrap items-center gap-3">{action}</div>
    </AdminPanel>
  );
}

export function SiteContentManager({ initialSettings, source, errorMessage = null }: Props) {
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const heroSummary = useMemo(
    () => [
      settings.heroEyebrowEn,
      settings.heroTitleEn,
      settings.heroPrimaryCtaLabelEn,
      settings.heroSecondaryCtaLabelEn
    ].filter(Boolean),
    [settings.heroEyebrowEn, settings.heroPrimaryCtaLabelEn, settings.heroSecondaryCtaLabelEn, settings.heroTitleEn]
  );

  const sectionsSummary = useMemo(
    () => [
      settings.featuresSectionTitleEn,
      settings.demoSectionTitleEn,
      settings.plansSectionTitleEn,
      settings.faqSectionTitleEn
    ].filter(Boolean),
    [settings.demoSectionTitleEn, settings.featuresSectionTitleEn, settings.faqSectionTitleEn, settings.plansSectionTitleEn]
  );

  const navVisibleCount = settings.navigation.filter((item) => item.visible).length;
  const blockVisibleCount = [
    settings.announcementVisible,
    settings.showFeaturedPlansSection,
    settings.showDonateSection,
    settings.showFaqSection
  ].filter(Boolean).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-600">Nội dung</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Cài đặt nội dung website</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Chỉnh hero, section copy, điều hướng, footer và các khối hiển thị trong các drawer ngắn để thao tác nhanh hơn.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
            <span
              className={`h-2 w-2 rounded-full ${
                errorMessage ? "bg-rose-500" : source === "fallback" ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
            {errorMessage ? "site_settings: lỗi DB" : source === "fallback" ? "site_settings: fallback memory" : "site_settings: đọc từ Supabase"}
          </div>
          <div className="text-xs text-slate-500">Cập nhật: {new Date(settings.updatedAt).toLocaleString("vi-VN")}</div>
        </div>
      </div>

      {errorMessage ? <AdminBanner tone="error" message={errorMessage} /> : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <OverviewCard
              label="Hero"
              title={settings.heroTitleEn}
              text={settings.heroDescriptionEn}
              meta={`${heroSummary.length} điểm chạm`}
              action={
                <DrawerForm
                  triggerLabel="Sửa hero & CTA"
                  title="Sửa hero & CTA"
                  description="Chỉnh tên site, hero text, CTA và ảnh hero."
                  settings={settings}
                  onSaved={setSettings}
                  fields={[
                    { name: "siteNameVi", label: "Tên site VI" },
                    { name: "siteNameEn", label: "Tên site EN" },
                    { name: "heroEyebrowVi", label: "Dòng phụ VI" },
                    { name: "heroEyebrowEn", label: "Dòng phụ EN" },
                    { name: "heroTitleVi", label: "Tiêu đề VI" },
                    { name: "heroTitleEn", label: "Tiêu đề EN" },
                    { name: "heroDescriptionVi", label: "Mô tả VI", type: "textarea", rows: 3 },
                    { name: "heroDescriptionEn", label: "Mô tả EN", type: "textarea", rows: 3 },
                    { name: "heroSecondaryTextVi", label: "Dòng phụ 2 VI", type: "textarea", rows: 3 },
                    { name: "heroSecondaryTextEn", label: "Dòng phụ 2 EN", type: "textarea", rows: 3 },
                    { name: "heroPrimaryCtaLabelVi", label: "CTA chính VI" },
                    { name: "heroPrimaryCtaLabelEn", label: "CTA chính EN" },
                    { name: "heroPrimaryCtaHref", label: "Link CTA chính" },
                    { name: "heroSecondaryCtaLabelVi", label: "CTA phụ VI" },
                    { name: "heroSecondaryCtaLabelEn", label: "CTA phụ EN" },
                    { name: "heroSecondaryCtaHref", label: "Link CTA phụ" },
                    { name: "heroImagePath", label: "Ảnh hero" },
                    { name: "heroImageAltVi", label: "Alt ảnh VI" },
                    { name: "heroImageAltEn", label: "Alt ảnh EN" }
                  ]}
                />
              }
            />
            <OverviewCard
              label="Section copy"
              title={sectionsSummary[0] ?? "Sections"}
              text="Quản lý title, label và mô tả cho features / demo / plans / FAQ trong một drawer riêng."
              meta={`${sectionsSummary.length} section`}
              action={
                <DrawerForm
                  triggerLabel="Sửa section copy"
                  title="Sửa copy cho các section"
                  description="Chỉnh label, title và mô tả của features, demo, plans và FAQ."
                  settings={settings}
                  onSaved={setSettings}
                  fields={[
                    { name: "featuresSectionLabelVi", label: "Label features VI" },
                    { name: "featuresSectionLabelEn", label: "Label features EN" },
                    { name: "featuresSectionTitleVi", label: "Title features VI" },
                    { name: "featuresSectionTitleEn", label: "Title features EN" },
                    { name: "featuresSectionDescriptionVi", label: "Mô tả features VI", type: "textarea", rows: 3 },
                    { name: "featuresSectionDescriptionEn", label: "Mô tả features EN", type: "textarea", rows: 3 },
                    { name: "demoSectionLabelVi", label: "Label demo VI" },
                    { name: "demoSectionLabelEn", label: "Label demo EN" },
                    { name: "demoSectionTitleVi", label: "Title demo VI" },
                    { name: "demoSectionTitleEn", label: "Title demo EN" },
                    { name: "demoSectionDescriptionVi", label: "Mô tả demo VI", type: "textarea", rows: 3 },
                    { name: "demoSectionDescriptionEn", label: "Mô tả demo EN", type: "textarea", rows: 3 },
                    { name: "plansSectionLabelVi", label: "Label gói VI" },
                    { name: "plansSectionLabelEn", label: "Label gói EN" },
                    { name: "plansSectionTitleVi", label: "Title gói VI" },
                    { name: "plansSectionTitleEn", label: "Title gói EN" },
                    { name: "plansSectionDescriptionVi", label: "Mô tả gói VI", type: "textarea", rows: 3 },
                    { name: "plansSectionDescriptionEn", label: "Mô tả gói EN", type: "textarea", rows: 3 },
                    { name: "faqSectionLabelVi", label: "Label FAQ VI" },
                    { name: "faqSectionLabelEn", label: "Label FAQ EN" },
                    { name: "faqSectionTitleVi", label: "Title FAQ VI" },
                    { name: "faqSectionTitleEn", label: "Title FAQ EN" }
                  ]}
                />
              }
            />
            <OverviewCard
              label="Menu"
              title="Navigation & footer"
              text="Chỉnh menu header, ghi chú footer và text nhấn mạnh ở chân trang."
              meta={`${navVisibleCount} menu`}
              action={
                <DrawerForm
                  triggerLabel="Sửa menu & footer"
                  title="Sửa navigation và footer"
                  description="Cập nhật JSON navigation, ghi chú footer và announcement text."
                  settings={settings}
                  onSaved={setSettings}
                  fields={[
                    { name: "navigation", label: "Navigation JSON", type: "textarea", rows: 10 },
                    { name: "footerNoteVi", label: "Footer note VI", type: "textarea", rows: 2 },
                    { name: "footerNoteEn", label: "Footer note EN", type: "textarea", rows: 2 },
                    { name: "announcementTextVi", label: "Announcement VI", type: "textarea", rows: 3 },
                    { name: "announcementTextEn", label: "Announcement EN", type: "textarea", rows: 3 }
                  ]}
                />
              }
            />
            <OverviewCard
              label="Blocks"
              title="Hiển thị & khối nội dung"
              text="Bật/tắt từng phần lớn và chỉnh các JSON blocks cho hero, feature, workflow, plan và FAQ."
              meta={`${blockVisibleCount}/4 bật`}
              action={
                <DrawerForm
                  triggerLabel="Sửa toggle & JSON"
                  title="Sửa hiển thị và block data"
                  description="Tắt/mở section lớn và chỉnh JSON hero chips, feature cards, workflow steps, plan highlights, FAQ items."
                  settings={settings}
                  onSaved={setSettings}
                  fields={[
                    { name: "announcementVisible", label: "Hiện announcement", type: "checkbox" },
                    { name: "showFeaturedPlansSection", label: "Hiện gói nổi bật", type: "checkbox" },
                    { name: "showDonateSection", label: "Hiện ủng hộ tự do", type: "checkbox" },
                    { name: "showFaqSection", label: "Hiện FAQ", type: "checkbox" },
                    { name: "heroChips", label: "Hero chips JSON", type: "textarea", rows: 8 },
                    { name: "featureCards", label: "Feature cards JSON", type: "textarea", rows: 12 },
                    { name: "workflowSteps", label: "Workflow steps JSON", type: "textarea", rows: 8 },
                    { name: "planHighlights", label: "Plan highlights JSON", type: "textarea", rows: 8 },
                    { name: "faqItems", label: "FAQ items JSON", type: "textarea", rows: 10 }
                  ]}
                />
              }
            />
            <OverviewCard
              label="Thanh toán"
              title="Gateway VI / EN"
              text="Chỉnh cổng thanh toán hiển thị cho VNĐ và USD trong cùng một nguồn dữ liệu."
              meta={`${settings.paymentGateways.filter((item) => item.visible).length} gateway`}
              action={
                <DrawerForm
                  triggerLabel="Sửa payment gateways"
                  title="Sửa cổng thanh toán"
                  description="Cập nhật JSON gateway list để storefront và checkout đọc cùng một cấu hình."
                  settings={settings}
                  onSaved={setSettings}
                  fields={[
                    { name: "paymentGateways", label: "Payment gateways JSON", type: "textarea", rows: 12 }
                  ]}
                />
              }
            />
          </div>
        </div>

        <div className="space-y-6">
          <AdminPanel className="overflow-hidden p-0">
            <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-xs font-medium text-blue-600">Preview</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-950">Xem trước homepage</h3>
              <p className="mt-2 text-sm text-slate-600">Preview đọc trực tiếp từ cùng một nguồn dữ liệu.</p>
            </div>
            <div className="space-y-5 p-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-medium text-blue-600">{settings.heroEyebrowEn}</p>
                <h4 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{settings.heroTitleEn}</h4>
                <p className="mt-3 text-sm leading-6 text-slate-600">{settings.heroDescriptionEn}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-medium text-white">{settings.heroPrimaryCtaLabelEn}</span>
                  <span className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700">
                    {settings.heroSecondaryCtaLabelEn}
                  </span>
                </div>
                {settings.heroImagePath ? (
                  <div className="relative mt-5 h-52 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                    <Image
                      src={settings.heroImagePath}
                      alt={settings.heroImageAltEn ?? settings.heroTitleEn}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                    />
                  </div>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium text-slate-400">Sections</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    <li>• {settings.featuresSectionTitleEn}</li>
                    <li>• {settings.demoSectionTitleEn}</li>
                    <li>• {settings.plansSectionTitleEn}</li>
                    <li>• {settings.faqSectionTitleEn}</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium text-slate-400">System</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    <li>• Navigation: {navVisibleCount} mục hiện</li>
                    <li>• Blocks: {blockVisibleCount}/4 bật</li>
                    <li>• Hero chips: {settings.heroChips.filter((item) => item.visible).length}</li>
                    <li>• Plan highlights: {settings.planHighlights.filter((item) => item.visible).length}</li>
                    <li>• Gateways: {settings.paymentGateways.filter((item) => item.visible).length}</li>
                  </ul>
                </div>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel className="space-y-4">
            <div>
              <p className="text-xs font-medium text-blue-600">Gợi ý</p>
              <h3 className="mt-3 text-xl font-semibold text-slate-950">Mẹo chỉnh nhanh</h3>
            </div>
            <div className="grid gap-3 text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                Bấm từng nút drawer ở cột trái để sửa đúng cụm nội dung, không còn phải lướt một form dài.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                Preview bên phải luôn đọc từ cùng dữ liệu với homepage để giảm lệch giữa admin và storefront.
              </div>
            </div>
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}
