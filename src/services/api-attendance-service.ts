import instance from "./api-instance";
import type { AxiosError } from "axios";

const responseBody: any = (response: any) => response.data;

const requests = {
    get: (url: string, params?: any) => instance.get(url, { params }).then(responseBody),
    post: (url: string, body?: any, config?: any) => instance.post(url, body, config).then(responseBody),
    put: (url: string, body?: any) => instance.put(url, body).then(responseBody),
    delete: (url: string) => instance.delete(url).then(responseBody),
};

const Attendance = {
    //getAttendanceBySession: (Id: number) => requests.get(`/attendance/session/${Id}`),
    markStudentsPresent: (attendanceData: any) => requests.post("/attendance/create", attendanceData),
    getMatrixBySessionId: (sessionId: number) => requests.get(`/attendance/matrix/session/${sessionId}`),
    markAbsent: (attendanceData: any) => requests.post("/attendance/mark-absent", attendanceData),
    deleteAttendanceById: (id: number) => requests.delete(`/attendance/delete/${id}`),
    getTodayAttendance: (sessionId: number, studentId: string) =>
      requests.get(`/attendance/today/${sessionId}/${studentId}`),
    markAttendance: (formData: FormData) =>
      instance.post("/AttendanceMark/mark-attendance", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      }).then(responseBody),
    getStudentSessionStats: (studentId: string, sessionId: number) =>
      requests.get(`/attendance/stats/session/${sessionId}/student/${studentId}`),
    getAbsencesByStudentAndSessionId: (studentId: string, sessionId: number) =>
      requests.get(`/attendance/by-session/${sessionId}/student/${studentId}`),
    getTotalAttendanceStats: (studentId: string) => requests.get(`/attendance/total-stats/${studentId}`),    
    getTeacherStats: (teacherId: string) => requests.get(`/attendance/stats/${teacherId}`),
    getSystemStats: () => requests.get("/attendance/system-statistics"),
    getTopBottomSessions: () => requests.get("/attendance/top-bottom-sessions"),
    updateDateSessionHistory: (data: { sessionHistoryId: number; newDate: string }) =>requests.put("/attendance/update-date", data),

    deleteSessionHistory: (id: number) =>requests.delete(`/attendance/${id}`),
};

export async function updateSessionHistoryDate(sessionHistoryId: number, newDate: string) {
  try {
    return await Attendance.updateDateSessionHistory({ sessionHistoryId, newDate });
  } catch (error: unknown) {
    const err = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: err.response?.data?.message || "Не вдалося оновити дату сесії",
    };
  }
}


export async function deleteSessionHistory(id: number) {
  try {
    return await Attendance.deleteSessionHistory(id);
  } catch (error: unknown) {
    const err = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: err.response?.data?.message || "Не вдалося видалити сесію",
    };
  }
}

export async function fetchTopBottomSessions() {
  try {
    const response = await Attendance.getTopBottomSessions();
    return response;
  } catch (error: unknown) {
    const err = error as AxiosError<{ message?: string }>;
    const msg = err.response?.data?.message || "Не вдалося отримати топ сесії";
    return { success: false, message: msg };
  }
}


export async function fetchSystemStatistics() {
  try {
    const response = await Attendance.getSystemStats();
    return response;
  } catch (error: unknown) {
    const err = error as AxiosError<{ message?: string }>;
    const msg = err.response?.data?.message || "Не вдалося отримати статистику системи";
    return { success: false, message: msg };
  }
}

export async function fetchTeacherStatsAction(teacherId: string) {
  try {
    const response = await Attendance.getTeacherStats(teacherId);
    return response;
  } catch (error: unknown) {
    const err = error as AxiosError<{ message?: string }>;
    const msg = err.response?.data?.message || "Failed to fetch stats";
    return { success: false, message: msg };
  }
}
export const getTotalAttendanceStats = async (studentId: string) => {
  try {
    const response = await Attendance.getTotalAttendanceStats(studentId);
    return response;
  } catch (error: unknown) {
    const err = error as AxiosError<{ message?: string }>;
    const msg = err.response?.data?.message || "Failed to fetch stats";
    return { success: false, message: msg };
  }
};

export async function getAbsencesByStudentAndSessionId(studentId: string, sessionId: number) {
  try {
    const response = await Attendance.getAbsencesByStudentAndSessionId(studentId, sessionId);
    return response;
  } catch (error: unknown) {
    const err = error as AxiosError<{ message?: string }>;
    const msg = err.response?.data?.message || "Failed to fetch stats";
    return { success: false, message: msg };
  }
}


export async function getStudentSessionStats(studentId: string, sessionId: number) {
  try {
    const response = await Attendance.getStudentSessionStats(studentId, sessionId);
    return response;
  } catch (error: unknown) {
    const err = error as AxiosError<{ message?: string }>;
    const msg = err.response?.data?.message || "Failed to fetch stats";
    return { success: false, message: msg };
  }
}

export async function markAttendance(formData: FormData) {
  try {
    const response = await Attendance.markAttendance(formData);
    return response;
  } catch (error: unknown) {
    const err = error as AxiosError<{ message?: string }>;
    const msg = err.response?.data?.message || "Failed to mark attendance";
    return { success: false, message: msg };
  }
}


export async function getTodayAttendance(sessionId: number, studentId: string) {
  try {
    const response = await Attendance.getTodayAttendance(sessionId, studentId);
    return response;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const msg = axiosError.response?.data?.message || "Не вдалося отримати відмітку на сьогодні";
    return { success: false, message: msg };
  }
}

export async function markStudentAbsent(data: any) {
  try {
    return await Attendance.markAbsent(data);
  } catch (error) {
    console.error("Error marking student absent:", error);
    return { success: false };
  }
}

export async function deleteAttendance(id: number) {
  try {
    return await Attendance.deleteAttendanceById(id);
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return { success: false };
  }
}

export async function getAttendanceMatrixBySessionId(sessionId: number) {
  try {
    return await Attendance.getMatrixBySessionId(sessionId);
  } catch (error) {
    console.error("Error fetching attendance matrix by session:", error);
    return { success: false, message: "Failed to fetch session matrix", error };
  }
}

// export async function getAttendanceBySession(sessionId: number) {
//     try {
//       const response = await Attendance.getAttendanceBySession(sessionId);
//       return response;
//     } catch (error) {
//       console.error("Error fetching attendance:", error);
//       return { success: false, message: "Failed to fetch attendance" };
//     }
//   }
  
  export async function markStudentsPresent(attendanceData: any) {
    try {
        return await Attendance.markStudentsPresent(attendanceData);
    } catch (error) {
        console.error("Error marking students present:", error);
        return { success: false, message: "Failed to mark students present", error };
    }
}