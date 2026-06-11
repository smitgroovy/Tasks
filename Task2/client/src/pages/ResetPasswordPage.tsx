import { useState, FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useToast } from '../context/ToastContext';

export function ResetPasswordPage() {
  const { success: showSuccess, error: showError } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      showError('Invalid reset link');
      return;
    }
    if (password !== confirm) {
      showError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      showError('Password must be at least 8 characters');
      return;
    }

    setSubmitting(true);
    try {
      await authService.resetPassword(token, password);
      setDone(true);
      showSuccess('Password reset successful');
    } catch (err: any) {
      showError(err?.response?.data?.error?.message || 'Reset failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-dark px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold tracking-tight">Set new password</h1>
          <p className="text-sm text-ink-muted dark:text-gray-500 mt-2">
            {done ? 'Your password has been updated' : 'Enter your new password'}
          </p>
        </div>

        {!done ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="password">New password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="At least 8 characters"
                required
                minLength={8}
                autoFocus
              />
            </div>

            <div>
              <label className="label" htmlFor="confirm">Confirm password</label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input"
                placeholder="Repeat your password"
                required
                minLength={8}
              />
            </div>

            <button type="submit" disabled={submitting || !token} className="btn-primary w-full">
              {submitting ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        ) : (
          <Link to="/login" className="btn-primary w-full text-center block">
            Sign in with new password
          </Link>
        )}
      </div>
    </div>
  );
}
