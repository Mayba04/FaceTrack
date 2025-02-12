import axios from "axios";
import { APP_ENV } from "../env";

const instance = axios.create({
    baseURL: APP_ENV.BASE_URL + "/api",
    // headers: {
    //     "Content-Type": "application/json",
    // },
});

instance.interceptors.request.use(
    (config: any) => {
        const token = getAccessToken();
        if (token) {
            config.headers["Authorization"] = "Bearer " + token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

instance.interceptors.response.use(
    (res) => res,
    async (err) => {
        const originalConfig = err.config;

        if (err.response?.status === 401 && !originalConfig._retry && getAccessToken()) {
            originalConfig._retry = true;
            try {
                const rs = await refreshAccessToken();
                if (!rs) throw new Error("Failed to refresh token");

                const { accessToken, refreshToken } = rs.data;
                setAccessToken(accessToken);
                setRefreshToken(refreshToken);

                originalConfig.headers["Authorization"] = "Bearer " + accessToken;
                return instance(originalConfig);
            } catch (_error) {
                console.error("Failed to refresh token, logging out user.");
                removeTokens();
                window.location.href = "/login";
                return Promise.reject(_error);
            }
        }

        return Promise.reject(err);
    }
);

function refreshAccessToken() {
    return instance.post("/User/refresh-token", {
        token: getAccessToken(),
        refreshToken: getRefreshToken(),
    });
}

export function setAccessToken(token: string) {
    window.localStorage.setItem("accessToken", token);
}

export function setRefreshToken(refreshToken: string) {
    window.localStorage.setItem("refreshToken", refreshToken);
}

export function getAccessToken(): string | null {
    return window.localStorage.getItem("accessToken");
}

export function getRefreshToken(): string | null {
    return window.localStorage.getItem("refreshToken");
}

export function removeTokens() {
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("refreshToken");
}

export function isTokenExpired(token: string): boolean {
    try {
        const decoded: any = JSON.parse(atob(token.split(".")[1]));
        return decoded.exp * 1000 < Date.now();
    } catch (error) {
        console.error("Token decode error:", error);
        return true;
    }
}


export default instance;
