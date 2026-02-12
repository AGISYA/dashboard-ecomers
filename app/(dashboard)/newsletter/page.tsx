"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Mail, Trash2, Search, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

type Subscription = {
    id: string;
    email: string;
    createdAt: string;
};

export default function NewsletterPage() {
    const [subs, setSubs] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchSubs = async () => {
        try {
            const res = await fetch("/api/newsletter");
            if (res.ok) {
                setSubs(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubs();
    }, []);

    const removeSub = async (id: string) => {
        try {
            const res = await fetch(`/api/newsletter/delete?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setSubs((prev) => prev.filter((s) => s.id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredSubs = subs.filter(s =>
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <PageHeader
                title="Daftar Pelanggan"
                description="Pantau basis data audiens dan kelola daftar individu yang tertarik dengan pembaruan brand Anda."
                actions={
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-3 py-1 rounded-full uppercase">
                            Total {subs.length} Entitas
                        </span>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-12 space-y-6">
                    <Card className="border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/30 border-b border-slate-100/50 p-5 px-6 flex-row items-center justify-between space-y-0">
                            <div className="flex items-center gap-2.5 text-slate-800">
                                <Mail className="size-4 text-slate-400" />
                                <CardTitle className="text-sm font-semibold">Registri Pelanggan Aktif</CardTitle>
                            </div>

                            <div className="relative group min-w-[320px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Filter berdasarkan alamat email..."
                                    className="w-full h-9 bg-white border-slate-200 rounded-lg pl-9 pr-4 text-xs font-medium outline-none border focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400 transition-all shadow-sm"
                                />
                            </div>
                        </CardHeader>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/30">
                                        <th className="px-8 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Alamat Email</th>
                                        <th className="px-8 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-64">Tanggal Berlangganan</th>
                                        <th className="px-8 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-32">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredSubs.map((sub) => (
                                        <tr key={sub.id} className="group hover:bg-slate-50/30 transition-colors">
                                            <td className="px-8 py-4 text-sm font-medium text-slate-700">
                                                {sub.email}
                                            </td>
                                            <td className="px-8 py-4 text-xs font-medium text-slate-400 italic">
                                                {new Date(sub.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <ConfirmDialog
                                                    title="Remove Subscriber?"
                                                    description="This email will be removed from the newsletter registry."
                                                    onConfirm={() => removeSub(sub.id)}
                                                    trigger={
                                                        <Button variant="ghost" size="icon" className="size-8 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredSubs.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="py-24 text-center">
                                                <div className="flex flex-col items-center gap-3 max-w-xs mx-auto text-slate-300">
                                                    <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                                                        <Mail className="size-6" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-semibold">Empty registry</p>
                                                        <p className="text-[11px] italic">No subscribers found matching the criteria</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
