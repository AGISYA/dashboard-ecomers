import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Package, Layers, Images, TrendingUp, Sparkles, Activity } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

async function getCounts() {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try {
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
  } catch (e) {
    return { products: 0, categories: 0, slides: 0 };
  }
}

export default async function DashboardPage() {
  const counts = await getCounts();

  const stats = [
    {
      title: "Total Produk",
      value: counts.products,
      description: "Inventory active items",
      icon: Package,
      color: "text-blue-500",
      bg: "bg-blue-50",
      trend: "+12.5% from last month"
    },
    {
      title: "Total Kategori",
      value: counts.categories,
      description: "Product classifications",
      icon: Layers,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
      trend: "+2 new this week"
    },
    {
      title: "Carousel Slides",
      value: counts.slides,
      description: "Active promotions",
      icon: Images,
      color: "text-amber-500",
      bg: "bg-amber-50",
      trend: "All systems active"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <PageHeader
        title="Dashboard Overview"
        description="Welcome back! Here's a brief snapshot of your FURSIA store activity and inventory status."
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
            <Activity className="size-3 animate-pulse" />
            System Healthy
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => (
          <Card key={stat.title} className="group border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative">
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
              <stat.icon size={80} />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
              <p className="text-xs font-medium text-slate-400 mb-4">{stat.description}</p>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-lg">
                <TrendingUp size={12} />
                {stat.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-12">
        <Card className="border-none shadow-sm p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
          <Sparkles className="absolute -bottom-4 -right-4 size-32 text-white/10 rotate-12" />
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-2">Premium Administration</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-xs leading-relaxed">
              Experience the full power of FURSIA Management tools. Everything you need to scale your business is right here.
            </p>
            <button className="bg-white text-slate-900 px-6 py-2.5 rounded-xl text-sm font-black hover:bg-primary hover:text-white transition-all shadow-xl shadow-white/5">
              Explore Documentation
            </button>
          </div>
        </Card>

        <Card className="border-none shadow-sm p-8 bg-primary text-white relative overflow-hidden">
          <Activity className="absolute -bottom-4 -right-4 size-32 text-white/10 -rotate-12" />
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-2">Instant Marketing</h3>
            <p className="text-blue-100 text-sm mb-6 max-w-xs leading-relaxed">
              Reach your customers faster by updating your promotions, news, and business deals in real-time.
            </p>
            <button className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-2.5 rounded-xl text-sm font-black hover:bg-white hover:text-primary transition-all">
              Manage Promos
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
