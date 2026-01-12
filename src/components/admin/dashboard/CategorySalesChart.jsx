import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const COLORS = ['#22c55e', '#a3e635', '#facc15', '#fb923c', '#60a5fa', '#a78bfa'];

export default function CategorySalesChart({ data }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Sales by Category</h2>
            <div className="flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                            formatter={(val) => [val, 'Sold']}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 w-full">
                    {data.slice(0, 6).map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2 text-sm">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                            <span className="text-gray-600 truncate">{entry.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
