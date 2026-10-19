import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1 && totalItems <= itemsPerPage) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.25rem',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}
    >
      <div>
        Showing <strong style={{ color: 'var(--text-primary)' }}>{startItem}</strong> to{' '}
        <strong style={{ color: 'var(--text-primary)' }}>{endItem}</strong> of{' '}
        <strong style={{ color: 'var(--text-primary)' }}>{totalItems}</strong> entries
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          icon={<ChevronLeft size={16} />}
          aria-label="Previous page"
        >
          Previous
        </Button>
        <span style={{ padding: '0 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {currentPage} / {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          icon={<ChevronRight size={16} />}
          iconPosition="right"
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </div>
  );
};
