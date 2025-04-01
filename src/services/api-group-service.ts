import instance from "./api-instance";

const responseBody: any = (response: any) => response.data;

const requests = {
    get: (url: string, params?: any) => instance.get(url, { params }).then(responseBody),
    post: (url: string, body?: any) => instance.post(url, body).then(responseBody),
    put: (url: string, body?: any) => instance.put(url, body).then(responseBody),
    delete: (url: string) => instance.delete(url).then(responseBody),
};

const Group = {
    getTeacherGroups: (teacherId: string) => requests.get(`/group/teacher/${teacherId}`),
    //getAllGroups: () => requests.get("/group/getall"),
    createGroup: (name: string, teacherId: string) => requests.post("/group/create", { name, teacherId }),
    deleteGroup: (groupId: number) => requests.delete(`/group/delete/${groupId}`),
    getGroupDetails: (Id: number) => requests.get(`/Group/${Id}`),
    updateGroup: (id: number, name: string, teacherId: string ) => requests.put(`/Group/update`, { name, id, teacherId}),
    hasGroups: (userId: string) => requests.get(`/group/has-groups/${userId}`),
};

export const hasGroups = async (userId: string): Promise<boolean> => {
    try {
      const response = await Group.hasGroups(userId);
      const { payload } = response as any;
      console.log(response)
      return payload; 
    } catch (error) {
      console.error("Помилка при перевірці груп:", error);
      return false;
    }
  };

export async function fetchGroupDetails(groupId: number) {
    try {
        return await Group.getGroupDetails(groupId);
    } catch (error) {
        console.error("Error fetching group details:", error);
        return { success: false, message: "Failed to fetch group details", error };
    }
}

export async function fetchTeacherGroups(teacherId: string) {
    try {
        return await Group.getTeacherGroups(teacherId);
    } catch (error) {
        console.error("Error fetching groups:", error);
        return { success: false, message: "Failed to fetch groups", error };
    }
}

// export async function fetchGroups() {
//     try {
//         const response = await Group.getAllGroups();
//         return response;
//     } catch (error) {
//         console.error("Error fetching groups:", error);
//         return { success: false, message: "Failed to fetch groups", error };
//     }
// }

export async function createGroup(name: string, teacherId: string) {
    try {
        const response = await Group.createGroup(name,teacherId );
        return response;
    } catch (error) {
        console.error("Error creating group:", error);
        return { success: false, message: "Failed to create group", error };
    }
}

export async function deleteGroup(groupId: number) {
    try {
        const response = await Group.deleteGroup(groupId);
        return response;
    } catch (error) {
        console.error("Error deleting group:", error);
        return { success: false, message: "Failed to delete group", error };
    }
}

export async function updateGroup(groupId: number, name: string, teacherId: string) {
    try {
        const response =await Group.updateGroup(groupId, name, teacherId);
        return response;
    } catch (error) {
        console.error("Error deleting group:", error);
        return { success: false, message: "Failed to delete group", error };
    }
}


export default Group;
