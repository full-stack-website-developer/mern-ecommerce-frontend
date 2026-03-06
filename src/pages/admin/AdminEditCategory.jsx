import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import CategoryForm from '../../features/category/components/CategoryForm';
import { useEffect, useState } from 'react';
import categoryService from '../../services/category.service';
import FullPageLoader from '../../components/common/FullPageLoader';

const AdminEditCategory = () => {
  const { id } = useParams();
  const [ category, setCategory ] = useState({});
  const [ loading, setLoading ] = useState(false);

  useEffect(() => {
    setLoading(true);
    const getCategory = async() => {
      try {
        const res = await categoryService.getById(id);
        if (res.success) {
          setCategory(res.data);
        }
      } catch(error) {
        console.error(`Error While Fetching category of id ${id}: ${error}`);
      } finally {
        setLoading(false)
      }
    }
    getCategory();
  }, []);

  if (loading) {
    return <FullPageLoader />
  }
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Add Category</h1>
          <p className="mt-1 text-sm text-gray-600">
            Category: name, slug, parentId, logo, status. Dummy UI only.
          </p>
        </div>

        <CategoryForm category={category} id={id}/>
      </div>
    </AdminLayout>
  );
};

export default AdminEditCategory;
