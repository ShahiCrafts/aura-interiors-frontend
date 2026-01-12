import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';

export default function TopProductsTable({ products }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Top Products</h2>
                <Link to="/admin/products" className="text-teal-600 text-sm font-medium hover:text-teal-700 flex items-center gap-1 transition-colors">
                    View All <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50/50">
                        <tr className="text-left text-gray-500">
                            <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 font-medium text-right text-xs uppercase tracking-wider">Deals</th>
                            <th className="px-6 py-3 font-medium text-right text-xs uppercase tracking-wider">Total Value</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {products.map((product) => (
                            <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center border border-gray-200">
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Package className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>
                                        <p className="font-medium text-gray-900 truncate max-w-[140px]">{product.name}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right text-gray-600">{product.sales.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right font-semibold text-gray-900">NRs. {product.revenue.toLocaleString()}</td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan="3" className="px-6 py-10 text-center text-gray-400">No sales data yet</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
