import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import OptionForm from '../../features/option/components/OptionForm';
import { useEffect, useState } from 'react';
import optionService from '../../services/option.service';
import FullPageLoader from '../../components/common/FullPageLoader';

const AdminAddOption = () => {
  const { id } = useParams();
  const [ option, setOption ] = useState({});
  const [ loading, setLoading ] = useState(true);

  useEffect(() => {
    setLoading(true);
    const getOption = async() => {
      try {
        const res = await optionService.getById(id);
        if (res.success) {
          setOption(res.data);
        }
      } catch(error) {
        console.error(`Error While Fetching Option of id ${id}: ${error}`);
      } finally {
        setLoading(false)
      }
    }
    getOption();
  }, []);

  if (loading) {
    return <FullPageLoader />
  }

  return (
    <AdminLayout>
      <OptionForm option={option} id={id}/>
    </AdminLayout>
  );
};

export default AdminAddOption;