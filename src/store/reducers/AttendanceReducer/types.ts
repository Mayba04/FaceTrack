export interface StudentShort {
    id: string;
    fullName: string;
  }
  
  export interface SessionShort {
    id: number;
    startTime: string;
    sessionHistoryId: number; 
  }
  
  export interface AttendanceItem {
    id?: number;
    sessionHistoryId: number;
    studentId: string;
    isPresent: boolean;
  }

  export interface AttendanceMatrix {
    students: StudentShort[];
    sessions: SessionShort[];
    attendances: AttendanceItem[];
  }
  
  export interface AttendanceState {
    matrix: AttendanceMatrix | null;
    loading: boolean;
    error: string | null;
  }
  
  export enum AttendanceActionTypes {
    START_REQUEST = "START_ATTENDANCE_REQUEST",
    FETCH_MATRIX_SUCCESS = "FETCH_MATRIX_SUCCESS",
    FETCH_MATRIX_ERROR = "FETCH_MATRIX_ERROR",
    ADD_ABSENCE = "ADD_ABSENCE",
    DELETE_ABSENCE = "DELETE_ABSENCE"
  }
  
  interface StartRequestAction {
    type: AttendanceActionTypes.START_REQUEST;
  }
  
  interface FetchMatrixSuccessAction {
    type: AttendanceActionTypes.FETCH_MATRIX_SUCCESS;
    payload: AttendanceMatrix;
  }
  
  interface FetchMatrixErrorAction {
    type: AttendanceActionTypes.FETCH_MATRIX_ERROR;
    payload: string;
  }

  interface AddAbsenceAction {
    type: AttendanceActionTypes.ADD_ABSENCE;
    payload: {
      id: number;
      sessionHistoryId: number;
      studentId: string;
    };
  }
  
  interface DeleteAbsenceAction {
    type: AttendanceActionTypes.DELETE_ABSENCE;
    payload: number;
  }
  
  export type AttendanceActions =
    | StartRequestAction
    | FetchMatrixSuccessAction
    | FetchMatrixErrorAction
    | AddAbsenceAction
    | DeleteAbsenceAction;
  