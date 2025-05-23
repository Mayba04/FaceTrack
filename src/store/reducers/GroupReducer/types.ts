export interface Group {
    id: number;
    name: string;
    teacherName?: string;  
    teacherId?: string;  
    studentsCount?: number;  
  }
  
  export interface GroupState {
    group: Group | null;
    groups: Group[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    searchResults?: Group[];
  }
  
  export enum GroupActionTypes {
    START_REQUEST_GROUPS = "START_REQUEST_GROUPS",
    FETCH_GROUPS_SUCCESS = "FETCH_GROUPS_SUCCESS",
    FETCH_GROUPS_ERROR = "FETCH_GROUPS_ERROR",
    CREATE_GROUP_SUCCESS = "CREATE_GROUP_SUCCESS",
    CREATE_GROUP_ERROR = "CREATE_GROUP_ERROR",
    DELETE_GROUP_SUCCESS = "DELETE_GROUP_SUCCESS",
    DELETE_GROUP_ERROR = "DELETE_GROUP_ERROR",
    UPDATE_GROUP_SUCCESS = "UPDATE_GROUP_SUCCESS",  
    UPDATE_GROUP_ERROR = "UPDATE_GROUP_ERROR",
    FETCH_GROUP_BY_ID_SUCCESS = "FETCH_GROUP_BY_ID_SUCCESS",
    FETCH_GROUP_BY_ID_ERROR = "FETCH_GROUP_BY_ID_ERROR",
    CHANGE_GROUP_TEACHER_SUCCESS = "CHANGE_GROUP_TEACHER_SUCCESS",
    END_REQUEST = "END_REQUEST",
    SEARCH_GROUPS_BY_NAME_SUCCESS = "SEARCH_GROUPS_BY_NAME_SUCCESS",
    SEARCH_GROUPS_BY_NAME_ERROR = "SEARCH_GROUPS_BY_NAME_ERROR",
    FETCH_GROUPS_BY_IDS_SUCCESS = "FETCH_GROUPS_BY_IDS_SUCCESS",
  }

  interface FetchGroupsByIdsSuccessAction {
    type: GroupActionTypes.FETCH_GROUPS_BY_IDS_SUCCESS;
    payload: Group[];
  }


  interface SearchGroupsByNameSuccessAction {
    type: GroupActionTypes.SEARCH_GROUPS_BY_NAME_SUCCESS;
    payload: Group[];
  }
  
  interface SearchGroupsByNameErrorAction {
    type: GroupActionTypes.SEARCH_GROUPS_BY_NAME_ERROR;
    payload: string;
  }
  
  
  interface ChangeGroupTeacherSuccessAction {
    type: GroupActionTypes.CHANGE_GROUP_TEACHER_SUCCESS;
    payload: { groupId: number; teacherName: string };
  }
  

  interface StartRequestAction {
    type: GroupActionTypes.START_REQUEST_GROUPS;
  }
  
  interface FetchGroupsSuccessAction {
    type: GroupActionTypes.FETCH_GROUPS_SUCCESS;
    payload: {
      groups: Group[];
      currentPage: number;
      totalPages: number;
      pageSize: number;
      totalCount: number;
    };
  }
  
  interface FetchGroupsErrorAction {
    type: GroupActionTypes.FETCH_GROUPS_ERROR;
    payload: string;
  }
  
  interface CreateGroupSuccessAction {
    type: GroupActionTypes.CREATE_GROUP_SUCCESS;
    payload: Group;
  }
  
  interface CreateGroupErrorAction {
    type: GroupActionTypes.CREATE_GROUP_ERROR;
    payload: string;
  }
  
  interface DeleteGroupSuccessAction {
    type: GroupActionTypes.DELETE_GROUP_SUCCESS;
    payload: number; 
  }
  
  interface DeleteGroupErrorAction {
    type: GroupActionTypes.DELETE_GROUP_ERROR;
    payload: string;
  }

  interface UpdateGroupSuccessAction {
    type: GroupActionTypes.UPDATE_GROUP_SUCCESS;
    payload: { groupId: number; name: string };
}

interface UpdateGroupErrorAction {
    type: GroupActionTypes.UPDATE_GROUP_ERROR;
    payload: string;
}

interface FetchGroupByIdSuccessAction {
  type: GroupActionTypes.FETCH_GROUP_BY_ID_SUCCESS;
  payload: Group;
}

interface FetchGroupByIdErrorAction {
  type: GroupActionTypes.FETCH_GROUP_BY_ID_ERROR;
  payload: string;
}

interface EndRequestAction {
  type: GroupActionTypes.END_REQUEST;  
}
  
  export type GroupActions =
    | StartRequestAction
    | FetchGroupsSuccessAction
    | FetchGroupsErrorAction
    | CreateGroupSuccessAction
    | CreateGroupErrorAction
    | DeleteGroupSuccessAction
    | DeleteGroupErrorAction
    | UpdateGroupSuccessAction  
    | UpdateGroupErrorAction
    | FetchGroupByIdSuccessAction
    | FetchGroupByIdErrorAction   
    | ChangeGroupTeacherSuccessAction   
    | EndRequestAction
    | SearchGroupsByNameSuccessAction
    | SearchGroupsByNameErrorAction
    | FetchGroupsByIdsSuccessAction;   
  