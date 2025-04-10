// API functions for teacher management

export interface Teacher {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    profile_picture: string | null;
  };
  nip: string;
  phone: string | null;
  subject: string | null;
}

export const updateTeacher = async (
  teacherId: string,
  data: {
    userId: string;
    name: string;
    email: string;
    nip: string;
    phone: string | null;
    subject: string | null;
  }
) => {
  // This would normally be an API call
  console.log("Updating teacher", teacherId, data);
  // For now, just return success
  return { success: true };
};

export const deleteTeacher = async (teacherId: string) => {
  // This would normally be an API call
  console.log("Deleting teacher", teacherId);
  // For now, just return success
  return { success: true };
};

export const getTeacherById = async (id: string): Promise<Teacher | null> => {
  // This would normally be an API call
  // For now, return mock data
  return {
    _id: id,
    user_id: {
      _id: "user123",
      name: "Teacher Name",
      email: "teacher@example.com",
      profile_picture: null,
    },
    nip: "12345678",
    phone: "1234567890",
    subject: "Mathematics",
  };
};

export const getAllTeachers = async (): Promise<string> => {
  // This would normally be an API call
  // For now, return mock data
  const teachers = [
    {
      _id: "teacher1",
      user_id: {
        _id: "user1",
        name: "Teacher One",
        email: "teacher1@example.com",
        profile_picture: null,
      },
      nip: "12345678",
      phone: "1234567890",
      subject: "Mathematics",
    },
    {
      _id: "teacher2",
      user_id: {
        _id: "user2",
        name: "Teacher Two",
        email: "teacher2@example.com",
        profile_picture: null,
      },
      nip: "87654321",
      phone: "0987654321",
      subject: "Science",
    },
  ];
  
  return JSON.stringify(teachers);
};
