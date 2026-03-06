import { Navigate, Outlet } from "react-router-dom";
import useUserContext from "../../hooks/useUserContext";
import FullPageLoader from "../common/FullPageLoader";

const SellerProtectedRoutes = () => {
    const { user, loading } = useUserContext();
    
    if (loading) {
        return <FullPageLoader />
    }

    if (!user) {
        return <Navigate to="/login" replace/>
    }

    if (!user?.isSeller) {
        return <Navigate to="/seller/login" replace/>
    }

    if (user?.seller?.status === 'pending') {
        return <Navigate to="/seller/pending-approval" replace/>
    }

    if (user?.seller?.status === 'rejected') {
        return <Navigate to="/seller/login" replace/>
    }

    return (
        <Outlet />
    )
};

export default SellerProtectedRoutes;
