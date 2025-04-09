import { AttendanceActions, AttendanceActionTypes, AttendanceState } from "./types";

const initialState: AttendanceState = {
    matrix: null,
    loading: false,
    error: null,
  };
  
  export const AttendanceReducer = (
    state: AttendanceState = initialState,
    action: AttendanceActions
  ): AttendanceState => {
    switch (action.type) {
      case AttendanceActionTypes.START_REQUEST:
        return { ...state, loading: true, error: null };
      case AttendanceActionTypes.FETCH_MATRIX_SUCCESS:
        return { ...state, loading: false, matrix: action.payload };
      case AttendanceActionTypes.FETCH_MATRIX_ERROR:
        return { ...state, loading: false, error: action.payload };
      default:
        return state;
    }
  };
  
  