import { NavLink, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { isAdmin, hasRole } = useAuth();
  const [searchParams] = useSearchParams();
  const isAddStudentActive = searchParams.get('add') === 'true';

  return (
    <aside className="sidebar-nav">
      <nav>
        <NavLink to="/dashboard" end className={({ isActive }) => `nav-link ${isActive && !isAddStudentActive ? 'active' : ''}`}>
          <span className="nav-icon">&#9632;</span>
          Dashboard
        </NavLink>

        {hasRole('admin', 'teacher') && (
          <NavLink to="/dashboard?add=true" className={({ isActive }) => `nav-link ${isActive || isAddStudentActive ? 'active' : ''}`}>
            <span className="nav-icon">&#43;</span>
            Add Student
          </NavLink>
        )}

        {isAdmin && (
          <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">&#9881;</span>
            Admin Panel
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
