do $$
begin
  if to_regclass('public.gift_code_types') is not null and to_regclass('public.license_plans') is null then
    alter table public.gift_code_types rename to license_plans;
  end if;

  if to_regclass('public.gift_codes') is not null and to_regclass('public.license_keys') is null then
    alter table public.gift_codes rename to license_keys;
  end if;

  if to_regclass('public.product_reward_rules') is not null and to_regclass('public.product_license_rules') is null then
    alter table public.product_reward_rules rename to product_license_rules;
  end if;
end $$;

do $$
begin
  if to_regclass('public.product_license_rules') is not null then
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'product_license_rules'
        and column_name = 'gift_code_type_id'
    ) and not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'product_license_rules'
        and column_name = 'license_plan_id'
    ) then
      alter table public.product_license_rules rename column gift_code_type_id to license_plan_id;
    end if;
  end if;

  if to_regclass('public.license_keys') is not null then
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'license_keys'
        and column_name = 'gift_code_type_id'
    ) and not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'license_keys'
        and column_name = 'license_plan_id'
    ) then
      alter table public.license_keys rename column gift_code_type_id to license_plan_id;
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.license_keys') is not null and exists (
    select 1 from pg_indexes where schemaname = 'public' and indexname = 'idx_gift_codes_status_type'
  ) then
    alter index public.idx_gift_codes_status_type rename to idx_license_keys_status_plan;
  end if;

  if to_regclass('public.product_license_rules') is not null and exists (
    select 1 from pg_indexes where schemaname = 'public' and indexname = 'idx_reward_rules_product_active'
  ) then
    alter index public.idx_reward_rules_product_active rename to idx_product_license_rules_product_active;
  end if;
end $$;

update public.audit_logs
set action = regexp_replace(action, '^gift_code_', 'license_key_', 'g')
where action like 'gift_code_%';
