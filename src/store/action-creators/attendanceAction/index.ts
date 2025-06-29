import { Dispatch } from "redux";
import { deleteAttendance, getAttendanceMatrixBySessionId, getTodayAttendance, markAttendance, markStudentAbsent } from "../../../services/api-attendance-service";
import {
  AttendanceActionTypes,
  AttendanceActions,
} from "../../reducers/AttendanceReducer/types";

export const addAbsenceAction = (studentId: string, sessionHistoryId: number, timestamp: string) => {
  return async (dispatch: Dispatch<AttendanceActions>) => {
    try {
      const response = await markStudentAbsent({ studentId, sessionHistoryId, timestamp });
      const { payload, success } = response as any;

      if (success && payload) {
        dispatch({
          type: AttendanceActionTypes.ADD_ABSENCE,
          payload: {
            sessionHistoryId: payload.sessionId,
            studentId: payload.studentId,
            id: payload.id, 
          },
        });
      }
    } catch (error) {
      console.error("Не вдалося додати відсутність", error);
    }
  };
};


export const deleteAbsenceAction = (attendanceId: number) => {
  return async (dispatch: Dispatch<AttendanceActions>) => {
    try {
      const response = await deleteAttendance(attendanceId);
      const { success } = response as any;
      if (success) {
        dispatch({
          type: AttendanceActionTypes.DELETE_ABSENCE,
          payload: attendanceId,
        });
      }
    } catch (error) {
      console.error("Не вдалося видалити відмітку", error);
    }
  };
};

export const fetchAttendanceMatrixBySessionAction = (sessionId: number) => {
  return async (dispatch: Dispatch<AttendanceActions>) => {
    dispatch({ type: AttendanceActionTypes.START_REQUEST });

    try {
      const response = await getAttendanceMatrixBySessionId(sessionId);
      const { payload, success, message } = response as any;

      if (success) {
        dispatch({
          type: AttendanceActionTypes.FETCH_MATRIX_SUCCESS,
          payload: payload,
        });
      } else {
        throw new Error(message);
      }
    } catch {
      dispatch({
        type: AttendanceActionTypes.FETCH_MATRIX_ERROR,
        payload: "Помилка при завантаженні матриці відвідуваності по сесії",
      });
    }
  };
};


export const fetchTodayAttendanceAction = (sessionId: number, studentId: string) => {
  return async () => {
    try {
      const response = await getTodayAttendance(sessionId, studentId);
      return response;
    } catch {
      return { success: false };
    }
  };
};

export const markAttendanceAction = (formData: FormData) => {
  return async () => {
    try {
      const response = await markAttendance(formData);
      console.log("response: ", response)
      if (!response) {
        return { success: false, message: "Пуста відповідь від серверу" };
      }

      const { success, message } = response as any;

      if (success) {
        return { success: true, message };
      } else {
        return { success: false, message };
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Unexpected error";
      return { success: false, message: msg };
    }
  };
};

