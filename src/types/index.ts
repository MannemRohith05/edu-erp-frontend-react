export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'ADMINISTRATOR';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'ADMINISTRATOR';
}

export interface Student {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  studentId: string;
  dateOfBirth: string;
  enrollmentDate: string;
  department: string;
  semester: number;
  parentContact: string;
  address: string;
  courseCodes: string[];
}

export interface Teacher {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  employeeId: string;
  department: string;
  qualification: string;
  specialization: string;
  joiningDate: string;
  courseCodes: string[];
}

export interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  description: string;
  credits: number;
  semester: number;
  department: string;
  teacherId: number;
  teacherName: string;
  enrolledCount: number;
}

export interface Attendance {
  id: number;
  studentId: number;
  studentName: string;
  studentCode: string;
  courseId: number;
  courseName: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  remarks: string;
  markedAt: string;
}

export interface Grade {
  id: number;
  studentId: number;
  studentName: string;
  studentCode: string;
  courseId: number;
  courseName: string;
  assignmentName: string;
  marks: number;
  totalMarks: number;
  percentage: number;
  gradeType: string;
  letterGrade: string;
  feedback: string;
  gradedAt: string;
}

export interface Schedule {
  id: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  teacherName: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string;
  endTime: string;
  room: string;
  building: string;
}

export interface Message {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  subject: string;
  content: string;
  sentAt: string;
  readAt: string;
  isRead: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalAdmins: number;
  totalAdministrators: number;
}
