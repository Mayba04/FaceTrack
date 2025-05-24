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
    filterGroups: (body: any) => requests.post("/group/filter", body),
    changeGroupTeacher: (groupId: number, currentTeacherId: string, futureTeacherId: string) => requests.put("/group/change-teacher", {
        groupId, currentTeacherId, futureTeacherId, }),
    searchGroupsByName: (name: string, pageNumber: number, pageSize: number) =>
        requests.get("/group/search", { name, pageNumber, pageSize }),
    getGroupsByIds: (ids: number[]) => requests.post("/group/by-ids", ids),
   removeStudentFromGroup: (studentId: string, groupId: number) =>
  requests.delete(`/group/remove?studentId=${studentId}&groupId=${groupId}`),

};

export async function deleteStudentFromGroup(studentId: string, groupId: number) {
  try {
    return await Group.removeStudentFromGroup(studentId, groupId);
  } catch (error) {
     return { success: false, message: "Не вдалося видалити студента з групи", error };
  }
}

export async function fetchGroupsByIds(ids: number[]) {
  try {
    return await Group.getGroupsByIds(ids);
  } catch (error) {
    console.error("Error fetching groups by ids:", error);
    return { success: false, message: "Failed to fetch groups by ids", error };
  }
}


export async function searchGroupsByName(name: string, pageNumber = 1, pageSize = 10) {
    try {
      return await Group.searchGroupsByName(name, pageNumber, pageSize);
    } catch (error) {
      console.error("Error searching groups:", error);
      return { success: false, message: "Failed to search groups", error };
    }
  }

export async function changeGroupTeacher(groupId: number, currentTeacherId: string, futureTeacherId: string) {
    try {
        return await Group.changeGroupTeacher(groupId, currentTeacherId, futureTeacherId);
    } catch (error) {
      console.error("Error changing teacher:", error);
      return { success: false, message: "Failed to change teacher", error };
    }
  }
  

export async function fetchFilteredGroups(filter: any) {
  try {
    return await Group.filterGroups(filter);
  } catch (error) {
    console.error("Error filter groups:", error);
    return { success: false, message: "Failed to filter groups", error };
  }
}

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
