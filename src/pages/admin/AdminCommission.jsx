import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import dashboardService from '../../services/dashboard.service';

const AdminCommission = () => {
    const [settings, setSettings] = useState({ defaultRate: 5, type: 'percentage' });

    useEffect(() => {
        (async () => {
            try {
                const res = await dashboardService.getAdminSettings();
                if (res.success) setSettings(res.data.settings.commission);
            } catch (err) {
                toast.error(err?.message || 'Failed to load settings');
            }
        })();
    }, []);

    const saveSettings = async () => {
        try {
            const res = await dashboardService.updateAdminSettings('commission', settings);
            if (res.success) toast.success('Commission settings saved');
        } catch (err) {
            toast.error(err?.message || 'Failed to save settings');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Commission & Earnings</h1>
                <Card>
                    <h2 className="text-xl font-bold mb-6">Commission Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Input
                            label="Default Commission %"
                            type="number"
                            value={settings.defaultRate}
                            onChange={(e) => setSettings((prev) => ({ ...prev, defaultRate: Number(e.target.value || 0) }))}
                        />
                        <Select
                            label="Commission Type"
                            value={settings.type}
                            onChange={(e) => setSettings((prev) => ({ ...prev, type: e.target.value }))}
                            options={[
                                { value: 'percentage', label: 'Percentage' },
                                { value: 'fixed', label: 'Fixed per order' },
                            ]}
                        />
                    </div>
                    <Button variant="primary" onClick={saveSettings}>Save Settings</Button>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminCommission;
