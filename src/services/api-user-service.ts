import instance from "./api-instance";

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
};

export async function fetchStudentByGroupId(groupId: number) {
    try {
        return await User.getStudentByGroupId(groupId);
    } catch (error) {
        console.error("Error fetching group details:", error);
        return { success: false, message: "Failed to fetch group details", error };
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
