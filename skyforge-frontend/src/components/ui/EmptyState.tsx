import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  message?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
}

export default function EmptyState({
  title,
  message,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="empty">
      {icon != null && <div className="empty__icon">{icon}</div>}
      <h3 className="empty__title">{title}</h3>
      {message != null && <p className="empty__msg">{message}</p>}
      {action != null && <div className="empty__action">{action}</div>}
    </div>
  );
}
