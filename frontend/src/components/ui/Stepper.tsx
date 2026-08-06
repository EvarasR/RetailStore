import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  number: number;
  label: string;
}

interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (stepNumber: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="tt-stepper" style={{ width: '100%', marginBottom: '2rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
        }}
      >
        {steps.map((step, idx) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <React.Fragment key={step.number}>
              <div
                onClick={() => {
                  if (onStepClick && step.number < currentStep) {
                    onStepClick(step.number);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: onStepClick && step.number < currentStep ? 'pointer' : 'default',
                  opacity: step.number > currentStep ? 0.6 : 1,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted
                      ? '#10b981'
                      : isCurrent
                      ? 'var(--tt-color-primary)'
                      : 'var(--tt-color-surface)',
                    color: isCompleted || isCurrent ? '#ffffff' : 'var(--tt-color-text)',
                    border: isCompleted || isCurrent
                      ? 'none'
                      : '1px solid var(--tt-color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isCompleted ? <Check size={16} /> : step.number}
                </div>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent
                      ? 'var(--tt-color-text)'
                      : step.number < currentStep
                      ? '#10b981'
                      : '#64748b',
                  }}
                >
                  {step.label}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  style={{
                    height: '2px',
                    flex: 1,
                    minWidth: '20px',
                    margin: '0 0.5rem',
                    backgroundColor: step.number < currentStep
                      ? '#10b981'
                      : 'var(--tt-color-border)',
                    transition: 'background-color 0.2s ease',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
