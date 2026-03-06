import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Checkbox from '../../components/common/Checkbox';
import dashboardService from '../../services/dashboard.service';

const defaultCms = {
  hero: {
    badgeText: 'New Collection 2026',
    title: 'Shop the Latest Trends',
    subtitle: 'Discover amazing products at unbeatable prices. Free shipping on orders over $50.',
    primaryButtonText: 'Shop Now',
    primaryButtonLink: '/products',
    secondaryButtonText: 'Flash Sales',
    secondaryButtonLink: '/products',
    imageUrl: '',
    startColor: '#2563eb',
    endColor: '#1e3a8a',
  },
  promos: [],
  newsletter: {
    title: 'Subscribe to Our Newsletter',
    subtitle: 'Get the latest updates on new products and upcoming sales',
    placeholder: 'Enter your email',
    buttonText: 'Subscribe',
  },
  sections: {
    hero: true,
    flashSales: true,
    categories: true,
    featuredProducts: true,
    recommendedProducts: true,
    recentlyViewed: true,
    newsletter: true,
  },
};

const AdminCMS = () => {
  const [cms, setCms] = useState(defaultCms);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await dashboardService.getAdminSettings();
        if (res.success) {
          setCms({
            ...defaultCms,
            ...res.data.settings.cms,
            hero: { ...defaultCms.hero, ...(res.data.settings.cms?.hero || {}) },
            newsletter: { ...defaultCms.newsletter, ...(res.data.settings.cms?.newsletter || {}) },
            sections: { ...defaultCms.sections, ...(res.data.settings.cms?.sections || {}) },
          });
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to load CMS');
      }
    })();
  }, []);

  const updateHero = (field, value) =>
    setCms((prev) => ({ ...prev, hero: { ...prev.hero, [field]: value } }));

  const updateNewsletter = (field, value) =>
    setCms((prev) => ({ ...prev, newsletter: { ...prev.newsletter, [field]: value } }));

  const updateSections = (field, checked) =>
    setCms((prev) => ({ ...prev, sections: { ...prev.sections, [field]: checked } }));

  const handleHeroImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateHero('imageUrl', String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  };

  const addPromo = () =>
    setCms((prev) => ({
      ...prev,
      promos: [...(prev.promos || []), { title: '', subtitle: '', link: '/products', emoji: '🔥' }],
    }));

  const removePromo = (index) =>
    setCms((prev) => ({
      ...prev,
      promos: (prev.promos || []).filter((_, i) => i !== index),
    }));

  const updatePromo = (index, field, value) =>
    setCms((prev) => ({
      ...prev,
      promos: (prev.promos || []).map((promo, i) => (i === index ? { ...promo, [field]: value } : promo)),
    }));

  const save = async () => {
    try {
      setSaving(true);
      const res = await dashboardService.updateAdminSettings('cms', cms);
      if (res.success) toast.success('CMS settings saved');
    } catch (err) {
      toast.error(err?.message || 'Failed to save CMS');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">CMS Settings</h1>

        <Card>
          <h2 className="text-xl font-bold mb-4">Homepage Hero</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Badge Text" value={cms.hero.badgeText} onChange={(e) => updateHero('badgeText', e.target.value)} />
            <Input label="Hero Title" value={cms.hero.title} onChange={(e) => updateHero('title', e.target.value)} />
            <Textarea label="Hero Subtitle" rows={3} value={cms.hero.subtitle} onChange={(e) => updateHero('subtitle', e.target.value)} />
            <Input label="Hero Image URL" value={cms.hero.imageUrl} onChange={(e) => updateHero('imageUrl', e.target.value)} />
            <Input label="Primary Button Text" value={cms.hero.primaryButtonText} onChange={(e) => updateHero('primaryButtonText', e.target.value)} />
            <Input label="Primary Button Link" value={cms.hero.primaryButtonLink} onChange={(e) => updateHero('primaryButtonLink', e.target.value)} />
            <Input label="Secondary Button Text" value={cms.hero.secondaryButtonText} onChange={(e) => updateHero('secondaryButtonText', e.target.value)} />
            <Input label="Secondary Button Link" value={cms.hero.secondaryButtonLink} onChange={(e) => updateHero('secondaryButtonLink', e.target.value)} />
            <Input label="Gradient Start Color" type="color" value={cms.hero.startColor} onChange={(e) => updateHero('startColor', e.target.value)} />
            <Input label="Gradient End Color" type="color" value={cms.hero.endColor} onChange={(e) => updateHero('endColor', e.target.value)} />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image Upload</label>
              <input type="file" accept="image/*" onChange={handleHeroImageUpload} className="input-field" />
              {cms.hero.imageUrl ? (
                <img src={cms.hero.imageUrl} alt="Hero Preview" className="mt-3 h-40 w-full object-cover rounded-lg border" />
              ) : null}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Promo Tiles</h2>
            <Button variant="outline" onClick={addPromo}>Add Promo</Button>
          </div>
          {(cms.promos || []).length === 0 ? (
            <p className="text-gray-500">No promos added yet.</p>
          ) : (
            <div className="space-y-4">
              {cms.promos.map((promo, index) => (
                <div key={`${promo.title}-${index}`} className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input label="Emoji" value={promo.emoji || ''} onChange={(e) => updatePromo(index, 'emoji', e.target.value)} />
                  <Input label="Title" value={promo.title || ''} onChange={(e) => updatePromo(index, 'title', e.target.value)} />
                  <Input label="Subtitle" value={promo.subtitle || ''} onChange={(e) => updatePromo(index, 'subtitle', e.target.value)} />
                  <div className="flex items-end gap-2">
                    <Input label="Link" value={promo.link || ''} onChange={(e) => updatePromo(index, 'link', e.target.value)} />
                    <Button variant="ghost" className="text-red-600" onClick={() => removePromo(index)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4">Newsletter</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Title" value={cms.newsletter.title} onChange={(e) => updateNewsletter('title', e.target.value)} />
            <Input label="Button Text" value={cms.newsletter.buttonText} onChange={(e) => updateNewsletter('buttonText', e.target.value)} />
            <Textarea label="Subtitle" rows={3} value={cms.newsletter.subtitle} onChange={(e) => updateNewsletter('subtitle', e.target.value)} />
            <Input label="Input Placeholder" value={cms.newsletter.placeholder} onChange={(e) => updateNewsletter('placeholder', e.target.value)} />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4">Section Visibility</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Checkbox label="Hero Section" checked={!!cms.sections.hero} onChange={(e) => updateSections('hero', e.target.checked)} />
            <Checkbox label="Flash Sales" checked={!!cms.sections.flashSales} onChange={(e) => updateSections('flashSales', e.target.checked)} />
            <Checkbox label="Categories" checked={!!cms.sections.categories} onChange={(e) => updateSections('categories', e.target.checked)} />
            <Checkbox label="Featured Products" checked={!!cms.sections.featuredProducts} onChange={(e) => updateSections('featuredProducts', e.target.checked)} />
            <Checkbox label="Recommended Products" checked={!!cms.sections.recommendedProducts} onChange={(e) => updateSections('recommendedProducts', e.target.checked)} />
            <Checkbox label="Recently Viewed" checked={!!cms.sections.recentlyViewed} onChange={(e) => updateSections('recentlyViewed', e.target.checked)} />
            <Checkbox label="Newsletter" checked={!!cms.sections.newsletter} onChange={(e) => updateSections('newsletter', e.target.checked)} />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button variant="primary" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save CMS'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCMS;
