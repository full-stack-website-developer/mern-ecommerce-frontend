import { useContext } from "react";
import { UserContext } from "../store/userContext";

const useUserContext = () => {
    const user = useContext(UserContext);
    return user;
};

export default useUserContext;