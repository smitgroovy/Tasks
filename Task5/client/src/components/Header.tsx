import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-left">
        <h1>StudentHub</h1>
        <span className="header-subtitle">Student Management SaaS</span>
      </div>
      <div className="header-right">
        {user && (
          <>
            <span className="header-user">
              {user.first_name} {user.last_name}
              <span className={`role-badge role-${user.role}`}>{user.role}</span>
            </span>
            <button onClick={logout} className="btn-logout">Logout</button>
          </>
        )}
      </div>
    </header>
  );
}
