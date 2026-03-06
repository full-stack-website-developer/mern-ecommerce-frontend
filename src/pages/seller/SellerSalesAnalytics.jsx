import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import SellerLayout from '../../components/layout/SellerLayout';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import dashboardService from '../../services/dashboard.service';
import usePlatformSettings from '../../hooks/usePlatformSettings';

const SellerSalesAnalytics = () => {
    const { settings } = usePlatformSettings();
    const [range, setRange] = useState('30');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [analytics, setAnalytics] = useState({ gross: 0, orders: 0, avgOrderValue: 0, itemCount: 0 });

    const formatMoney = useCallback((value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: settings.currency || 'USD',
            maximumFractionDigits: 2,
        }).format(Number(value || 0));
    }, [settings.currency]);

    const loadAnalytics = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await dashboardService.getSellerAnalytics(Number(range));
            if (!res?.success) throw new Error('Failed to load analytics');
            setAnalytics({
                gross: Number(res.data?.analytics?.gross || 0),
                orders: Number(res.data?.analytics?.orders || 0),
                avgOrderValue: Number(res.data?.analytics?.avgOrderValue || 0),
                itemCount: Number(res.data?.analytics?.itemCount || 0),
            });
        } catch (err) {
            const message = err?.message || 'Failed to load analytics';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [range]);

    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    return (
        <SellerLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Sales Analytics</h1>
                        <p className="text-sm text-gray-500 mt-1">Track your sales performance for different time ranges</p>
                    </div>
                    <div className="flex gap-2">
                        <Select
                            className="w-48"
                            value={range}
                            onChange={(e) => setRange(e.target.value)}
                            options={[
                                { value: '7', label: 'Last 7 days' },
                                { value: '30', label: 'Last 30 days' },
                                { value: '90', label: 'Last 90 days' },
                                { value: '365', label: 'Last 365 days' },
                            ]}
                        />
                        <Button variant="outline" onClick={loadAnalytics} disabled={loading}>
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </Button>
                    </div>
                </div>

                {error && (
                    <Card className="border border-red-200 bg-red-50">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm text-red-700">{error}</p>
                            <Button variant="secondary" onClick={loadAnalytics}>Retry</Button>
                        </div>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <p className="text-sm text-gray-600">Total Sales</p>
                        <p className="text-2xl font-bold mt-1">{loading ? '...' : formatMoney(analytics.gross)}</p>
                    </Card>
                    <Card>
                        <p className="text-sm text-gray-600">Orders</p>
                        <p className="text-2xl font-bold mt-1">{loading ? '...' : analytics.orders}</p>
                    </Card>
                    <Card>
                        <p className="text-sm text-gray-600">Avg Order Value</p>
                        <p className="text-2xl font-bold mt-1">{loading ? '...' : formatMoney(analytics.avgOrderValue)}</p>
                    </Card>
                    <Card>
                        <p className="text-sm text-gray-600">Items Sold</p>
                        <p className="text-2xl font-bold mt-1">{loading ? '...' : analytics.itemCount}</p>
                    </Card>
                </div>
            </div>
        </SellerLayout>
    );
};

export default SellerSalesAnalytics;
