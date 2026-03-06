import AdminLayout from '../../components/layout/AdminLayout';
import CategoryForm from '../../features/category/components/CategoryForm';

const AdminAddCategory = () => {
  

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Add Category</h1>
          <p className="mt-1 text-sm text-gray-600">
            Category: name, slug, parentId, logo, status. Dummy UI only.
          </p>
        </div>

        <CategoryForm />
      </div>
    </AdminLayout>
  );
};

export default AdminAddCategory;
