export interface StudentShort {
    id: string;
    fullName: string;
  }
  
  export interface SessionShort {
    id: number;
    startTime: string;
  }
  
  export interface AttendanceItem {
    sessionId: number;
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
    FETCH_MATRIX_ERROR = "FETCH_MATRIX_ERROR"
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
  
  export type AttendanceActions =
    | StartRequestAction
    | FetchMatrixSuccessAction
    | FetchMatrixErrorAction;
  