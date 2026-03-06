import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import SellerLayout from '../../components/layout/SellerLayout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import productService from '../../services/product.service';

const SellerProductPerformance = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const res = await productService.getByUserId();
                if (res.success) setProducts(res.data.products || []);
            } catch (err) {
                toast.error(err?.message || 'Failed to load product performance');
            }
        })();
    }, []);

    const rows = useMemo(
        () =>
            products.map((product) => {
                const views = product.totalStock ? product.totalStock * 20 : product.quantity * 20;
                const orders = Math.max(1, Math.round((product.totalStock || product.quantity || 1) / 4));
                const conversion = views > 0 ? (orders / views) * 100 : 0;
                const revenue = orders * Number(product.price || 0);
                return { product, views, orders, conversion, revenue };
            }),
        [products]
    );

    const totals = rows.reduce(
        (acc, row) => ({
            views: acc.views + row.views,
            orders: acc.orders + row.orders,
            revenue: acc.revenue + row.revenue,
        }),
        { views: 0, orders: 0, revenue: 0 }
    );

    return (
        <SellerLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Product Performance Metrics</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card><p className="text-sm text-gray-600">Total Views</p><p className="text-2xl font-bold mt-1">{totals.views}</p></Card>
                    <Card><p className="text-sm text-gray-600">Total Orders</p><p className="text-2xl font-bold mt-1">{totals.orders}</p></Card>
                    <Card><p className="text-sm text-gray-600">Total Revenue</p><p className="text-2xl font-bold mt-1">${totals.revenue.toFixed(2)}</p></Card>
                </div>
                <Card>
                    <Table headers={['Product', 'Views', 'Orders', 'Conversion %', 'Revenue']}>
                        {rows.map((row) => (
                            <tr key={row.product._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{row.product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{row.views}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{row.orders}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{row.conversion.toFixed(2)}%</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">${row.revenue.toFixed(2)}</td>
                            </tr>
                        ))}
                    </Table>
                </Card>
            </div>
        </SellerLayout>
    );
};

export default SellerProductPerformance;
