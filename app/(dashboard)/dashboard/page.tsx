import Topbar from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Package, Layers, Images } from "lucide-react";

async function getCounts() {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [productsRes, categoriesRes, carouselRes] = await Promise.all([
    fetch(`${origin}/api/products?limit=1`, { next: { revalidate: 0 } }),
    fetch(`${origin}/api/categories`, { next: { revalidate: 0 } }),
    fetch(`${origin}/api/carousel`, { next: { revalidate: 0 } }),
  ]);
  const products = productsRes.ok ? await productsRes.json() : { total: 0 };
  const categories = categoriesRes.ok ? await categoriesRes.json() : [];
  const carousel = carouselRes.ok ? await carouselRes.json() : { slides: [] };
  return {
    products: products.total ?? 0,
    categories: categories.length ?? 0,
    slides: (carousel.slides ?? []).length ?? 0,
  };
}

export default async function DashboardPage() {
  const counts = await getCounts();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Produk
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.products}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Kategori
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.categories}</div>
            <p className="text-xs text-muted-foreground">
              +2 new categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Carousel Slides
            </CardTitle>
            <Images className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.slides}</div>
            <p className="text-xs text-muted-foreground">
              Active slides
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
