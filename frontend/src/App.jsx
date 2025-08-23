import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext.jsx'
import { AdminLayout } from './layouts/AdminLayout.jsx'
import { StudentLayout } from './layouts/StudentLayout.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { RegisterPage } from './pages/RegisterPage.jsx'
import { DashboardPage } from './pages/admin/DashboardPage.jsx'
import { KnowledgePage } from './pages/admin/KnowledgePage.jsx'
import { ResourcesAdminPage } from './pages/admin/ResourcesAdminPage.jsx'
import { StudentsPage } from './pages/admin/StudentsPage.jsx'
import { ChatPage } from './pages/student/ChatPage.jsx'
import { ResourcesPage } from './pages/student/ResourcesPage.jsx'
import { ProfilePage } from './pages/student/ProfilePage.jsx'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="knowledge" element={<KnowledgePage />} />
          <Route path="resources" element={<ResourcesAdminPage />} />
          <Route path="students" element={<StudentsPage />} />
        </Route>

        <Route
          path="/"
          element={
            <ProtectedRoute roles={["student", "admin"]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ChatPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
