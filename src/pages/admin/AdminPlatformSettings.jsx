import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import dashboardService from '../../services/dashboard.service';
import usePlatformSettings from '../../hooks/usePlatformSettings';

const defaultSettings = {
    gateway: 'stripe',
    currency: 'USD',
    defaultShippingCost: 10,
    freeShippingThreshold: 100,
    taxRate: 10,
    siteName: 'Ecommerce',
    supportEmail: '',
    supportPhone: '',
};

const AdminPlatformSettings = () => {
    const [settings, setSettings] = useState(defaultSettings);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const { reload } = usePlatformSettings();

    const load = async () => {
        try {
            setLoading(true);
            const res = await dashboardService.getAdminSettings();
            if (res.success) {
                setSettings({ ...defaultSettings, ...res.data.settings.platform });
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to load platform settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const updateField = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

    const validate = () => {
        if (!settings.siteName?.trim()) return 'Site name is required';
        if (!/^[A-Za-z]{3}$/.test(settings.currency || '')) return 'Currency must be a 3-letter code (e.g., USD)';
        if (Number(settings.defaultShippingCost) < 0) return 'Default shipping cost cannot be negative';
        if (Number(settings.freeShippingThreshold) < 0) return 'Free shipping threshold cannot be negative';
        if (Number(settings.taxRate) < 0 || Number(settings.taxRate) > 100) return 'Tax rate must be between 0 and 100';
        if (settings.supportEmail && !/^\S+@\S+\.\S+$/.test(settings.supportEmail)) return 'Support email is invalid';
        return null;
    };

    const save = async () => {
        const error = validate();
        if (error) {
            toast.error(error);
            return;
        }

        try {
            setSaving(true);
            const res = await dashboardService.updateAdminSettings('platform', settings);
            if (res.success) {
                await reload();
                toast.success('Platform settings saved and synced');
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to save platform settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Platform Settings</h1>
                <Card>
                    <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                        Changes here are used on storefront pricing and contact UI. Shipping methods use multipliers:
                        standard = 1x, express = 2x, overnight = 3x of the default shipping cost.
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Default Payment Gateway</label>
                            <select
                                value={settings.gateway}
                                onChange={(e) => updateField('gateway', e.target.value)}
                                className="input-field"
                            >
                                <option value="stripe">Stripe</option>
                                <option value="paypal">PayPal</option>
                                <option value="cod">Cash on Delivery</option>
                            </select>
                        </div>

                        <Input label="Currency" value={settings.currency} onChange={(e) => updateField('currency', e.target.value.toUpperCase())} />
                        <Input label="Default Shipping Cost" type="number" value={settings.defaultShippingCost} onChange={(e) => updateField('defaultShippingCost', Number(e.target.value || 0))} />
                        <Input label="Free Shipping Threshold" type="number" value={settings.freeShippingThreshold} onChange={(e) => updateField('freeShippingThreshold', Number(e.target.value || 0))} />
                        <Input label="Tax Rate %" type="number" value={settings.taxRate} onChange={(e) => updateField('taxRate', Number(e.target.value || 0))} />
                        <Input label="Site Name" value={settings.siteName} onChange={(e) => updateField('siteName', e.target.value)} />
                        <Input label="Support Email" value={settings.supportEmail} onChange={(e) => updateField('supportEmail', e.target.value)} />
                        <Input label="Support Phone" value={settings.supportPhone} onChange={(e) => updateField('supportPhone', e.target.value)} />
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-6">
                        <p className="text-sm text-gray-700">
                            <span className="font-semibold">Preview:</span> {settings.siteName || 'Ecommerce'} | Currency: {settings.currency} | Tax: {settings.taxRate}%
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button variant="primary" onClick={save} disabled={saving || loading}>
                            {saving ? 'Saving...' : 'Save Settings'}
                        </Button>
                        <Button variant="outline" onClick={load} disabled={saving || loading}>
                            Reload
                        </Button>
                        <Button variant="outline" onClick={() => setSettings(defaultSettings)} disabled={saving || loading}>
                            Reset to Defaults
                        </Button>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminPlatformSettings;
