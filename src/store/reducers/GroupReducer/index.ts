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
};

const GroupReducer = (state = initialState, action: GroupActions): GroupState => {
  switch (action.type) {
    case GroupActionTypes.START_REQUEST:
      return { ...state, loading: true, error: null };

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
