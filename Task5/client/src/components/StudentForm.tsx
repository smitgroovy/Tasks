import { useState, useEffect, FormEvent } from 'react';
import { Student } from '../api/students';

interface StudentFormProps {
  onSubmit: (data: any) => Promise<void>;
  editingStudent: Student | null;
  onCancel: () => void;
}

export default function StudentForm({ onSubmit, editingStudent, onCancel }: StudentFormProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    course: '',
    year: 1,
    sgpa: '',
    status: 'active' as 'active' | 'inactive' | 'graduated',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingStudent) {
      setFormData({
        first_name: editingStudent.first_name,
        last_name: editingStudent.last_name,
        email: editingStudent.email,
        phone: editingStudent.phone || '',
        date_of_birth: editingStudent.date_of_birth?.split('T')[0] || '',
        course: editingStudent.course,
        year: editingStudent.year,
        sgpa: editingStudent.sgpa?.toString() || '',
        status: editingStudent.status,
      });
    }
  }, [editingStudent]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        year: Number(formData.year),
        sgpa: formData.sgpa ? Number(formData.sgpa) : undefined,
        phone: formData.phone || undefined,
        date_of_birth: formData.date_of_birth || undefined,
      });
      if (!editingStudent) {
        setFormData({
          first_name: '', last_name: '', email: '', phone: '',
          date_of_birth: '', course: '', year: 1, sgpa: '', status: 'active',
        });
      }
    } catch {
      // Error is already handled by App.tsx (sets error state)
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="student-form">
      <h2>{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>First Name *</label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Last Name *</label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Date of Birth</label>
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Course *</label>
          <input
            type="text"
            value={formData.course}
            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Year</label>
          <select
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
          >
            {[1, 2, 3, 4, 5, 6].map((y) => (
              <option key={y} value={y}>Year {y}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>SGPA (0-10)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="10"
            value={formData.sgpa}
            onChange={(e) => setFormData({ ...formData, sgpa: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
          </select>
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : editingStudent ? 'Update Student' : 'Add Student'}
        </button>
        {editingStudent && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
