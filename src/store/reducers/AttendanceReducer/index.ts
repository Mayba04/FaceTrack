import {
  AttendanceActions,
  AttendanceActionTypes,
  AttendanceState,
  AttendanceItem
} from "./types";

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

    case AttendanceActionTypes.ADD_ABSENCE:
      return {
        ...state,
        matrix: state.matrix
          ? {
              ...state.matrix,
              attendances: [
                ...state.matrix.attendances,
                {
                  id: action.payload.id,
                  sessionId: action.payload.sessionId,
                  studentId: action.payload.studentId,
                  isPresent: false,
                },
              ],
            }
          : state.matrix,
      };

    case AttendanceActionTypes.DELETE_ABSENCE:
      return {
        ...state,
        matrix: state.matrix
          ? {
              ...state.matrix,
              attendances: state.matrix.attendances.filter(
                (a: AttendanceItem) => a.id !== action.payload
              ),
            }
          : state.matrix,
      };

    default:
      return state;
  }
};
