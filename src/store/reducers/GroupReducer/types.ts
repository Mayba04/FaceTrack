export interface Group {
    id: number;
    name: string;
  }
  
  export interface GroupState {
    groups: Group[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
  }
  
  export enum GroupActionTypes {
    START_REQUEST = "START_REQUEST",
    FETCH_GROUPS_SUCCESS = "FETCH_GROUPS_SUCCESS",
    FETCH_GROUPS_ERROR = "FETCH_GROUPS_ERROR",
    CREATE_GROUP_SUCCESS = "CREATE_GROUP_SUCCESS",
    CREATE_GROUP_ERROR = "CREATE_GROUP_ERROR",
    DELETE_GROUP_SUCCESS = "DELETE_GROUP_SUCCESS",
    DELETE_GROUP_ERROR = "DELETE_GROUP_ERROR",
    UPDATE_GROUP_SUCCESS = "UPDATE_GROUP_SUCCESS",  
    UPDATE_GROUP_ERROR = "UPDATE_GROUP_ERROR" 
  }
  
  interface StartRequestAction {
    type: GroupActionTypes.START_REQUEST;
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

  
  export type GroupActions =
    | StartRequestAction
    | FetchGroupsSuccessAction
    | FetchGroupsErrorAction
    | CreateGroupSuccessAction
    | CreateGroupErrorAction
    | DeleteGroupSuccessAction
    | DeleteGroupErrorAction
    | UpdateGroupSuccessAction  
    | UpdateGroupErrorAction;   
  