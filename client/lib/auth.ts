// client/lib/auth.ts
export const getUserFromToken = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return { role: payload.role, userId: payload.userId };
    } catch {
        return null;
    }
};

export const isAuthenticated = () => {
    return !!getUserFromToken();
};

export const getUserRole = () => {
    return getUserFromToken()?.role || null;
};


