import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LoginRoute, RoleRoute } from './components/ProtectedRoute';
import StudentLayout from './components/StudentLayout';
import AdminLayout from './components/AdminLayout';
import TeacherLayout from './components/TeacherLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStudents from './pages/admin/AdminStudents';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminSchedules from './pages/admin/AdminSchedules';

// Teacher pages
import TeacherOverview from './pages/teacher/TeacherOverview';
import TeacherCourses from './pages/teacher/TeacherCourses';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherCertifications from './pages/teacher/TeacherCertifications';
import TeacherTimetable from './pages/teacher/TeacherTimetable';

// Student pages — FUNCTIONAL
import StudentHome from './pages/student/StudentHome';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentCourses from './pages/student/StudentCourses';
import StudentMarks from './pages/student/StudentMarks';
import StudentProfile from './pages/student/StudentProfile';
import StudentTimetable from './pages/student/StudentTimetable';
import StudentFees from './pages/student/StudentFees';
import StudentResults from './pages/student/StudentResults';
import StudentCourseRegistration from './pages/student/StudentCourseRegistration';




function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginRoute><LoginPage /></LoginRoute>} />
          <Route path="/register" element={<LoginRoute><RegisterPage /></LoginRoute>} />

          {/* Admin routes with layout */}
          <Route path="/admin" element={<RoleRoute roles={['ADMIN']}><AdminLayout /></RoleRoute>}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="teachers" element={<AdminTeachers />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="schedules" element={<AdminSchedules />} />
          </Route>

          {/* Administrator alias */}
          <Route path="/administrator" element={<RoleRoute roles={['ADMINISTRATOR']}><AdminLayout /></RoleRoute>}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="teachers" element={<AdminTeachers />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="schedules" element={<AdminSchedules />} />
          </Route>

          {/* Teacher routes with layout */}
          <Route path="/teacher" element={<RoleRoute roles={['TEACHER']}><TeacherLayout /></RoleRoute>}>
            <Route index element={<TeacherOverview />} />
            <Route path="courses" element={<TeacherCourses />} />
            <Route path="attendance" element={<TeacherAttendance />} />
            <Route path="timetable" element={<TeacherTimetable />} />
            <Route path="certifications" element={<TeacherCertifications />} />
          </Route>

          {/* Student routes with layout */}
          <Route path="/student" element={<RoleRoute roles={['STUDENT']}><StudentLayout /></RoleRoute>}>
            <Route index element={<StudentHome />} />
            <Route path="academic/regular" element={<StudentCourseRegistration />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="courses/assignments" element={<StudentCourses />} />
            <Route path="courses/internals" element={<StudentMarks />} />
            <Route path="exam/results" element={<StudentResults />} />
            <Route path="fees/payments" element={<StudentFees />} />
            <Route path="cgpa" element={<StudentResults />} />
            <Route path="profile/view" element={<StudentProfile />} />
            <Route path="timetable" element={<StudentTimetable />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
