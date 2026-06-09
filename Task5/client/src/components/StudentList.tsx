import { Student } from '../api/students';

interface StudentListProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (id: number) => void;
}

export default function StudentList({ students, onEdit, onDelete }: StudentListProps) {
  if (students.length === 0) {
    return <div className="empty-state">No students found.</div>;
  }

  return (
    <div className="student-list">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Course</th>
            <th>Year</th>
            <th>SGPA</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.first_name} {student.last_name}</td>
              <td>{student.email}</td>
              <td>{student.course}</td>
              <td>{student.year}</td>
              <td>{student.sgpa != null ? Number(student.sgpa).toFixed(2) : '—'}</td>
              <td>
                <span className={`status-badge ${student.status}`}>
                  {student.status}
                </span>
              </td>
              <td className="actions">
                <button onClick={() => onEdit(student)} className="btn-edit">
                  Edit
                </button>
                <button onClick={() => onDelete(student.id)} className="btn-delete">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
