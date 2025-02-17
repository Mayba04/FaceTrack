import { Dispatch } from "redux";
import { createGroup, fetchTeacherGroups, deleteGroup, updateGroup } from "../../../services/api-group-service";
import { GroupActionTypes, GroupActions } from "../../reducers/GroupReducer/types";
import { message } from "antd";

// export const fetchGroupsAction = () => {
//     return async (dispatch: Dispatch<GroupActions>) => {
//         dispatch({ type: GroupActionTypes.START_REQUEST });

//         try {
//             const response = await fetchGroups();
//             const { payload, success, message } = response as any; 
//             if (success) {
//                 dispatch({
//                     type: GroupActionTypes.FETCH_GROUPS_SUCCESS,
//                     payload: {
//                         groups: payload,
//                         currentPage: 1, 
//                         totalPages: 1,
//                         pageSize: payload.length,
//                         totalCount: payload.length,
//                     },
//                 });
//             } else {
//                 throw new Error(message);
//             }
//         } catch (error) {
//             console.error("Failed to load groups: ", error);
//             dispatch({ type: GroupActionTypes.FETCH_GROUPS_ERROR, payload: "Error fetching groups" });
//             message.error("Failed to load groups" + error );
//         }
//     };
// };

export const fetchGroupsAction = (teacherId: string) => {
    return async (dispatch: Dispatch<GroupActions>) => {
        dispatch({ type: GroupActionTypes.START_REQUEST });

        try {
            const response = await fetchTeacherGroups(teacherId);
            console.log("Response object:", response); // Дебаг
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
        dispatch({ type: GroupActionTypes.START_REQUEST });

        try {
            const response = await createGroup(name, teacherId);
            console.log("✅ response create:", response);

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
        dispatch({ type: GroupActionTypes.START_REQUEST });

        try {
            const response = await deleteGroup(groupId);
            const {  success, message } = response as any; 
            if (success) {
                dispatch({ type: GroupActionTypes.DELETE_GROUP_SUCCESS, payload: groupId });
                message.success("Group deleted successfully!");
            } else {
                throw new Error(message);
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
        dispatch({ type: GroupActionTypes.START_REQUEST });

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