import { getSupabaseServiceClient } from "@/lib/db/supabase-server";
import type { Coupon } from "./schema";

const coupons: Coupon[] = [
  {
    id: "cpn_welcome10",
    code: "WELCOME10",
    type: "percent",
    value: 10,
    currency: null,
    minOrderMinor: 0,
    maxRedemptions: 100,
    redemptionCount: 0,
    startsAt: null,
    endsAt: null,
    status: "active"
  }
];

export interface CouponRepository {
  list(): Promise<Coupon[]>;
  findByCode(code: string): Promise<Coupon | null>;
  findById(id: string): Promise<Coupon | null>;
  save(coupon: Coupon): Promise<Coupon>;
}

export class InMemoryCouponRepository implements CouponRepository {
  async list(): Promise<Coupon[]> {
    return [...coupons];
  }

  async findByCode(code: string): Promise<Coupon | null> {
    return coupons.find((coupon) => coupon.code.toUpperCase() === code.toUpperCase()) ?? null;
  }

  async findById(id: string): Promise<Coupon | null> {
    return coupons.find((coupon) => coupon.id === id) ?? null;
  }

  async save(coupon: Coupon): Promise<Coupon> {
    const index = coupons.findIndex((entry) => entry.id === coupon.id);
    if (index >= 0) {
      coupons[index] = coupon;
    } else {
      coupons.push(coupon);
    }
    return coupon;
  }
}

export class SupabaseCouponRepository implements CouponRepository {
  private client = getSupabaseServiceClient();

  async list(): Promise<Coupon[]> {
    if (!this.client) {
      return new InMemoryCouponRepository().list();
    }

    const { data, error } = await this.client.from("coupons").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      code: row.code,
      type: row.type,
      value: Number(row.value),
      currency: row.currency ?? null,
      minOrderMinor: Number(row.min_order_minor),
      maxRedemptions: row.max_redemptions,
      redemptionCount: row.redemption_count,
      startsAt: row.starts_at ? new Date(row.starts_at) : null,
      endsAt: row.ends_at ? new Date(row.ends_at) : null,
      status: row.status
    }));
  }

  async findByCode(code: string): Promise<Coupon | null> {
    if (!this.client) {
      return new InMemoryCouponRepository().findByCode(code);
    }

    const { data, error } = await this.client.from("coupons").select("*").ilike("code", code).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      code: data.code,
      type: data.type,
      value: Number(data.value),
      currency: data.currency ?? null,
      minOrderMinor: Number(data.min_order_minor),
      maxRedemptions: data.max_redemptions,
      redemptionCount: data.redemption_count,
      startsAt: data.starts_at ? new Date(data.starts_at) : null,
      endsAt: data.ends_at ? new Date(data.ends_at) : null,
      status: data.status
    };
  }

  async findById(id: string): Promise<Coupon | null> {
    if (!this.client) {
      return new InMemoryCouponRepository().findById(id);
    }

    const { data, error } = await this.client.from("coupons").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      code: data.code,
      type: data.type,
      value: Number(data.value),
      currency: data.currency ?? null,
      minOrderMinor: Number(data.min_order_minor),
      maxRedemptions: data.max_redemptions,
      redemptionCount: data.redemption_count,
      startsAt: data.starts_at ? new Date(data.starts_at) : null,
      endsAt: data.ends_at ? new Date(data.ends_at) : null,
      status: data.status
    };
  }

  async save(coupon: Coupon): Promise<Coupon> {
    if (!this.client) {
      return new InMemoryCouponRepository().save(coupon);
    }

    const { data, error } = await this.client
      .from("coupons")
      .upsert({
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        currency: coupon.currency,
        min_order_minor: coupon.minOrderMinor,
        max_redemptions: coupon.maxRedemptions,
        redemption_count: coupon.redemptionCount,
        starts_at: coupon.startsAt?.toISOString() ?? null,
        ends_at: coupon.endsAt?.toISOString() ?? null,
        status: coupon.status
      })
      .select("*")
      .single();

    if (error) throw error;
    return {
      id: data.id,
      code: data.code,
      type: data.type,
      value: Number(data.value),
      currency: data.currency ?? null,
      minOrderMinor: Number(data.min_order_minor),
      maxRedemptions: data.max_redemptions,
      redemptionCount: data.redemption_count,
      startsAt: data.starts_at ? new Date(data.starts_at) : null,
      endsAt: data.ends_at ? new Date(data.ends_at) : null,
      status: data.status
    };
  }
}
