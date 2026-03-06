import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import SellerLayout from '../../components/layout/SellerLayout';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import dashboardService from '../../services/dashboard.service';
import usePlatformSettings from '../../hooks/usePlatformSettings';

const SellerRevenue = () => {
    const { settings } = usePlatformSettings();
    const [range, setRange] = useState('30');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [analytics, setAnalytics] = useState({
        gross: 0,
        commission: 0,
        net: 0,
        commissionRate: 5,
        orders: 0,
        avgOrderValue: 0,
    });

    const formatMoney = useCallback((value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: settings.currency || 'USD',
            maximumFractionDigits: 2,
        }).format(Number(value || 0));
    }, [settings.currency]);

    const loadRevenue = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await dashboardService.getSellerAnalytics(Number(range));
            if (!res?.success) throw new Error('Failed to load revenue');
            setAnalytics({
                gross: Number(res.data?.analytics?.gross || 0),
                commission: Number(res.data?.analytics?.commission || 0),
                net: Number(res.data?.analytics?.net || 0),
                commissionRate: Number(res.data?.analytics?.commissionRate || 0),
                orders: Number(res.data?.analytics?.orders || 0),
                avgOrderValue: Number(res.data?.analytics?.avgOrderValue || 0),
            });
        } catch (err) {
            const message = err?.message || 'Failed to load revenue';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [range]);

    useEffect(() => {
        loadRevenue();
    }, [loadRevenue]);

    return (
        <SellerLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Revenue Tracking</h1>
                        <p className="text-sm text-gray-500 mt-1">Review gross, commission, and net earnings for the selected period</p>
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
                        <Button variant="outline" onClick={loadRevenue} disabled={loading}>
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </Button>
                    </div>
                </div>

                {error && (
                    <Card className="border border-red-200 bg-red-50">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm text-red-700">{error}</p>
                            <Button variant="secondary" onClick={loadRevenue}>Retry</Button>
                        </div>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <Card>
                        <p className="text-sm text-gray-600">Gross Revenue</p>
                        <p className="text-2xl font-bold mt-1">{loading ? '...' : formatMoney(analytics.gross)}</p>
                    </Card>
                    <Card>
                        <p className="text-sm text-gray-600">Commission</p>
                        <p className="text-2xl font-bold mt-1">{loading ? '...' : formatMoney(analytics.commission)}</p>
                    </Card>
                    <Card>
                        <p className="text-sm text-gray-600">Net Revenue</p>
                        <p className="text-2xl font-bold mt-1 text-green-600">{loading ? '...' : formatMoney(analytics.net)}</p>
                    </Card>
                    <Card>
                        <p className="text-sm text-gray-600">Commission Rate</p>
                        <p className="text-2xl font-bold mt-1">{loading ? '...' : `${analytics.commissionRate}%`}</p>
                    </Card>
                    <Card>
                        <p className="text-sm text-gray-600">Avg Order Value</p>
                        <p className="text-2xl font-bold mt-1">{loading ? '...' : formatMoney(analytics.avgOrderValue)}</p>
                    </Card>
                </div>

                <Card className="border border-gray-100 bg-gray-50">
                    <p className="text-sm text-gray-700">
                        <span className="font-semibold">Summary:</span>{' '}
                        {loading
                            ? 'Loading summary...'
                            : `${analytics.orders} orders generated ${formatMoney(analytics.gross)} gross revenue in this period.`}
                    </p>
                </Card>
            </div>
        </SellerLayout>
    );
};

export default SellerRevenue;
