import { Dispatch } from "redux";
import { loginUser, refreshUserToken } from "../../../services/api-user-service";
import { User, UserActionTypes } from "../../reducers/UserReducer/types";
import { setAccessToken, setRefreshToken, removeTokens, getRefreshToken } from "../../../services/api-instance";
import { jwtDecode } from "jwt-decode";
import { message } from "antd";
export const loginUserAction = (userData: any, navigate: (path: string) => void) => {
    return async (dispatch: Dispatch<any>): Promise<void> => {
        try {
            dispatch({ type: UserActionTypes.START_REQUEST });

            const response: any = await loginUser(userData);

            if (!response.success) {
                dispatch({ type: UserActionTypes.LOGIN_USER_ERROR, payload: response.message || "Login failed" });
                message.error(response.message || "Login failed");
            } else {
                const { accessToken, refreshToken } = response; 

                console.log("Received AccessToken:", accessToken);
                console.log("Received RefreshToken:", refreshToken);

                if (accessToken) {
                    const authSuccess = await authUser(accessToken, dispatch);
                    if (authSuccess) {
                        setAccessToken(accessToken);
                        setRefreshToken(refreshToken);
                        navigate("/"); 
                    }
                    
                } else {
                    console.error("Login failed: No accessToken received");
                    dispatch({ type: UserActionTypes.LOGIN_USER_ERROR, payload: "No accessToken received" });
                    message.error("Login failed: No accessToken received");
                }
            }
        } catch (error) {
            console.error("Login request failed:", error);
            dispatch({ type: UserActionTypes.SERVER_ERROR, payload: "Login failed" });
            message.error("Login failed: " + error);
        }
    };
};

export const refreshTokenAction = () => { 
    return async (dispatch: Dispatch) => {
        try {
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                console.warn("No refresh token found, logging out.");
                removeTokens();
                dispatch({ type: UserActionTypes.LOGOUT_USER });
                return;
            }

            const response = await refreshUserToken(refreshToken) as any;

            if (!response || !response.data || !response.data.accessToken) {
                console.warn("Invalid refresh response, logging out.");
                dispatch({ type: UserActionTypes.REFRESH_TOKEN_ERROR });
                removeTokens();
                return;
            }

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            const decodedToken: any = jwtDecode(accessToken);

            setAccessToken(accessToken);
            setRefreshToken(newRefreshToken);

            dispatch({
                type: UserActionTypes.REFRESH_TOKEN_SUCCESS,
                payload: { user: decodedToken, token: accessToken, refreshToken: newRefreshToken }
            });

            console.log("Token refreshed successfully!");
        } catch (error) {
            console.error("Error refreshing token, logging out.", error);
            dispatch({ type: UserActionTypes.REFRESH_TOKEN_ERROR });
            removeTokens();
        }
    };
};

const authUser = async (token: string, dispatch: Dispatch<any>): Promise<boolean> => {
    try {
        const decodedToken: any = jwtDecode(token);

        console.log("Decoded Token:", decodedToken); // Перевірка структури
        if (decodedToken.EmailConfirm == "False") {
            const errorMessage = "Your email is not confirmed. Please confirm your email before logging in.";
            dispatch({ type: UserActionTypes.LOGIN_USER_ERROR, payload: errorMessage });
            message.error(errorMessage);
            return false;
        }

        console.log("decodedToken.lockoutEnabled :", decodedToken.LockoutEnabled); 
        if (decodedToken.LockoutEnabled == "True") {
            const errorMessage = "Your account is locked. Please contact support.";
            dispatch({ type: UserActionTypes.LOGIN_USER_ERROR, payload: errorMessage });
            message.error(errorMessage);
            return false;
        }
        // Перетворення decodedToken на формат, який відповідає інтерфейсу User
        const user: User = {
            id: decodedToken.Id,
            fullName: decodedToken.FullName,
            email: decodedToken.Email,
            emailConfirmed: decodedToken.EmailConfirm,
            lockoutEnd: null, 
            lockoutEnabled: decodedToken.LockoutEnabled, 
            role: decodedToken.role
        };
        

        dispatch({
            type: UserActionTypes.LOGIN_USER_SUCCESS,
            payload: {
                user: user,
                token: token,
                refreshToken: getRefreshToken()
            }
        });

        // Збереження у LocalStorage
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user.role);
        console.log("Saved role in LocalStorage:", user.role);
        message.success("Login successful!");
        return true;
    } catch (error) {
        console.error("Error logging in user:", error);
        dispatch({
            type: UserActionTypes.SERVER_ERROR,
            payload: "Login failed",
        });
        message.error("Login failed");
        return false;
    }
};


export const logout = () => {
    return async (dispatch: Dispatch) => {
        removeTokens(); 
        localStorage.removeItem("user"); 
        localStorage.removeItem("role"); 
        localStorage.removeItem("state"); 

        dispatch({ type: UserActionTypes.LOGOUT_USER });

        message.success("Logged out successfully!");
    };
};

