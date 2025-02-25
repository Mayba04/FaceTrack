import instance from "./api-instance";

const responseBody: any = (response: any) => response.data;

const requests = {
    get: (url: string, params?: any) => instance.get(url, { params }).then(responseBody),
    post: (url: string, body?: any) => instance.post(url, body).then(responseBody),
    put: (url: string, body?: any) => instance.put(url, body).then(responseBody),
    delete: (url: string) => instance.delete(url).then(responseBody),
};

const Session = {
    getGroupSessions: (groupId: string) => requests.get(`/session/group/${groupId}`),
    createSession: (sessionData: { groupId: number; startTime: string; endTime: string; createdBy: string; userId: string }) =>
        requests.post("/session/create", sessionData),
    updateSession: (sessionData: { id: string,  groupId: number; startTime: string; endTime: string; createdBy: string; userId: string }) =>
        requests.put(`/session/update`, sessionData),
    deleteSession: (sessionId: string) => requests.delete(`/session/delete/${sessionId}`),
};

export async function fetchGroupSessions(groupId: string) {
    try {
        return await Session.getGroupSessions(groupId);
    } catch (error) {
        console.error("Error fetching sessions:", error);
        return { success: false, message: "Failed to fetch sessions", error };
    }
}

export async function createSession(sessionData: { groupId: number; startTime: string; endTime: string; createdBy: string; userId: string }) {
    try {
        return await Session.createSession(sessionData);
    } catch (error) {
        console.error("Error creating session:", error);
        return { success: false, message: "Failed to create session", error };
    }
}


export async function updateSession(sessionData: { id: string,  groupId: number; startTime: string; endTime: string; createdBy: string; userId: string }) {
    try {
        return await Session.updateSession(sessionData);
    } catch (error) {
        console.error("Error updating session:", error);
        return { success: false, message: "Failed to update session", error };
    }
}

export async function deleteSession(sessionId: string) {
    try {
        return await Session.deleteSession(sessionId);
    } catch (error) {
        console.error("Error deleting session:", error);
        return { success: false, message: "Failed to delete session", error };
    }
}

export default Session;
