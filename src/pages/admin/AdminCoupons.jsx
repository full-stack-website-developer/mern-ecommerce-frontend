import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import dashboardService from '../../services/dashboard.service';

const emptyCoupon = {
  code: '',
  type: 'percent',
  value: '',
  minOrder: '',
  maxDiscount: '',
  usageLimit: '',
  startsAt: '',
  expiresAt: '',
  active: true,
  usedCount: 0,
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState(emptyCoupon);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await dashboardService.getAdminCoupons();
        if (res.success) setCoupons(res.data.coupons || []);
      } catch (err) {
        toast.error(err?.message || 'Failed to load coupons');
      }
    })();
  }, []);

  const normalizeCoupon = (coupon) => ({
    ...coupon,
    code: String(coupon.code || '').toUpperCase().trim(),
    value: Number(coupon.value || 0),
    minOrder: Number(coupon.minOrder || 0),
    maxDiscount: coupon.maxDiscount === '' || coupon.maxDiscount == null ? null : Number(coupon.maxDiscount),
    usageLimit: coupon.usageLimit === '' || coupon.usageLimit == null ? null : Number(coupon.usageLimit),
    usedCount: Number(coupon.usedCount || 0),
    startsAt: coupon.startsAt || null,
    expiresAt: coupon.expiresAt || null,
    active: coupon.active !== false,
  });

  const saveCoupons = async (list) => {
    try {
      setSaving(true);
      const normalized = list.map(normalizeCoupon).filter((c) => c.code);
      const res = await dashboardService.updateAdminCoupons(normalized);
      if (res.success) {
        setCoupons(res.data.coupons || normalized);
        toast.success('Coupons saved');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to save coupons');
    } finally {
      setSaving(false);
    }
  };

  const addCoupon = async () => {
    if (!newCoupon.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }
    if (Number(newCoupon.value || 0) <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }

    const exists = coupons.some((coupon) => coupon.code.toUpperCase() === newCoupon.code.toUpperCase());
    if (exists) {
      toast.error('Coupon code already exists');
      return;
    }

    const next = [...coupons, normalizeCoupon(newCoupon)];
    await saveCoupons(next);
    setNewCoupon(emptyCoupon);
  };

  const updateCoupon = (index, key, value) => {
    setCoupons((prev) => prev.map((coupon, i) => (i === index ? { ...coupon, [key]: value } : coupon)));
  };

  const removeCoupon = async (index) => {
    const next = coupons.filter((_, i) => i !== index);
    await saveCoupons(next);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Coupon Management</h1>

        <Card>
          <h2 className="text-xl font-bold mb-4">Create Coupon</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input label="Code" value={newCoupon.code} onChange={(e) => setNewCoupon((p) => ({ ...p, code: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                className="input-field"
                value={newCoupon.type}
                onChange={(e) => setNewCoupon((p) => ({ ...p, type: e.target.value }))}
              >
                <option value="percent">Percent</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <Input label="Value" type="number" value={newCoupon.value} onChange={(e) => setNewCoupon((p) => ({ ...p, value: e.target.value }))} />
            <Input label="Minimum Order" type="number" value={newCoupon.minOrder} onChange={(e) => setNewCoupon((p) => ({ ...p, minOrder: e.target.value }))} />
            <Input label="Max Discount (optional)" type="number" value={newCoupon.maxDiscount} onChange={(e) => setNewCoupon((p) => ({ ...p, maxDiscount: e.target.value }))} />
            <Input label="Usage Limit (optional)" type="number" value={newCoupon.usageLimit} onChange={(e) => setNewCoupon((p) => ({ ...p, usageLimit: e.target.value }))} />
            <Input label="Starts At (optional)" type="datetime-local" value={newCoupon.startsAt} onChange={(e) => setNewCoupon((p) => ({ ...p, startsAt: e.target.value }))} />
            <Input label="Expires At (optional)" type="datetime-local" value={newCoupon.expiresAt} onChange={(e) => setNewCoupon((p) => ({ ...p, expiresAt: e.target.value }))} />
          </div>
          <div className="mt-4">
            <Button variant="primary" onClick={addCoupon} disabled={saving}>Add Coupon</Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Existing Coupons</h2>
            <Button variant="outline" onClick={() => saveCoupons(coupons)} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {coupons.length === 0 ? (
            <p className="text-gray-500">No coupons created yet.</p>
          ) : (
            <div className="space-y-4">
              {coupons.map((coupon, index) => (
                <div key={`${coupon.code}-${index}`} className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
                  <Input label="Code" value={coupon.code} onChange={(e) => updateCoupon(index, 'code', e.target.value.toUpperCase())} />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      className="input-field"
                      value={coupon.type}
                      onChange={(e) => updateCoupon(index, 'type', e.target.value)}
                    >
                      <option value="percent">Percent</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>
                  <Input label="Value" type="number" value={coupon.value} onChange={(e) => updateCoupon(index, 'value', e.target.value)} />
                  <Input label="Minimum Order" type="number" value={coupon.minOrder || 0} onChange={(e) => updateCoupon(index, 'minOrder', e.target.value)} />
                  <Input label="Max Discount" type="number" value={coupon.maxDiscount ?? ''} onChange={(e) => updateCoupon(index, 'maxDiscount', e.target.value)} />
                  <Input label="Usage Limit" type="number" value={coupon.usageLimit ?? ''} onChange={(e) => updateCoupon(index, 'usageLimit', e.target.value)} />
                  <Input label="Used Count" type="number" value={coupon.usedCount ?? 0} onChange={(e) => updateCoupon(index, 'usedCount', e.target.value)} />
                  <Input label="Starts At" type="datetime-local" value={coupon.startsAt || ''} onChange={(e) => updateCoupon(index, 'startsAt', e.target.value)} />
                  <Input label="Expires At" type="datetime-local" value={coupon.expiresAt || ''} onChange={(e) => updateCoupon(index, 'expiresAt', e.target.value)} />
                  <div className="flex items-end gap-3">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={coupon.active !== false}
                        onChange={(e) => updateCoupon(index, 'active', e.target.checked)}
                      />
                      Active
                    </label>
                    <Button variant="ghost" className="text-red-600" onClick={() => removeCoupon(index)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminCoupons;
