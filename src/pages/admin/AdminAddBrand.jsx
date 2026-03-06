import AdminLayout from '../../components/layout/AdminLayout';
import BrandForm from '../../features/brand/components/BrandForm';

const AdminAddBrand = () => {

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Add Brand</h1>
          <p className="mt-1 text-sm text-gray-600">
            Brand: name, logo, status. Dummy UI only.
          </p>
        </div>

        <BrandForm />
      </div>
    </AdminLayout>
  );
};

export default AdminAddBrand;
