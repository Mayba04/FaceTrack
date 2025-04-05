import instance, { getAccessToken } from "./api-instance";

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
    registerUser: (data: { email: string; password: string; confirmPassword: string, groupId: number }) => requests.post("/user/registerStudent", data),
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
};

export async function registerUserWithRole(email: string, password: string, confirmPassword: string, role: string) {
    try {
      const response = await requests.post("/user/register-by-role", {
        email,
        password,
        confirmPassword,
        role,
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

export async function registerUser (data: { email: string; password: string; confirmPassword: string, groupId: number}) {
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
        const response = await User.addStudentToGroup(email,groupId );
        return response;
    } catch (error) {
        console.error("Error addStudentToGroup:", error);
        return { success: false, message: "Failed to addStudentToGroup", error };
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
