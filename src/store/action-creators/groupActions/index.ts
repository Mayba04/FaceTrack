import { Dispatch } from "redux";
import { createGroup, fetchTeacherGroups, deleteGroup, updateGroup, fetchGroupDetails, fetchFilteredGroups, changeGroupTeacher, searchGroupsByName } from "../../../services/api-group-service";
import { GroupActionTypes, GroupActions } from "../../reducers/GroupReducer/types";
import { message } from "antd";

export const fetchFilteredGroupsAction = (filter: any) => {
    return async (dispatch: Dispatch<GroupActions>) => {
      dispatch({ type: GroupActionTypes.START_REQUEST_GROUPS });
  
      try {
        const res = await fetchFilteredGroups(filter);
        const {
          success,
          payload,
          totalCount,
          countPages,
          pageNumber,
          pageSize,
          message: msg
        } = res as any;
  
        if (success) {
          dispatch({
            type: GroupActionTypes.FETCH_GROUPS_SUCCESS,
            payload: {
              groups: payload,       
              currentPage: pageNumber,
              pageSize: pageSize,
              totalCount: totalCount,
              totalPages: countPages,
            },
          });
        } else {
          throw new Error(msg);
        }
      } catch (err: any) {
        dispatch({
          type: GroupActionTypes.FETCH_GROUPS_ERROR,
          payload: err?.message || "Error",
        });
      }
    };
  };

export const fetchGroupByIdAction = (groupId: number) => {
    return async (dispatch: Dispatch<GroupActions>) => {
        dispatch({ type: GroupActionTypes.START_REQUEST_GROUPS });

        try {
            const response = await fetchGroupDetails(groupId);
            const { payload, success, message } = response as any; 
            if (success) {
                dispatch({
                    type: GroupActionTypes.FETCH_GROUP_BY_ID_SUCCESS,
                    payload: payload,
                });
            } else {
                throw new Error(message);
            }
        } catch (error: any) {
            console.error("Failed to fetch group details:", error?.message || error);
            dispatch({
                type: GroupActionTypes.FETCH_GROUP_BY_ID_ERROR,
                payload: "Error fetching group details",
            });
            message.error(error?.message || "Failed to fetch group details.");
        }
    };
};

export const fetchGroupsAction = (teacherId: string) => {
    return async (dispatch: Dispatch<GroupActions>) => {
        dispatch({ type: GroupActionTypes.START_REQUEST_GROUPS });

        try {
            const response = await fetchTeacherGroups(teacherId);
            console.log("Response object:", response); 
            const { payload, success, message } = response as any; 
            if (success) {
                dispatch({
                    type: GroupActionTypes.FETCH_GROUPS_SUCCESS,
                    payload: {
                        groups: payload, 
                        currentPage: 1,
                        totalPages: 1,
                        pageSize: payload.length,
                        totalCount: payload.length,
                    },
                });
            } else {
                console.error("Error fetching groups:", message);
                throw new Error(message);
            }
        } catch (error) {
            console.error("Error fetching groups: ", error);
            dispatch({ type: GroupActionTypes.FETCH_GROUPS_ERROR, payload: "Error fetching groups" });
            message.error("Failed to load groups");
        }
    };
};


export const createGroupAction = (name: string, teacherId: string) => {
    return async (dispatch: Dispatch<GroupActions>) => {
        dispatch({ type: GroupActionTypes.START_REQUEST_GROUPS });

        try {
            const response = await createGroup(name, teacherId);
            console.log("response create:", response);

            const { payload, success, message } = response as any; 

            if (success) {
                const newGroup = {
                    id: payload.id,
                    name: payload.name, 
                    teacherId: payload.teacherId, 
                };

                dispatch({
                    type: GroupActionTypes.CREATE_GROUP_SUCCESS,
                    payload: newGroup,
                });

            
            } else {
                console.error(" Unexpected response format:", response);
                throw new Error(message || "Unknown error");
            }
        } catch (error: any) {
            console.error(" Failed to create group: ", error?.message || error);

            dispatch({ type: GroupActionTypes.CREATE_GROUP_ERROR, payload: "Error creating group" });

            message.error(error?.message || "Failed to create group");
        }
    };
};

export const deleteGroupAction = (groupId: number) => {
    return async (dispatch: Dispatch<GroupActions>) => {
        dispatch({ type: GroupActionTypes.START_REQUEST_GROUPS });

        try {
            const response = await deleteGroup(groupId);
            const { success, message: responseMessage } = response as any;
            if (success) {
                dispatch({ type: GroupActionTypes.DELETE_GROUP_SUCCESS, payload: groupId });
            } else {
                throw new Error(responseMessage);
            }
        } catch (error) {
            console.error("Failed to delete group: ", error);
            dispatch({ type: GroupActionTypes.DELETE_GROUP_ERROR, payload: "Error deleting group" });
            message.error("Failed to delete group");
        }
    };
};


export const updateGroupAction = (groupId: number, name: string, teacherId: string) => {
    return async (dispatch: Dispatch<GroupActions>) => {
        dispatch({ type: GroupActionTypes.START_REQUEST_GROUPS });

        try {
            const response = await updateGroup(groupId, name, teacherId);
            const { success, message } = response as any; 
            if (success) {
                dispatch({
                    type: GroupActionTypes.UPDATE_GROUP_SUCCESS,
                    payload: { groupId, name }
                });
            } else {
                console.error("Error fetching groups:", message);
                throw new Error(message);
            }
        } catch (error) {
            console.error("Error fetching groups: ", error);
            dispatch({ type: GroupActionTypes.UPDATE_GROUP_ERROR, payload: "Failed to update group" });
            message.error("Failed to load groups");
        }
    };
};

export const changeGroupTeacherAction = (groupId: number, currentTeacherId: string, futureTeacherId: string) => {
    return async (dispatch: Dispatch<GroupActions>) => {
      dispatch({ type: GroupActionTypes.START_REQUEST_GROUPS });
  
      try {
        const response = await changeGroupTeacher(groupId, currentTeacherId, futureTeacherId);
        const { success, message, payload } = response as any;
  
        if (success) {
            dispatch({
                type: GroupActionTypes.CHANGE_GROUP_TEACHER_SUCCESS,
                payload: {
                  groupId,
                  teacherName: payload?.teacherName || "—",
                },
              });
              
        } else {
          throw new Error(message);
        }
      } catch (error) {
        console.error("Failed to change teacher:", error);
        dispatch({ type: GroupActionTypes.UPDATE_GROUP_ERROR, payload: "Failed to change teacher" });
        message.error("Failed to change teacher");
      }
      finally {
        dispatch({ type: GroupActionTypes.END_REQUEST });
      }
    };
  };
  
  export const searchGroupsByNameAction = (name: string) => {
    return async (dispatch: Dispatch<GroupActions>) => {
      dispatch({ type: GroupActionTypes.START_REQUEST_GROUPS });
  
      try {
        const res = await searchGroupsByName(name);
        const { success, payload, message } = res as any;
  
        if (success) {
          dispatch({
            type: GroupActionTypes.SEARCH_GROUPS_BY_NAME_SUCCESS,
            payload: payload, 
          });
        } else {
          throw new Error(message);
        }
      } catch (error: any) {
        console.error("Search groups failed:", error?.message || error);
        dispatch({
          type: GroupActionTypes.SEARCH_GROUPS_BY_NAME_ERROR,
          payload: error?.message || "Search failed",
        });
      }
    };
  };

//   const newSession = {
//     id: 0,
//     groupId: Number(groupId),
//     startTime: startTime.toISOString(),
//     endTime: endTime.toISOString(),
//     createdBy: `${group?.teacherName} ${group?.name}`,
//     userId: group?.teacherId,
//     name: sessionName,
//   };