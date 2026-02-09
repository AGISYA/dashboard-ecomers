import Topbar from "@/components/layout/Topbar";
import Card from "@/components/ui/Card";

async function getCounts() {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [productsRes, categoriesRes, carouselRes] = await Promise.all([
    fetch(`${origin}/api/products?limit=1`, { next: { revalidate: 0 } }),
    fetch(`${origin}/api/categories`, { next: { revalidate: 0 } }),
    fetch(`${origin}/api/carousel`, { next: { revalidate: 0 } }),
  ]);
  const products = productsRes.ok ? await productsRes.json() : { total: 0 };
  const categories = categoriesRes.ok ? await categoriesRes.json() : [];
  const carousel = carouselRes.ok ? await carouselRes.json() : [];
  return {
    products: products.total ?? 0,
    categories: categories.length ?? 0,
    slides: carousel.length ?? 0,
  };
}

export default async function DashboardPage() {
  const counts = await getCounts();
  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="container px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Produk" value={counts.products} />
        <Card title="Kategori" value={counts.categories} />
        <Card title="Slides" value={counts.slides} />
      </div>
    </div>
  );
}
