import { Dispatch } from "redux";
import { deleteAttendance, getAttendanceMatrixByGroupId, markStudentAbsent } from "../../../services/api-attendance-service";
import {
  AttendanceActionTypes,
  AttendanceActions,
} from "../../reducers/AttendanceReducer/types";

export const addAbsenceAction = (studentId: string, sessionId: number, timestamp: string) => {
  return async (dispatch: Dispatch<AttendanceActions>) => {
    try {
      const response = await markStudentAbsent({ studentId, sessionId, timestamp });
      const { payload, success } = response as any;

      if (success && payload) {
        dispatch({
          type: AttendanceActionTypes.ADD_ABSENCE,
          payload: {
            sessionId: payload.sessionId,
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

export const fetchAttendanceMatrixAction = (groupId: number) => {
  return async (dispatch: Dispatch<AttendanceActions>) => {
    dispatch({ type: AttendanceActionTypes.START_REQUEST });

    try {
      const response = await getAttendanceMatrixByGroupId(groupId);
      const { payload, success, message } = response as any;

      if (success) {
        dispatch({
          type: AttendanceActionTypes.FETCH_MATRIX_SUCCESS,
          payload: payload,
        });
      } else {
        throw new Error(message);
      }
    } catch  {
      dispatch({
        type: AttendanceActionTypes.FETCH_MATRIX_ERROR,
        payload: "Помилка при завантаженні матриці відвідуваності",
      });
    }
  };
};

