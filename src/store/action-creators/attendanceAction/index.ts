import { Dispatch } from "redux";
import { getAttendanceMatrixByGroupId } from "../../../services/api-attendance-service";
import {
  AttendanceActionTypes,
  AttendanceActions,
} from "../../reducers/AttendanceReducer/types";

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
