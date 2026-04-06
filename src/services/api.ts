import axios from 'axios';
import type { User, Student, Teacher, Course, Attendance, Grade, Schedule, Message, DashboardStats } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
});

// Auth interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Users
export const getUsers = () => api.get<User[]>('/users').then(r => r.data);
export const getUserById = (id: number) => api.get<User>(`/users/${id}`).then(r => r.data);
export const updateUserRole = (id: number, role: string) => api.put<User>(`/users/${id}/role`, { role }).then(r => r.data);
export const deleteUser = (id: number) => api.delete<void>(`/users/${id}`);

// Students
export const getStudents = () => api.get<Student[]>('/students').then(r => r.data);
export const getStudentById = (id: number) => api.get<Student>(`/students/${id}`).then(r => r.data);
export const getStudentByUserId = (userId: number) => api.get<Student>(`/students/user/${userId}`).then(r => r.data);
export const getStudentsByCourse = (courseId: number) => api.get<Student[]>(`/students/course/${courseId}`).then(r => r.data);
export const createStudent = (student: Partial<Student>, password: string) => api.post<Student>(`/students?password=${password}`, student).then(r => r.data);
export const updateStudent = (id: number, student: Partial<Student>) => api.put<Student>(`/students/${id}`, student).then(r => r.data);
export const deleteStudent = (id: number) => api.delete<void>(`/students/${id}`);

// Teachers
export const getTeachers = () => api.get<Teacher[]>('/teachers').then(r => r.data);
export const getTeacherById = (id: number) => api.get<Teacher>(`/teachers/${id}`).then(r => r.data);
export const getTeacherByUserId = (userId: number) => api.get<Teacher>(`/teachers/user/${userId}`).then(r => r.data);
export const createTeacher = (teacher: Partial<Teacher>, password: string) => api.post<Teacher>(`/teachers?password=${password}`, teacher).then(r => r.data);
export const updateTeacher = (id: number, teacher: Partial<Teacher>) => api.put<Teacher>(`/teachers/${id}`, teacher).then(r => r.data);

// Courses
export const getCourses = () => api.get<Course[]>('/courses').then(r => r.data);
export const getCourseById = (id: number) => api.get<Course>(`/courses/${id}`).then(r => r.data);
export const getCoursesByTeacher = (teacherId: number) => api.get<Course[]>(`/courses/teacher/${teacherId}`).then(r => r.data);
export const getCoursesByStudent = (studentId: number) => api.get<Course[]>(`/courses/student/${studentId}`).then(r => r.data);
export const createCourse = (course: Partial<Course>) => api.post<Course>('/courses', course).then(r => r.data);
export const updateCourse = (id: number, course: Partial<Course>) => api.put<Course>(`/courses/${id}`, course).then(r => r.data);
export const deleteCourse = (id: number) => api.delete<void>(`/courses/${id}`);
export const enrollStudent = (courseId: number, studentId: number) => api.post<Course>(`/courses/${courseId}/enroll/${studentId}`, {}).then(r => r.data);
export const unenrollStudent = (courseId: number, studentId: number) => api.delete<Course>(`/courses/${courseId}/unenroll/${studentId}`).then(r => r.data);
export const getCoursesByDepartment = (dept: string) => api.get<Course[]>(`/courses/department/${dept}`).then(r => r.data);

// Attendance
export const getAttendanceByStudent = (studentId: number) => api.get<Attendance[]>(`/attendance/student/${studentId}`).then(r => r.data);
export const getAttendanceByCourse = (courseId: number) => api.get<Attendance[]>(`/attendance/course/${courseId}`).then(r => r.data);
export const markAttendance = (attendance: Partial<Attendance>) => api.post<Attendance>('/attendance', attendance).then(r => r.data);
export const markBulkAttendance = (attendances: Partial<Attendance>[]) => api.post<Attendance[]>('/attendance/bulk', attendances).then(r => r.data);
export const getAttendanceStats = (studentId: number) => api.get(`/attendance/student/${studentId}/stats`).then(r => r.data);

// Grades
export const getGradesByStudent = (studentId: number) => api.get<Grade[]>(`/grades/student/${studentId}`).then(r => r.data);
export const getGradesByCourse = (courseId: number) => api.get<Grade[]>(`/grades/course/${courseId}`).then(r => r.data);
export const addGrade = (grade: Partial<Grade>) => api.post<Grade>('/grades', grade).then(r => r.data);
export const updateGrade = (id: number, grade: Partial<Grade>) => api.put<Grade>(`/grades/${id}`, grade).then(r => r.data);
export const deleteGrade = (id: number) => api.delete<void>(`/grades/${id}`);
export const getAverageGrade = (studentId: number) => api.get<number>(`/grades/student/${studentId}/average`).then(r => r.data);

// Schedules
export const getSchedules = () => api.get<Schedule[]>('/schedules').then(r => r.data);
export const getSchedulesByStudent = (studentId: number) => api.get<Schedule[]>(`/schedules/student/${studentId}`).then(r => r.data);
export const getSchedulesByTeacher = (teacherId: number) => api.get<Schedule[]>(`/schedules/teacher/${teacherId}`).then(r => r.data);
export const createSchedule = (schedule: Partial<Schedule>) => api.post<Schedule>('/schedules', schedule).then(r => r.data);
export const updateSchedule = (id: number, schedule: Partial<Schedule>) => api.put<Schedule>(`/schedules/${id}`, schedule).then(r => r.data);
export const deleteSchedule = (id: number) => api.delete<void>(`/schedules/${id}`);

// Messages
export const getInboxMessages = () => api.get<Message[]>('/messages/inbox').then(r => r.data);
export const getSentMessages = () => api.get<Message[]>('/messages/sent').then(r => r.data);
export const getUnreadCount = () => api.get<number>('/messages/unread/count').then(r => r.data);
export const sendMessage = (message: Partial<Message>) => api.post<Message>('/messages', message).then(r => r.data);
export const markMessageAsRead = (id: number) => api.put<Message>(`/messages/${id}/read`, {}).then(r => r.data);

// Reports
export const getDashboardStats = () => api.get<DashboardStats>('/reports/dashboard').then(r => r.data);
export const getEnrollmentStats = () => api.get('/reports/enrollment').then(r => r.data);
export const getAttendanceReport = () => api.get('/reports/attendance').then(r => r.data);
export const getGradeReport = () => api.get('/reports/grades').then(r => r.data);

export default api;
