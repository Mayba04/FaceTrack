import { GroupState, GroupActions, GroupActionTypes } from "./types";

const initialState: GroupState = {
  group: null,
  groups: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 0,
  pageSize: 10,
  totalCount: 0,
  searchResults: [],
};

const GroupReducer = (state = initialState, action: GroupActions): GroupState => {
  switch (action.type) {
    case GroupActionTypes.START_REQUEST_GROUPS:
      return { ...state, loading: true, error: null };

    
    case GroupActionTypes.FETCH_GROUPS_BY_IDS_SUCCESS: {
      const updatedGroups = [...state.groups];
      action.payload.forEach((group) => {
        const index = updatedGroups.findIndex((g) => g.id === group.id);
        if (index === -1) {
          updatedGroups.push(group);
        } else {
          updatedGroups[index] = group;
        }
      });
      return {
        ...state,
        groups: updatedGroups,
        loading: false,
      };
    }



    case GroupActionTypes.FETCH_GROUPS_SUCCESS:
      return {
        ...state,
        groups: action.payload.groups,
        currentPage: action.payload.currentPage,
        totalPages: action.payload.totalPages,
        pageSize: action.payload.pageSize,
        totalCount: action.payload.totalCount,
        loading: false,
      };
    case GroupActionTypes.CHANGE_GROUP_TEACHER_SUCCESS:
      return {
        ...state,
        groups: state.groups.map((group) =>
          group.id === action.payload.groupId
            ? { ...group, teacherName: action.payload.teacherName }
            : group
        ),
        loading: false,
      };
    case GroupActionTypes.FETCH_GROUP_BY_ID_SUCCESS:
      return {
        ...state,
        group: action.payload, 
        loading: false,
      };
    
    case GroupActionTypes.FETCH_GROUP_BY_ID_ERROR:
    case GroupActionTypes.FETCH_GROUPS_ERROR:
    case GroupActionTypes.CREATE_GROUP_ERROR:
    case GroupActionTypes.DELETE_GROUP_ERROR:
    case GroupActionTypes.UPDATE_GROUP_ERROR: 
      return { ...state, loading: false, error: action.payload };

    case GroupActionTypes.CREATE_GROUP_SUCCESS: {
      console.log("Before adding new group:", state.groups);
      console.log("New group:", action.payload);

      const updatedGroups = [...state.groups, action.payload];

      console.log("Updated groups:", updatedGroups);

      return {
          ...state,
          groups: updatedGroups,
          totalCount: state.totalCount + 1,
          loading: false,
      };
    }

    case GroupActionTypes.SEARCH_GROUPS_BY_NAME_SUCCESS:
      return {
        ...state,
        searchResults: action.payload,
        loading: false,
        error: null,
      };

    case GroupActionTypes.SEARCH_GROUPS_BY_NAME_ERROR:
      return {
        ...state,
        searchResults: [],
        loading: false,
        error: action.payload,
      };

    case GroupActionTypes.END_REQUEST:
      return { ...state, loading: false };

    case GroupActionTypes.DELETE_GROUP_SUCCESS:
      return {
        ...state,
        groups: state.groups.filter((group) => group.id !== action.payload),
        loading: false,
      };
    
    case GroupActionTypes.UPDATE_GROUP_SUCCESS: 
      return {
        ...state,
        groups: state.groups.map((group) =>
          group.id === action.payload.groupId ? { ...group, name: action.payload.name } : group
        ),
        loading: false,
      };

    default:
      return state;
  }
};

export default GroupReducer;
