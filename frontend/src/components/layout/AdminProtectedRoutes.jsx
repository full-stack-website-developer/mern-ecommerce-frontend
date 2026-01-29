import { Navigate, Outlet } from 'react-router-dom';
import useUserContext from "../../hooks/useUserContext";

const AdminProtectedRoutes = () => {
    const { user } = useUserContext();
    
    if (user?.role !== 'Admin') {
        return <Navigate to={'/login'} replace/>
    }
    
    return <Outlet />
};

export default AdminProtectedRoutes;