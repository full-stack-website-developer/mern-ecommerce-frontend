import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import BrandForm from '../../features/brand/components/BrandForm';
import { useEffect, useState } from 'react';
import brandService from '../../services/brand.service';
import FullPageLoader from '../../components/common/FullPageLoader';

const AdminEditBrand = () => {
  const { id } = useParams('id');
  const [ brand, setBrand ] = useState({});
  const [ loading, setLoading ] = useState(true);

  useEffect(() => {
    setLoading(true);
    const getBrand = async() => {
      try {
        const res = await brandService.getById(id);
        if (res.success) {
          setBrand(res.data);
        }
      } catch(error) {
        console.error(`Error While Fetching Brand of id ${id}: ${error}`);
      } finally {
        setLoading(false)
      }
    }
    getBrand();
  }, []);

  if (loading) {
    return <FullPageLoader />
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Brand</h1>
        </div>

        <BrandForm brand={brand} id={id}/>
      </div>
    </AdminLayout>
  );
};

export default AdminEditBrand;
