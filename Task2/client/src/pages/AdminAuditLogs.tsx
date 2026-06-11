import { useState, useEffect } from 'react';
import { adminService } from '../services/admin.service';

interface AuditLog {
  _id: string;
  userId: { _id: string; name: string; email: string; role: string };
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ip?: string;
  createdAt: string;
}

export function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    adminService.getAuditLogs({ page, limit: 50 })
      .then((result) => {
        setLogs(result.logs);
        setTotalPages(result.pagination.pages);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const formatAction = (action: string) => {
    return action.replace(/\./g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Audit Logs</h2>
        <p className="text-sm text-ink-muted dark:text-gray-500 mt-1">Track all admin actions</p>
      </div>

      <div className="card overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-dark-border">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-sm text-ink-muted dark:text-gray-500">
              No audit logs found
            </div>
          ) : (
            logs.map((log) => (
              <div key={log._id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      <span className="text-ink dark:text-white">{log.userId?.name || 'Unknown'}</span>
                      {' '}
                      <span className="text-ink-muted dark:text-gray-500">{formatAction(log.action)}</span>
                      {' '}
                      <span className="text-ink dark:text-white">{log.resource}</span>
                    </p>
                    {log.details && (
                      <p className="text-xs text-ink-muted dark:text-gray-500 mt-0.5 font-mono">
                        {JSON.stringify(log.details)}
                      </p>
                    )}
                    {log.ip && (
                      <p className="text-xs text-ink-muted dark:text-gray-500 mt-0.5">IP: {log.ip}</p>
                    )}
                  </div>
                  <span className="text-xs text-ink-muted dark:text-gray-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-ghost text-xs disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-xs text-ink-muted dark:text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-ghost text-xs disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
