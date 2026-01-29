import FullPageLoader from '../common/FullPageLoader';
import { Navigate, Outlet } from "react-router-dom";
import useUserContext from "../../hooks/useUserContext";

const ProtectedRoute = () => {
    const { user, loading } = useUserContext();
   
    if (loading) {
        return <FullPageLoader />
    }

    if (!user) {
        return <Navigate to={'/login'} replace/>
    }
    
    return <Outlet />
};

export default ProtectedRoute;