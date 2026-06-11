import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import StudentForm from '../components/StudentForm';
import StudentList from '../components/StudentList';
import { studentApi, Student, Stats } from '../api/students';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(searchParams.get('add') === 'true');

  const canEdit = hasRole('admin', 'teacher');
  const canDelete = hasRole('admin');

  useEffect(() => {
    setShowForm(searchParams.get('add') === 'true');
  }, [searchParams]);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await studentApi.getAll({
        search: search || undefined,
        course: filterCourse || undefined,
        status: filterStatus || undefined,
      });
      setStudents(res.data || []);
    } catch (err) {
      console.error('Failed to load students:', err);
      setError(err instanceof Error ? err.message : 'Failed to load students');
    }
  }, [search, filterCourse, filterStatus]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await studentApi.getStats();
      setStats(res.data || null);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchStudents(), fetchStats()]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchStudents, fetchStats]);

  const handleSubmit = async (data: any) => {
    try {
      if (editingStudent) {
        await studentApi.update(editingStudent.id, data);
        setEditingStudent(null);
        setSearchParams({}, { replace: true });
      } else {
        await studentApi.create(data);
        setSearchParams({}, { replace: true });
      }
      await fetchStudents();
      await fetchStats();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save student';
      setError(msg);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await studentApi.delete(id);
      await fetchStudents();
      await fetchStats();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete student';
      setError(msg);
    }
  };

  const courses = [...new Set(students.map((s) => s.course))];

  if (loading) return (
    <div className="loading">
      <div className="loading-spinner"></div>
      <span>Loading dashboard...</span>
    </div>
  );

  return (
    <>
      <div className="dashboard-header">
        <div>
          <h2>Dashboard</h2>
          <p className="text-muted">Welcome back, {user?.first_name}! Manage student records below.</p>
        </div>
        {canEdit && (
          <button onClick={() => { setEditingStudent(null); setSearchParams(showForm ? {} : { add: 'true' }, { replace: true }); }} className="btn-primary">
            {showForm ? 'Close Form' : '+ Add Student'}
          </button>
        )}
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.active}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.graduated}</div>
            <div className="stat-label">Graduated</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.averageSgpa}</div>
            <div className="stat-label">Avg SGPA</div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="form-section">
          <StudentForm
            onSubmit={handleSubmit}
            editingStudent={editingStudent}
            onCancel={() => { setEditingStudent(null); setSearchParams({}, { replace: true }); }}
          />
        </div>
      )}

      <div className="filters">
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="graduated">Graduated</option>
        </select>
      </div>

      {error && (
        <div className="error" onClick={() => setError(null)}>
          {error} (click to dismiss)
        </div>
      )}

      <StudentList
        students={students}
        onEdit={canEdit ? (s) => { setEditingStudent(s); setSearchParams({ add: 'true' }, { replace: true }); } : () => {}}
        onDelete={canDelete ? handleDelete : () => {}}
      />
    </>
  );
}
