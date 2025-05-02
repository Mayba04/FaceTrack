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
    getSessionsById: (Id: number) => requests.get(`/session/group/${Id}`),
    startSession: (sessionId: number, userId: string) =>
        requests.post(`/session/start/${sessionId}?userId=${userId}`),
    getTodaysSessions: (studentId: string) => requests.get(`/session/todaysessions/${studentId}`),
    
    getPendingBySession: (sessionId: number) =>
        instance.get(`/sessionfacevector/pending/${sessionId}`).then(responseBody),

    reject: (id: number) =>requests.delete(`/sessionfacevector/delete/${id}`),

    approve: (id: number) => requests.post(`/sessionfacevector/approve/${id}`),

    checkManualCheckPending: (sessionId: number, studentId: string) =>
        requests.get(`/sessionfacevector/manual-check-pending/${sessionId}/${studentId}`),

    getSessionsByStudentId: (studentId: string) => requests.get(`/session/studentid/${studentId}`),

    getSessionsByTeacherId: (teacherId: string) => requests.get(`/session/todaysessionsbyteacher/${teacherId}`),

    getSessionById: (sesionId: number) => requests.get(`/session/getsession/${sesionId}`),
};

export async function getSessionById(sessionId: number) {
    try {
      return await Session.getSessionById(sessionId);
    } catch (error) {
      console.error("Error fetching session by ID:", error);
      return { success: false, message: "Failed to fetch session", error };
    }
  }
  

export async function getSessionsByTeacherId(teacherId: string) {
    try {
        return await Session.getSessionsByTeacherId(teacherId);
    } catch (error) {
        console.error("Error fetching today's sessions:", error);
        return { success: false, message: "Failed to fetch today's sessions", error };
    }
}

export async function getSessionsByStudentId(studentId: string) {
    try {
      return await Session.getSessionsByStudentId(studentId);
    } catch (error) {
      console.error("Error getSessionsByStudentId:", error);
      return { success: false, payload: false, message: "Eror" };
    }
  }

export async function checkManualCheckPending(sessionId: number, studentId: string) {
    try {
      return await Session.checkManualCheckPending(sessionId, studentId);
    } catch (error) {
      console.error("Error checking pending manual check:", error);
      return { success: false, payload: false, message: "Помилка перевірки ручної заявки" };
    }
  }
export async function approveFaceRequest(id: number) {
    try {
      return await Session.approve(id);
    } catch (err) {
      console.error("Error approving face request:", err);
      return { success: false, payload: [] };
    }
}

export async function rejectFaceRequest(id: number) {
    try {
      return await Session.reject(id);
    } catch (err) {
      console.error("Error rejecting face request:", err);
      return { success: false, payload: [] };
    }
  }

export async function getPendingFaceRequests(sessionId: number) {
    try {
      return await Session.getPendingBySession(sessionId);
    } catch (error) {
      console.error("Error fetching pending face requests:", error);
      return { success: false, payload: [] };
    }
}

export async function getTodaysSessions(studentId: string) {
    try {
        return await Session.getTodaysSessions(studentId);
    } catch (error) {
        console.error("Error fetching today's sessions:", error);
        return { success: false, message: "Failed to fetch today's sessions", error };
    }
}

export async function startSession(sessionId: number, userId: string) {
    try {
        return await Session.startSession(sessionId, userId);
    } catch (error) {
        console.error("Error start sessions:", error);
        return { success: false, message: "Failed to start sessions", error };
    }
}

export async function fetchSessionById(Id: number) {
    try {
        return await Session.getSessionsById(Id);
    } catch (error) {
        console.error("Error fetching session:", error);
        return { success: false, message: "Failed to fetch session", error };
    }
}

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
