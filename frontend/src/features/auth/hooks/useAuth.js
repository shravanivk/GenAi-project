
import { useContext } from "react";
import { AuthContext } from "../auth.Context";
import { login, register, logout, getMe } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext);

    const { user, setUser, loading, setLoading } = context;

    const handleLogin = async ({ email, password }) => {
        setLoading(true);

        const data = await login({ email, password });

        setUser(data.user);
        setLoading(false);
    };

    const handleRegister = async ({ email, username, password }) => {
        setLoading(true);

        const data = await register({ email, username, password });

        setUser(data.user);
        setLoading(false);
    };

    const handleLogout = async () => {
        setLoading(true);

        const data = await logout();

        setUser(null);
        setLoading(false);
    };

    return {
        user,
        loading,
        handleRegister,
        handleLogin,
        handleLogout
    };
};
