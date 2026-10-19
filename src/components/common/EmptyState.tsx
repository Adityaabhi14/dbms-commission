import React, { ReactNode } from 'react';
import { Music2 } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <div
      style={{
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.85rem'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--brand-primary-light)',
          color: 'var(--brand-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.5rem'
        }}
      >
        {icon || <Music2 size={28} />}
      </div>
      <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>{title}</h4>
      <p style={{ maxWidth: '400px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        {description}
      </p>
      {actionText && onAction && (
        <div style={{ marginTop: '0.5rem' }}>
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
