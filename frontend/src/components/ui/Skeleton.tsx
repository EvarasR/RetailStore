import React from 'react';

export interface SkeletonProps {
  type?: 'card' | 'line' | 'avatar' | 'title';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  type = 'line',
  width,
  height,
  className = '',
  count = 1,
}) => {
  if (type === 'card') {
    return (
      <div className={`tt-card ${className}`.trim()} style={{ padding: '1rem', height: '380px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="tt-skeleton" style={{ height: '180px', width: '100%', borderRadius: '0.375rem' }} />
        <div className="tt-skeleton" style={{ height: '16px', width: '40%' }} />
        <div className="tt-skeleton" style={{ height: '22px', width: '90%' }} />
        <div className="tt-skeleton" style={{ height: '22px', width: '60%' }} />
        <div className="tt-skeleton" style={{ height: '32px', width: '50%', marginTop: 'auto' }} />
        <div className="tt-skeleton" style={{ height: '40px', width: '100%' }} />
      </div>
    );
  }

  const elements = Array.from({ length: count }, (_, idx) => (
    <div
      key={idx}
      className={`tt-skeleton ${className}`.trim()}
      style={{
        width: width || '100%',
        height: height || (type === 'title' ? '28px' : '16px'),
        marginBottom: count > 1 ? '0.5rem' : 0,
      }}
    />
  ));

  return <>{elements}</>;
};
