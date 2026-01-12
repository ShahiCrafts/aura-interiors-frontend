import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

export default function RevenueChart({ data }) {
    return (
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Sales Overview</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Revenue trend over the last 30 days</p>
                </div>
                <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer hover:border-teal-200">
                    <option>Last 30 Days</option>
                    <option>This Month</option>
                    <option>Last 3 Months</option>
                    <option>This Year</option>
                </select>
            </div>
            <div className="h-[300px] w-full min-w-0">
                {data && data.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: '#9ca3af' }}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                minTickGap={40}
                                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: '#9ca3af' }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                    padding: '12px'
                                }}
                                labelStyle={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}
                                formatter={(value) => [`NRs. ${value.toLocaleString()}`, 'Revenue']}
                                labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#0d9488"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                dot={false}
                                activeDot={{ r: 5, fill: '#0d9488', strokeWidth: 0 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
