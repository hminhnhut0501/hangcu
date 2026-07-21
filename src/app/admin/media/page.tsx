import { MediaManager } from "@/components/admin/media-manager";
import { listProducts } from "@/modules/products/service";
import { getSiteContentSettings } from "@/modules/site-settings/service";
import { listSiteAssets } from "@/modules/site-assets/service";

export default async function AdminMediaPage() {
  const [settings, products, assets] = await Promise.all([
    getSiteContentSettings(),
    listProducts(),
    listSiteAssets()
  ]);

  return <MediaManager initialSettings={settings} initialProducts={products} initialAssets={assets} />;
}
