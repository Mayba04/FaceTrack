import instance, { getAccessToken } from "./api-instance";
import type { AxiosError } from "axios";

const responseBody: any = (response: any) => response.data;

const requests = {
    get: (url: string, params?: any) => instance.get(url, { params }).then(responseBody),
    post: (url: string, body?: any) => instance.post(url, body).then(responseBody),
    put: (url: string, body?: any) => instance.put(url, body).then(responseBody),
    delete: (url: string) => instance.delete(url).then(responseBody),
};

const User = {
    login: (userData: any) => requests.post("/auth/login", userData),
    refreshToken: (refreshToken: string) => requests.post("/RefreshToken", { refreshToken }),
    getStudentByGroupId: (groupId: number) => requests.get(`user/group/${groupId}`),
    addStudentToGroup: (email: string, groupId: number) => requests.post("/user/addStudent", { email,groupId }),
    auditStudent: (email: string) => requests.get("/user/auditStudent", { email }),
    registerUser: (data: { email: string; password: string; confirmPassword: string, groupId: number, fullName: string }) => requests.post("/user/registerStudent", data),
    filterUsers: (filter: any) => requests.post("/user/filter", filter),
    updateUser: (updatedUser: { id: string; fullName: string; email: string; }) => requests.put("/User/update", updatedUser),
    deleteUser: (id: string) =>  requests.delete(`/User/delete/${id}`),
    changeUserRole: (userId: string, newRole: string) => requests.post('/User/changerole', { userId, newRole }),
    toggleBlockUser: (userId: string, comment?: string, blockUntil?: string) => requests.post("/User/toggle-block", {
        userId,
        comment: comment || "",
        blockUntil: blockUntil || null,
      }),
    addUser: (email: string, role: string) => requests.post("/user/add", { email, role }),
    registerUserWithRole: (email: string, password: string, confirmPassword: string, role: string) => requests.post("/user/register-by-role", {
        email,
        password,
        confirmPassword,
        role,
      }),

    getLecturers: (fullName: string, pageNumber = 1, pageSize = 10) =>
        requests.get("/user/lecturers", { fullName, pageNumber, pageSize }),
    getUserStatistics: () => requests.get("/user/user-statistics"),
    updateUserAgreedToImageProcessing: (payload: { id: string; agreedToImageProcessing: boolean;}) => requests.post("/user/agree-processing", payload),
    getUserById: (id: string) => requests.get(`/user/get-by-id/${id}`),
    sendResetPasswordEmail: (email: string) => requests.post(`/user/forgot-password/${encodeURIComponent(email)}`),

    resetPassword: (data: {
      email: string;
      token: string;
      newPassword: string;
      confirmPassword: string;
    }) => requests.post("/user/reset-password", data),
    validateResetToken: (email: string, token: string) => requests.get(`/user/validate-reset-token?email=${email}&token=${encodeURIComponent(token)}`),
    getUserDetails: (id: string) => requests.get(`/user/${id}/details`),
    getUserDetail: (id: string) => requests.get(`/user/${id}/userdetail`),
    setMainPhoto: (data: FormData) =>requests.post(`/user/main-photo`, data),
    changePassword: (data: any) => requests.post("/user/changepassword", data),
    getFilteredStudents: (data: any) => requests.post("/user/filter-students", data),

};

export const fetchFilteredStudents = async (filter: any) => {
  try {
    const response = await User.getFilteredStudents(filter);
    return response;
  } catch (error: any) {
    console.error("Помилка при фільтрації студентів:", error);
    return {
      success: false,
      message: "Не вдалося завантажити студентів",
    };
  }
};


export const changeUserPassword = async (data: any) => {
  try {
    const response = await User.changePassword(data);
    return response;
  } catch (error: any) {
    console.error("Помилка при зміні пароля:", error);
    return {
      success: false,
      message: "Не вдалося змінити пароль",
    };
  }
};

export const setMainPhoto = async (userId: string, file: File) => {
  const formData = new FormData();
  formData.append("UserId", userId);
  formData.append("Photo", file);

  try {
    const response = await User.setMainPhoto(formData);
    return response;
  } catch (error: any) {
    console.error("Помилка при зміні фото:", error);
    return {
      success: false,
      message: "Не вдалося змінити фото",
    };
  }
};


export const fetchUserDetail = async (id: string) => {
  try {
    const response = await User.getUserDetail(id);
    return response;
  } catch (error: any) {
    console.error("Помилка при отриманні деталей користувача:", error);
    return {
      success: false,
      message: "Не вдалося завантажити інформацію про користувача",
    };
  }
};

export const fetchUserDetails = async (id: string) => {
  try {
    const response = await User.getUserDetails(id);
    return response;
  } catch (error: any) {
    console.error("Помилка при отриманні деталей користувача:", error);
    return {
      success: false,
      message: "Не вдалося завантажити інформацію про користувача",
    };
  }
};


export const validateResetToken = async (email: string, token: string) => {
  try {
    const response = await User.validateResetToken(email, token);
    return response;
  } catch (error: any) {
    console.error("Помилка при перевірці токена скидання паролю:", error);
    return {
      success: false,
      message: "Посилання на зміну пароля недійсне або прострочене",
    };
  }
};


export const sendResetPasswordEmail = async (email: string) => {
  try {
    const response = await User.sendResetPasswordEmail(email);
    return response;
  } catch (error: any) {
    console.error("Помилка при надсиланні листа на скидання пароля:", error);
    return {
      success: false,
      message: "Не вдалося надіслати листа на скидання пароля",
    };
  }
};

export const resetPassword = async (data: {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  try {
    const response = await User.resetPassword(data);
    return response;
  } catch (error: any) {
    console.error("Помилка при зміні пароля:", error);
    return {
      success: false,
      message: "Не вдалося змінити пароль",
    };
  }
};

export const getUserById = async (id: string) => {
  try {
    const res = await User.getUserById(id)
    return res;
  } catch (error: any) {
    console.error("Помилка при отриманні користувача:", error);
    return {
      success: false,
      message: "Не вдалося отримати користувача",
    };
  }
};


export async function updateUserConsent(payload: {
  id: string;
  agreedToImageProcessing: boolean;
}) {
  try {
    const response = await User.updateUserAgreedToImageProcessing(payload);
    return response;
  } catch (error: any) {
    console.error("Error updating consent:", error);
    return {
      success: false,
      message: "Не вдалося оновити згоду користувача",
      error: error?.message || "Невідома помилка",
    };
  }
}


export async function fetchUserStatistics() {
    try {
      const response = await User.getUserStatistics();
      return response;
    } catch (error: any) {
      console.error("Error fetchUserStatistics:", error);
      return {
        success: false,
        message: "Не вдалося отримати статистику користувачів",
        error,
      };
    }
  }  

export async function fetchLecturers(fullName: string, pageNumber = 1, pageSize = 10) {
    try {
      const response = await User.getLecturers(fullName, pageNumber, pageSize);
      return response;
    } catch (error) {
      console.error("Error fetchLecturers:", error);
      return { success: false, message: "Failed to fetch lecturers", error };
    }
  }
  

export async function registerUserWithRole(email: string, password: string, confirmPassword: string, role: string, fullName: string) {
    try {
      const response = await requests.post("/user/register-by-role", {
        email,
        password,
        confirmPassword,
        role,
        fullName
      });
      return response;
    } catch (error: any) {
      console.error("Error registerUserWithRole:", error);
      throw error;
    }
  }  

export async function addUserService(email: string, role: string) {
    try {
      const response = await User.addUser(email, role);
      return response;
    } catch (error: any) {
      console.error("Error addUser:", error);
  
      const message =
        error?.response?.data?.message || error.message || "Failed to add user";
  
      return { success: false, message, error };
    }
  }
  

export async function toggleBlockUser(userId: string, comment?: string, blockUntil?: string) {
    try {
        const response = await User.toggleBlockUser(userId,comment,blockUntil);
        return response;
    } catch (error) {
        console.error("Error toggleBlockUser:", error);
        return { success: false, message: "Failed to toggleBlockUser", error };
    }
}

export async function changeUserRole(userId: string, newRole: string) {
    try {
        const response = await User.changeUserRole(userId,newRole);
        return response;
    } catch (error) {
        console.error("Error changeUserRole:", error);
        return { success: false, message: "Failed to changeUserRole", error };
    }
}

export async function deleteUser(userId: string) {
    try {
        const response = await User.deleteUser(userId);
        return response;
    } catch (error) {
        console.error("Error deleteUser:", error);
        return { success: false, message: "Failed to delete user", error };
    }
}

export async function updateUser(updatedUser: { id: string; fullName: string; email: string; }) {
    try {
        const token = getAccessToken();
        console.log("Токен перед запитом:", token);

        const response = await User.updateUser(updatedUser);
        return response;
    } catch (error) {
        console.error("Error updateUser:", error);
        return { success: false, message: "Failed to update user", error };
    }
}

export async function fetchFilteredUsers(filter: any) {
    try {
        const response = await User.filterUsers(filter);
        return response;
    } catch (error) {
        console.error("Error fetchFilteredUsers:", error);
        return { success: false, message: "Failed to fetch users", error };
    }
}

export async function registerUser (data: { email: string; password: string; confirmPassword: string, groupId: number, fullName: string}) {
    try {
        const response = await User.registerUser(data);
        return response;
    } catch (error) {
        console.error("Error registerUser:", error);
        return { success: false, message: "Failed to registerUser", error };
    }
}

export async function auditStudent(email: string) {
    try {
        const response = await User.auditStudent(email);
        console.log(response)
        return response;
    } catch (error) {
        console.error("Error auditStudent:", error);
        return { success: false, message: "Failed to auditStudent", error };
    }
}



export async function addStudentToGroup(email: string, groupId: number) {
    try {
        const response = await User.addStudentToGroup(email, groupId);
        const data = response?.data ?? response;
        return data;    
    } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>;
        const msg = err.response?.data?.message || "Failed to addStudentToGroup";
        return { success: false, message: msg };
    }
}



export async function fetchStudentByGroupId(groupId: number) {
    try {
        return await User.getStudentByGroupId(groupId);
    } catch (error) {
        console.error("Error fetchStudentByGroupId:", error);
        return { success: false, message: "Failed fetchStudentByGroupId", error };
    }
}

export async function loginUser(userData: any) {
    try {
        const response = await User.login(userData);
        console.log(response)
        return response;
    } catch (error) {
        console.error("Error during loginUser:", error);
        return { success: false, message: "Failed to login", error };
    }
}

export async function refreshUserToken(refreshToken: string) {
    try {
        const response = await User.refreshToken(refreshToken);
        return response;
    } catch (error) {
        console.error("Error during refreshUserToken:", error);
        return { success: false, message: "Failed to refresh token", error };
    }
}

export default User;
