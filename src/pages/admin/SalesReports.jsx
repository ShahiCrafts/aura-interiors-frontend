import { useState } from "react";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingBag,
    Package,
    Calendar,
    Download,
    Filter,
    ArrowRight,
    Loader2,
    PieChart as PieChartIcon,
    BarChart as BarChartIcon
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie,
    Legend
} from "recharts";
import { motion } from "framer-motion";
import { useSalesReports, useCategorySales, useTopProducts } from "../../hooks/admin/useAnalyticsTan";
import * as XLSX from "xlsx";

export default function SalesReports() {
    const [range, setRange] = useState("month");

    const { data: reportsData, isLoading: reportsLoading } = useSalesReports(range);
    const { data: categoryData, isLoading: categoryLoading } = useCategorySales();
    const { data: topProductsData, isLoading: topProductsLoading } = useTopProducts();

    const salesSummary = reportsData?.data?.summary || {};
    const chartData = reportsData?.data?.stats || [];
    const categorySales = categoryData?.data?.salesByCategory || [];
    const topProducts = topProductsData?.data?.topProducts || [];

    const COLORS = ["#0d9488", "#0ea5e9", "#6366f1", "#8b5cf6", "#d946ef", "#f43f5e"];

    const exportToExcel = () => {
        if (!chartData.length) return;

        const ws = XLSX.utils.json_to_sheet(chartData.map(item => ({
            Date: item._id,
            Revenue: item.revenue,
            Orders: item.orders,
            ItemsSold: item.items
        })));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
        XLSX.writeFile(wb, `Aura_Sales_Report_${range}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const StatCard = ({ title, value, growth, icon: Icon, suffix = "", prefix = "" }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm shadow-black/5"
        >
            <div className="flex items-start justify-between">
                <div className="p-3 bg-teal-50 rounded-2xl">
                    <Icon className="text-teal-600" size={24} />
                </div>
                {growth !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${growth >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                        {growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(growth)}%
                    </div>
                )}
            </div>
            <div className="mt-4">
                <p className="text-sm font-medium text-neutral-500">{title}</p>
                <h3 className="text-2xl font-bold text-neutral-900 mt-1">
                    {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
                </h3>
            </div>
        </motion.div>
    );

    if (reportsLoading || categoryLoading || topProductsLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
                <p className="text-neutral-500 font-medium font-dm-sans">Generating your reports...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 bg-white min-h-screen font-dm-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Sales Intelligence</h1>
                    <p className="text-sm text-neutral-500 mt-1">Comprehensive analysis of your business performance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-neutral-100 p-1 rounded-xl">
                        {['week', 'month', 'year'].map((r) => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${range === r ? 'bg-white text-teal-700 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                                    }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-700 text-white rounded-xl text-sm font-bold hover:bg-teal-800 transition-all"
                    >
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Net Revenue"
                    value={salesSummary.totalRevenue}
                    growth={salesSummary.revenueGrowth}
                    icon={DollarSign}
                    prefix="Rs. "
                />
                <StatCard
                    title="Total Orders"
                    value={salesSummary.totalOrders}
                    growth={salesSummary.ordersGrowth}
                    icon={ShoppingBag}
                />
                <StatCard
                    title="Items Sold"
                    value={salesSummary.totalItems}
                    icon={Package}
                />
                <StatCard
                    title="Avg. Order Value"
                    value={salesSummary.avgOrderValue}
                    icon={TrendingUp}
                    prefix="Rs. "
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm shadow-black/5">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-neutral-900">Revenue Flow</h3>
                        <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                            <span className="w-3 h-3 bg-teal-500 rounded-full"></span>
                            Daily Revenue
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="_id"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        fontFamily: 'DM Sans'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#0d9488"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm shadow-black/5">
                    <h3 className="text-lg font-bold text-neutral-900 mb-8">Categories Impact</h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categorySales}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={8}
                                    dataKey="revenue"
                                >
                                    {categorySales.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        fontFamily: 'DM Sans'
                                    }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    align="center"
                                    iconType="circle"
                                    formatter={(value) => <span className="text-xs font-bold text-neutral-600">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Products Table */}
                <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm shadow-black/5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-neutral-900">Bestselling Items</h3>
                        <button className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {topProducts.map((product, index) => (
                            <div key={product._id} className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50/50 border border-neutral-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white overflow-hidden border border-neutral-100 p-1">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-neutral-900 truncate max-w-[200px]">{product.name}</p>
                                        <p className="text-xs text-neutral-500 mt-0.5">{product.sales} units sold</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-neutral-900">Rs. {product.revenue.toLocaleString()}</p>
                                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-1">Top {index + 1}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Volume Bar Chart */}
                <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm shadow-black/5">
                    <h3 className="text-lg font-bold text-neutral-900 mb-8">Order Velocity</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis
                                    dataKey="_id"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        fontFamily: 'DM Sans'
                                    }}
                                />
                                <Bar dataKey="orders" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={range === 'year' ? 20 : 10} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
