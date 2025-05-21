import { PlannedSessionState, PlannedSessionActions, PlannedSessionActionTypes } from "./type";

const initialState: PlannedSessionState = {
  plannedSession: {
    id: 0,
    sessionId: 0,
    plannedDate: "",
    startTime: "",
    endTime: "",
  },
  loading: false,
  error: null,
  successMessage: null,
  sessions: [],
};

const PlannedSessionReducer = (
  state = initialState,
  action: PlannedSessionActions
): PlannedSessionState => {
  switch (action.type) {
    case PlannedSessionActionTypes.START_REQUEST:
      return { ...state, loading: true, error: null, successMessage: null };

    case PlannedSessionActionTypes.UPDATE_SUCCESS:
    case PlannedSessionActionTypes.DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        successMessage: action.payload,
        error: null,
      };

    case PlannedSessionActionTypes.UPDATE_ERROR:
    case PlannedSessionActionTypes.DELETE_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
        successMessage: null,
      };
    case PlannedSessionActionTypes.CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        successMessage: action.payload,
        error: null,
      };

    case PlannedSessionActionTypes.FETCH_BY_SESSION_ID_SUCCESS:
      return { ...state, loading: false, sessions: action.payload };
    case PlannedSessionActionTypes.FETCH_ERROR:
    case PlannedSessionActionTypes.CREATE_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
        successMessage: null,
      };

    default:
      return state;
  }
};

export default PlannedSessionReducer;
