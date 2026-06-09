import { useState, useEffect } from 'react';
import StudentForm from './components/StudentForm';
import StudentList from './components/StudentList';
import { studentApi, Student, Stats } from './api/students';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchStudents = async () => {
    try {
      const res = await studentApi.getAll({
        search: search || undefined,
        course: filterCourse || undefined,
        status: filterStatus || undefined,
      });
      if (res.success) setStudents(res.data);
    } catch (err) {
      setError('Failed to load students');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await studentApi.getStats();
      if (res.success) setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats');
    }
  };

  useEffect(() => {
    Promise.all([fetchStudents(), fetchStats()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [search, filterCourse, filterStatus]);

  const handleSubmit = async (data: any) => {
    if (editingStudent) {
      await studentApi.update(editingStudent.id, data);
      setEditingStudent(null);
    } else {
      await studentApi.create(data);
    }
    fetchStudents();
    fetchStats();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    await studentApi.delete(id);
    fetchStudents();
    fetchStats();
  };

  const courses = [...new Set(students.map((s) => s.course))];

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Student Management</h1>
        <p>Manage student records, track progress, and monitor enrollment.</p>
      </header>

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
            <div className="stat-number">{stats.averageGpa}</div>
            <div className="stat-label">Avg GPA</div>
          </div>
        </div>
      )}

      <div className="main-layout">
        <aside className="sidebar">
          <StudentForm
            onSubmit={handleSubmit}
            editingStudent={editingStudent}
            onCancel={() => setEditingStudent(null)}
          />
        </aside>

        <main className="content">
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

          {error && <div className="error">{error}</div>}

          <StudentList
            students={students}
            onEdit={setEditingStudent}
            onDelete={handleDelete}
          />
        </main>
      </div>
    </div>
  );
}
