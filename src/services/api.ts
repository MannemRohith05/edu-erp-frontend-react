import axios from 'axios';
import type { User, Student, Teacher, Course, Attendance, Grade, Schedule, Message, DashboardStats, FeeStructure, FeeLedgerEntry, AcademicSummary, Certificate, SalaryStructure, PayrollRecord, PayrollStatus } from '../types';

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
export const createStudent = (student: Partial<Student>, password: string) => api.post<Student>('/students', { ...student, password }).then(r => r.data);
export const updateStudent = (id: number, student: Partial<Student>) => api.put<Student>(`/students/${id}`, student).then(r => r.data);
export const deleteStudent = (id: number) => api.delete<void>(`/students/${id}`);

// Teachers
export const getTeachers = () => api.get<Teacher[]>('/teachers').then(r => r.data);
export const getTeacherById = (id: number) => api.get<Teacher>(`/teachers/${id}`).then(r => r.data);
export const getTeacherByUserId = (userId: number) => api.get<Teacher>(`/teachers/user/${userId}`).then(r => r.data);
export const createTeacher = (teacher: Partial<Teacher>, password: string) => api.post<Teacher>('/teachers', { ...teacher, password }).then(r => r.data);
export const updateTeacher = (id: number, teacher: Partial<Teacher>) => api.put<Teacher>(`/teachers/${id}`, teacher).then(r => r.data);
export const getMyCourses = () => api.get<Course[]>('/courses/mine').then(r => r.data);
export const getMySchedules = () => api.get<Schedule[]>('/schedules/mine').then(r => r.data);

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
export const getMyGrades = () => api.get<Grade[]>('/grades/me').then(r => r.data);
export const getGradesByCourse = (courseId: number) => api.get<Grade[]>(`/grades/course/${courseId}`).then(r => r.data);
export const addGrade = (grade: Partial<Grade>) => api.post<Grade>('/grades', grade).then(r => r.data);
export const updateGrade = (id: number, grade: Partial<Grade>) => api.put<Grade>(`/grades/${id}`, grade).then(r => r.data);
export const deleteGrade = (id: number) => api.delete<void>(`/grades/${id}`);
export const getAverageGrade = (studentId: number) => api.get<number>(`/grades/student/${studentId}/average`).then(r => r.data);

// Schedules
export const getSchedules = () => api.get<Schedule[]>('/schedules').then(r => r.data);
export const getSchedulesByStudent = (studentId: number) => api.get<Schedule[]>(`/schedules/student/${studentId}`).then(r => r.data);
export const getMyStudentSchedules = () => api.get<Schedule[]>('/schedules/mine/student').then(r => r.data);
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
export const getMyFeeStructures = () => api.get<FeeStructure[]>('/fees/me/structures').then(r => r.data);
export const getMyFeeLedger = () => api.get<FeeLedgerEntry[]>('/fees/me/ledger').then(r => r.data);
export const initiateMyFeePayment = (invoiceId: number, amount: number, idempotencyKey: string) => api.post<FeeLedgerEntry>('/fees/me/payments/initiate', null, { params: { invoiceId, amount }, headers: { 'Idempotency-Key': idempotencyKey } }).then(r => r.data);
export const getMyAcademicSummary = () => api.get<AcademicSummary>('/grades/me/summary').then(r => r.data);
export const getFeeStructures = () => api.get<FeeStructure[]>('/fees/structures').then(r => r.data);
export const createFeeStructure = (value: Partial<FeeStructure>) => api.post<FeeStructure>('/fees/structures', value).then(r => r.data);
export const getFeeInvoices = () => api.get<FeeLedgerEntry[]>('/fees/invoices').then(r => r.data);
export const createFeeInvoice = (studentId: number, structureId: number, amount: number) => api.post<FeeLedgerEntry>('/fees/invoices', null, { params: { studentId, structureId, amount } }).then(r => r.data);
export const recordFeePayment = (invoiceId: number, amount: number, reference: string, notes?: string) => api.post<FeeLedgerEntry>(`/fees/invoices/${invoiceId}/payments`, null, { params: { amount, reference, notes } }).then(r => r.data);
export const getCertificates = () => api.get<Certificate[]>('/certificates').then(r => r.data);
export const issueCertificate = (value: Partial<Certificate>) => api.post<Certificate>('/certificates', value).then(r => r.data);
export const correctCertificate = (id: number, value: Partial<Certificate>) => api.put<Certificate>(`/certificates/${id}`, value).then(r => r.data);
export const revokeCertificate = (id: number) => api.post<Certificate>(`/certificates/${id}/revoke`).then(r => r.data);
export const getMyCertificates = () => api.get<Certificate[]>('/certificates/me').then(r => r.data);
export const getSalaryStructures = () => api.get<SalaryStructure[]>('/payroll/structures').then(r => r.data);
export const configureSalary = (value: Partial<SalaryStructure>) => api.post<SalaryStructure>('/payroll/structures', value).then(r => r.data);
export const getMySalaryStructures = () => api.get<SalaryStructure[]>('/payroll/structures/me').then(r => r.data);
export const getPayrollRecords = () => api.get<PayrollRecord[]>('/payroll/records').then(r => r.data);
export const generatePayroll = (teacherId: number, year: number, month: number) => api.post<PayrollRecord>('/payroll/records/generate', null, { params: { teacherId, year, month } }).then(r => r.data);
export const updatePayroll = (id: number, status: PayrollStatus, paymentDate?: string, paymentReference?: string, payslipReference?: string) => api.put<PayrollRecord>(`/payroll/records/${id}`, { status, paymentDate, paymentReference, payslipReference }).then(r => r.data);
export const getMyPayrollRecords = () => api.get<PayrollRecord[]>('/payroll/records/me').then(r => r.data);

export default api;
