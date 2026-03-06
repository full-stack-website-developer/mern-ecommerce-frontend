import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import SellerLayout from '../../components/layout/SellerLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Radio from '../../components/common/Radio';
import dashboardService from '../../services/dashboard.service';
import usePlatformSettings from '../../hooks/usePlatformSettings';

const defaultPayout = {
    payoutMethod: 'bank',
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    stripeAccountId: '',
    frequency: 'weekly',
    minimumPayout: 50,
};

const SellerPayoutSettings = () => {
    const { settings } = usePlatformSettings();
    const [payout, setPayout] = useState(defaultPayout);
    const [summary, setSummary] = useState({
        eligibleEarnings: 0,
        withdrawn: 0,
        pending: 0,
        available: 0,
        currency: 'usd',
        minimumPayout: 0,
        payouts: [],
    });
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawing, setWithdrawing] = useState(false);
    const [showAllPayouts, setShowAllPayouts] = useState(false);
    const [payoutFilter, setPayoutFilter] = useState('all'); // all, paid, failed, pending

    const currencyCode = (settings?.currency || 'USD').toUpperCase();
    const formatMoney = (value) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));

    const loadPayoutData = useCallback(async () => {
        try {
            const [settingsRes, summaryRes] = await Promise.all([
                dashboardService.getSellerSettings(),
                dashboardService.getSellerPayoutSummary(),
            ]);
            if (settingsRes.success) {
                setPayout((prev) => ({ ...prev, ...settingsRes.data.settings.payout }));
            }
            if (summaryRes.success) {
                setSummary((prev) => ({ ...prev, ...(summaryRes.data.summary || {}) }));
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to load payout settings');
        }
    }, []);

    useEffect(() => {
        loadPayoutData();
    }, [loadPayoutData]);

    const savePayout = async () => {
        try {
            const res = await dashboardService.updateSellerPayout(payout);
            if (res.success) {
                toast.success('Payout settings saved');
                await loadPayoutData();
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to save payout settings');
        }
    };

    const handleWithdraw = async () => {
        try {
            setWithdrawing(true);
            const amount = Number(withdrawAmount);
            const res = await dashboardService.withdrawSellerPayout({ amount, currency: summary.currency || 'usd' });
            if (res.success) {
                toast.success('Withdrawal submitted successfully');
                setWithdrawAmount('');
                await loadPayoutData();
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to withdraw');
        } finally {
            setWithdrawing(false);
        }
    };

    return (
        <SellerLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Bank & Payout Settings</h1>
                <Card>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold">Payout Method</h2>
                    </div>
                    <div className="space-y-4 mb-6">
                        <div className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                            <Radio 
                                name="payout" 
                                value="bank" 
                                checked={payout.payoutMethod === 'bank'} 
                                onChange={() => setPayout((p) => ({ ...p, payoutMethod: 'bank' }))} 
                                label=""
                                className="mr-3"
                            />
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <div>
                                    <p className="font-medium">Bank Transfer</p>
                                    <p className="text-sm text-gray-500">Direct transfer to your bank account</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                            <Radio 
                                name="payout" 
                                value="paypal" 
                                checked={payout.payoutMethod === 'paypal'} 
                                onChange={() => setPayout((p) => ({ ...p, payoutMethod: 'paypal' }))} 
                                label=""
                                className="mr-3"
                            />
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.26-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.75.75 0 0 0-.741.633l-1.398 8.864a.641.641 0 0 0 .633.74h4.606a.75.75 0 0 0 .741-.633l.308-1.95a.641.641 0 0 1 .633-.74h2.19c3.78 0 6.734-1.548 7.598-6.02.72-3.727.441-6.83-1.594-8.814z"/>
                                </svg>
                                <div>
                                    <p className="font-medium">PayPal</p>
                                    <p className="text-sm text-gray-500">Transfer to your PayPal account</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                            <Radio 
                                name="payout" 
                                value="stripe" 
                                checked={payout.payoutMethod === 'stripe'} 
                                onChange={() => setPayout((p) => ({ ...p, payoutMethod: 'stripe' }))} 
                                label=""
                                className="mr-3"
                            />
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                                </svg>
                                <div>
                                    <p className="font-medium">Stripe Connect</p>
                                    <p className="text-sm text-gray-500">Fast transfers via Stripe platform</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold">Bank Account</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Input 
                            label="Account Holder Name" 
                            value={payout.accountHolderName} 
                            onChange={(e) => setPayout((p) => ({ ...p, accountHolderName: e.target.value }))} 
                        />
                        <Input 
                            label="Bank Name" 
                            value={payout.bankName} 
                            onChange={(e) => setPayout((p) => ({ ...p, bankName: e.target.value }))} 
                        />
                        <Input 
                            label="Account Number" 
                            value={payout.accountNumber} 
                            onChange={(e) => setPayout((p) => ({ ...p, accountNumber: e.target.value }))} 
                        />
                        <Input 
                            label="Routing Number" 
                            value={payout.routingNumber} 
                            onChange={(e) => setPayout((p) => ({ ...p, routingNumber: e.target.value }))} 
                        />
                        <div className="md:col-span-2">
                            <Input
                                label="Stripe Connected Account ID"
                                placeholder="acct_..."
                                value={payout.stripeAccountId || ''}
                                onChange={(e) => setPayout((p) => ({ ...p, stripeAccountId: e.target.value }))}
                            />
                        </div>
                    </div>
                    <Button variant="primary" onClick={savePayout} className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Bank Details
                    </Button>
                </Card>
                <Card>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l-2 9a1 1 0 001 1h8a1 1 0 001-1l-2-9m-8 0V6a2 2 0 012-2h4a2 2 0 012 2v1" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold">Payout Schedule</h2>
                    </div>
                    <div className="space-y-4 mb-6">
                        <Select
                            label="Frequency"
                            value={payout.frequency}
                            onChange={(e) => setPayout((p) => ({ ...p, frequency: e.target.value }))}
                            options={[
                                { value: 'weekly', label: 'Weekly' },
                                { value: 'biweekly', label: 'Bi-weekly' },
                                { value: 'monthly', label: 'Monthly' },
                            ]}
                        />
                        <Input
                            label="Minimum Payout"
                            type="number"
                            value={payout.minimumPayout}
                            onChange={(e) => setPayout((p) => ({ ...p, minimumPayout: Number(e.target.value || 0) }))}
                        />
                    </div>
                    <Button variant="outline" onClick={savePayout} className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Update Schedule
                    </Button>
                </Card>
                <Card>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold">Withdraw Funds</h2>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Stripe Test</span>
                    </div>

                    {/* Balance Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-blue-700">Eligible Earnings</p>
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <p className="text-2xl font-bold text-blue-900">{formatMoney(summary.eligibleEarnings)}</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-700">Already Withdrawn</p>
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{formatMoney(summary.withdrawn)}</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-amber-700">Pending Transfers</p>
                                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-2xl font-bold text-amber-900">{formatMoney(summary.pending)}</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-green-700">Available Now</p>
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-2xl font-bold text-green-900">{formatMoney(summary.available)}</p>
                        </div>
                    </div>

                    {/* Withdrawal Form */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-8">
                        <div className="flex flex-col md:flex-row gap-4 md:items-end">
                            <div className="flex-1 max-w-xs">
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    label={`Withdraw Amount (Min ${summary.minimumPayout || payout.minimumPayout})`}
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    className="bg-white"
                                />
                            </div>
                            <Button
                                variant="primary"
                                onClick={handleWithdraw}
                                disabled={withdrawing || payout.payoutMethod !== 'stripe'}
                                className="flex items-center gap-2 px-6 py-3"
                            >
                                {withdrawing ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                        Withdraw to Stripe
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Status Messages */}
                        <div className="mt-4 space-y-2">
                            {payout.payoutMethod !== 'stripe' && (
                                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <p className="text-sm text-amber-700">Set payout method to Stripe to enable withdrawals.</p>
                                </div>
                            )}
                            {!payout.stripeAccountId && payout.payoutMethod === 'stripe' && (
                                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <p className="text-sm text-amber-700">Add Stripe Connected Account ID (acct_...) before withdrawing.</p>
                                </div>
                            )}
                            {payout.stripeAccountId && (
                                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-blue-700">
                                        Use a separate connected account ID for seller payouts. Do not use the platform account tied to your STRIPE_SECRET_KEY.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Payouts */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <h3 className="text-lg font-semibold">Recent Payouts</h3>
                                {Array.isArray(summary.payouts) && summary.payouts.length > 0 && (
                                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                        {summary.payouts.length} total
                                    </span>
                                )}
                            </div>
                            
                            {Array.isArray(summary.payouts) && summary.payouts.length > 0 && (
                                <div className="flex items-center gap-3">
                                    {/* Filter Dropdown */}
                                    <select 
                                        value={payoutFilter} 
                                        onChange={(e) => setPayoutFilter(e.target.value)}
                                        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="paid">Paid Only</option>
                                        <option value="failed">Failed Only</option>
                                        <option value="pending">Pending Only</option>
                                    </select>
                                    
                                    {/* Expand/Collapse Button */}
                                    <button
                                        onClick={() => setShowAllPayouts(!showAllPayouts)}
                                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        {showAllPayouts ? (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                </svg>
                                                Show Less
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                                Show All
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {Array.isArray(summary.payouts) && summary.payouts.length > 0 ? (
                            <div className="space-y-3">
                                {(() => {
                                    // Filter payouts based on selected filter
                                    let filteredPayouts = summary.payouts;
                                    if (payoutFilter !== 'all') {
                                        filteredPayouts = summary.payouts.filter(tx => tx.status === payoutFilter);
                                    }
                                    
                                    // Limit display if not showing all
                                    const displayPayouts = showAllPayouts ? filteredPayouts : filteredPayouts.slice(0, 5);
                                    
                                    return (
                                        <>
                                            {/* Scrollable Container */}
                                            <div className={`space-y-3 ${showAllPayouts ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
                                                {displayPayouts.map((tx) => (
                                                    <div key={tx._id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300">
                                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                                    tx.status === 'paid' ? 'bg-green-100' : 
                                                                    tx.status === 'failed' ? 'bg-red-100' : 'bg-amber-100'
                                                                }`}>
                                                                    {tx.status === 'paid' ? (
                                                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    ) : tx.status === 'failed' ? (
                                                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    ) : (
                                                                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-lg">{formatMoney(tx.amount)}</p>
                                                                    <p className="text-sm text-gray-500">
                                                                        {new Date(tx.createdAt).toLocaleDateString('en-US', {
                                                                            year: 'numeric',
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </p>
                                                                    {tx.stripeTransferId && (
                                                                        <p className="text-xs text-gray-400 font-mono">
                                                                            ID: {tx.stripeTransferId}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                                    tx.status === 'paid' ? 'bg-green-100 text-green-800' : 
                                                                    tx.status === 'failed' ? 'bg-red-100 text-red-800' : 
                                                                    'bg-amber-100 text-amber-800'
                                                                }`}>
                                                                    {tx.status === 'paid' ? 'Paid' : tx.status === 'failed' ? 'Failed' : 'Pending'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {/* Show more indicator */}
                                            {!showAllPayouts && filteredPayouts.length > 5 && (
                                                <div className="text-center py-4">
                                                    <button
                                                        onClick={() => setShowAllPayouts(true)}
                                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2 mx-auto"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                        Show {filteredPayouts.length - 5} more payouts
                                                    </button>
                                                </div>
                                            )}
                                            
                                            {filteredPayouts.length === 0 && payoutFilter !== 'all' && (
                                                <div className="text-center py-8 bg-gray-50 rounded-xl">
                                                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <p className="text-gray-500">No {payoutFilter} payouts found.</p>
                                                    <button
                                                        onClick={() => setPayoutFilter('all')}
                                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                                                    >
                                                        Show all payouts
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-xl">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <p className="text-gray-500 text-lg font-medium">No payout transactions yet.</p>
                                <p className="text-sm text-gray-400 mt-1">Your withdrawal history will appear here once you make your first payout.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </SellerLayout>
    );
};

export default SellerPayoutSettings;
