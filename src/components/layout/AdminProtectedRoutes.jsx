import { Navigate, Outlet } from 'react-router-dom';
import useUserContext from "../../hooks/useUserContext";
import FullPageLoader from '../common/FullPageLoader';

const AdminProtectedRoutes = () => {
    const { user, loading } = useUserContext();

    if (loading) {
        return <FullPageLoader />
    }

    if (user?.role !== 'admin') {
        return <Navigate to={'/admin/login'} replace/>
    }
    
    return <Outlet />
};

export default AdminProtectedRoutes;