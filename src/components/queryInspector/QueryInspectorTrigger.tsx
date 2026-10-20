import React from 'react';
import { useQueryInspector } from '../../context/QueryInspectorContext';
import { Database, X, Eye, Sparkles } from 'lucide-react';

export const QueryInspectorTrigger: React.FC = () => {
  const {
    isOpen,
    toggleOpen,
    setIsOpen,
    totalQueriesCount,
    queryToast,
    dismissQueryToast
  } = useQueryInspector();

  return (
    <>
      {/* 1. Instant Floating Toast Pill on Button Click */}
      {queryToast && !isOpen && (
        <div className="dbms-toast-pill" role="status" aria-live="polite">
          <div className="dbms-toast-pill-content">
            <div className="dbms-toast-pill-meta">
              <span style={{ color: '#10B981', fontWeight: 800 }}>⚡ DBMS QUERY RUNNING</span>
              <span>•</span>
              <span>{queryToast.executionTimeMs}ms</span>
            </div>
            <div className="dbms-toast-pill-title">
              {queryToast.sourceButton}
            </div>
            <div className="dbms-toast-pill-sql">
              {queryToast.sql.replace(/\s+/g, ' ').slice(0, 50)}...
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              onClick={() => {
                dismissQueryToast();
                setIsOpen(true);
              }}
              className="dbms-mini-btn"
              style={{
                backgroundColor: 'rgba(198, 84, 195, 0.25)',
                borderColor: '#C654C3',
                color: '#FFFFFF',
                padding: '0.35rem 0.65rem'
              }}
              title="Inspect full SQL query"
            >
              <Eye size={13} />
              <span>View SQL</span>
            </button>

            <button
              onClick={dismissQueryToast}
              className="dbms-icon-btn"
              style={{ padding: '0.2rem' }}
              aria-label="Dismiss toast"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 2. Floating Launcher Trigger Button */}
      <button
        onClick={toggleOpen}
        className="dbms-floating-trigger"
        aria-label="Open DBMS Live Query Inspector"
        title="DBMS Live Query Monitor — Inspect database queries running behind every button"
      >
        <div className="dbms-trigger-icon-pulse">
          <Database size={18} />
          <div className="dbms-pulse-ring" />
        </div>

        <span>DBMS Queries</span>

        <span className="dbms-trigger-badge" title={`${totalQueriesCount} total queries executed`}>
          {totalQueriesCount}
        </span>
      </button>
    </>
  );
};
