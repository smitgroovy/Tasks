import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useToast } from '../context/ToastContext';

export function ForgotPasswordPage() {
  const { success: showSuccess, error: showError } = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      showSuccess('If the email exists, a reset link has been sent');
    } catch (err: any) {
      showError(err?.response?.data?.error?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-dark px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
          <p className="text-sm text-ink-muted dark:text-gray-500 mt-2">
            {sent ? 'Check your email for a reset link' : 'Enter your email and we\'ll send you a reset link'}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        ) : (
          <Link to="/login" className="btn-primary w-full text-center block">
            Back to sign in
          </Link>
        )}

        <p className="text-center text-sm text-ink-muted dark:text-gray-500 mt-8">
          Remember your password?{' '}
          <Link to="/login" className="text-ink dark:text-white font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
