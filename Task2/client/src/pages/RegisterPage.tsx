import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (error: any) {
      setErr(error.response?.data?.error?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Create account</h1>
          <p className="text-sm text-ink-muted dark:text-gray-500">Start organizing your tasks</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {err && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 text-sm text-red-600 dark:text-red-400">
              {err}
            </div>
          )}
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-sm text-ink-muted dark:text-gray-500 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-ink dark:text-white font-medium hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
