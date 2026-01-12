import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ label, value, trend, trendUp, trendLabel, icon: Icon, color = "emerald" }) {
    const colorClasses = {
        emerald: "bg-emerald-600 text-white",
        blue: "bg-blue-600 text-white",
        orange: "bg-orange-500 text-white",
        purple: "bg-purple-600 text-white",
        indigo: "bg-indigo-600 text-white",
        rose: "bg-rose-500 text-white",
        cyan: "bg-cyan-500 text-white",
    };

    const bgColor = colorClasses[color] || colorClasses.emerald;

    return (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
                </div>
                {Icon && (
                    <div className={`p-2.5 rounded-xl ${bgColor} shadow-sm`}>
                        <Icon size={20} />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1.5 mt-4">
                <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${trendUp ? 'text-teal-600' : 'text-red-500'}`}>
                    {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {trend}
                </span>
                <span className="text-xs text-gray-400 font-medium">{trendLabel}</span>
            </div>
        </div>
    );
}
