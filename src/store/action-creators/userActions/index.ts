import { Dispatch } from "redux";
import { loginUser, refreshUserToken, fetchStudentByGroupId, addStudentToGroup, auditStudent, registerUser, fetchFilteredUsers, updateUser, deleteUser, changeUserRole, toggleBlockUser } from "../../../services/api-user-service";
import { User, UserActionTypes } from "../../reducers/UserReducer/types";
import { setAccessToken, setRefreshToken, removeTokens, getRefreshToken } from "../../../services/api-instance";
import { jwtDecode } from "jwt-decode";
import { message } from "antd";


export const toggleBlockUserAction = (userId: string, comment?: string, blockUntil?: string) => {
    return async (dispatch: Dispatch<any>) => {
      dispatch({ type: UserActionTypes.START_REQUEST });
  
      try {
        const response = await toggleBlockUser(userId, comment, blockUntil);
        const { success, message: responseMessage } = response as any;
  
        if (success) {
          message.success(responseMessage || "Статус блокування оновлено");
        } else {
          throw new Error(responseMessage || "Не вдалося змінити статус блокування");
        }
  
      } catch (error: any) {
        console.error("Помилка при блокуванні/розблокуванні користувача:", error);
        dispatch({ type: UserActionTypes.SERVER_ERROR, payload: "Block/unblock failed" });
        message.error(error?.message || "Помилка при зміні статусу блокування");
      } finally {
        dispatch({ type: UserActionTypes.FINISH_REQUEST });
      }
    };
  };

export const changeUserRoleAction = (userId: string, newRole: string) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch({ type: UserActionTypes.START_REQUEST });
        try {
            const response = await changeUserRole( userId, newRole);
            const { success, message: responseMessage } = response as any;

            if (success) {
                message.success("Роль користувача оновлено");
            } else {
                throw new Error(responseMessage || "Не вдалося змінити роль");
            }
        } catch (error: any) {
            console.error("Помилка при зміні ролі користувача:", error);
            dispatch({ type: UserActionTypes.SERVER_ERROR, payload: "Change role failed" });
            message.error(error?.message || "Помилка при зміні ролі");
        } finally {
            dispatch({ type: UserActionTypes.FINISH_REQUEST });
        }
    };
};

export const updateUserAction = (updatedUser: { id: string; fullName: string; email: string; }) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch({ type: UserActionTypes.START_REQUEST });

        try {
            const response = await updateUser(updatedUser);
            const { success, message: responseMessage } = response as any;

            if (success) {
                message.success("Користувача успішно оновлено");
            } else {
                throw new Error(responseMessage || "Оновлення не вдалося");
            }
        } catch (error: any) {
            console.error("Помилка при оновленні користувача:", error);
            dispatch({ type: UserActionTypes.SERVER_ERROR, payload: "Update failed" });
            message.error(error?.message || "Помилка при оновленні користувача");
        } finally {
            dispatch({ type: UserActionTypes.FINISH_REQUEST });
        }
    };
};


export const deleteUserAction = (userId: string) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch({ type: UserActionTypes.START_REQUEST });

        try {
            const response = await deleteUser(userId);
            const { success,  message: responseMessage } = response as any;
            if (success) {
                message.success("Користувача успішно видалено");
            } else {
                throw new Error(responseMessage || "Не вдалося видалити користувача");
            }
        } catch (error: any) {
            console.error("Помилка при видаленні користувача:", error);
            dispatch({ type: UserActionTypes.SERVER_ERROR, payload: "Delete failed" });
            message.error(error?.message || "Помилка при видаленні користувача");
        } finally {
            dispatch({ type: UserActionTypes.FINISH_REQUEST });
        }
    };
};

export const fetchFilteredUsersAction = (filter: any) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch({ type: UserActionTypes.START_REQUEST });

        try {
            const response = await fetchFilteredUsers(filter);
            const { payload, success, message, totalCount, pageNumber, pageSize } = response as any;

            if (success) {
                const totalPages = Math.ceil(totalCount / pageSize);
                dispatch({
                    type: UserActionTypes.FETCH_STUDENTS_SUCCESS,
                    payload: {
                        users: payload,
                        currentPage: pageNumber,
                        totalPages,
                        pageSize,
                        totalCount
                    },
                });
            } else {
                throw new Error(message);
            }
        } catch (error: any) {
            console.error("Error fetching filtered users:", error);
            dispatch({ type: UserActionTypes.FETCH_STUDENTS_ERROR, payload: "Error fetching filtered users" });
            message.error(error?.message || "Failed to fetch filtered users");
        }
    };
};

export const registerUserAction = async (email: string, password: string, confirmPassword: string, groupId: number) => {
    try {
        const data = { email, password, confirmPassword, groupId}
        const response = await registerUser(data);
        return response;
    } catch {
        return null;
    }
};

export const auditStudentAction = async (email: string) => {
    try {
        const response = await auditStudent(email);
        return response;
    } catch {
        return null;
    }
};

export const addStudentToGroupAction = (email: string, groupId: number) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch({ type: UserActionTypes.START_REQUEST });

        try {
            const response = await addStudentToGroup(email, groupId);
            console.log("response create:", response);

            const { success, message } = response as any; 

            if (success) {
                dispatch({
                    type: UserActionTypes.ADD_STUDENTGROUP_SUCCESS,
                    message: message,
                });
            
            } else {
                console.error(" Unexpected response format:", response);
                throw new Error(message || "Unknown error");
            }
        } catch (error: any) {
            console.error(" Failed to create StudentToGroup: ", error?.message || error);

            dispatch({ type: UserActionTypes.ADD_STUDENTGROUP_ERROR, payload: "Error creating StudentToGroup" });

            message.error(error?.message || "Failed to create StudentToGroup");
        }
    };
};



export const fetchStudentByGroupIdAction = (groupId: number) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch({ type: UserActionTypes.START_REQUEST });

       try {
                   const response = await fetchStudentByGroupId(groupId);
                   const { payload, success, message } = response as any; 
                   if (success) {
                       dispatch({
                           type: UserActionTypes.FETCH_STUDENTS_SUCCESS,
                           payload: {
                               users: payload, 
                               currentPage: 1,
                               totalPages: 1,
                               pageSize: payload.length,
                               totalCount: payload.length,
                           },
                       });
                   } else {
                       console.error("Error fetching students:", message);
                       throw new Error(message);
                   }
               } catch (error) {
                   console.error("Error fetching students: ", error);
                   dispatch({ type: UserActionTypes.FETCH_STUDENTS_ERROR, payload: "Error fetching students" });
                   message.error("Failed to load students");
               }
    };
};


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

