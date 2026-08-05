import React from 'react';
import { Stepper } from '../ui/Stepper';
import type { StepItem } from '../ui/Stepper';

interface CheckoutStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const CHECKOUT_STEPS: StepItem[] = [
  { number: 1, label: 'Sesión' },
  { number: 2, label: 'Dirección' },
  { number: 3, label: 'Envío' },
  { number: 4, label: 'Pago' },
  { number: 5, label: 'Revisión' },
  { number: 6, label: 'Confirmación' },
];

export const CheckoutStepper: React.FC<CheckoutStepperProps> = ({
  currentStep,
  onStepClick,
}) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <Stepper
        steps={CHECKOUT_STEPS}
        currentStep={currentStep}
        onStepClick={onStepClick}
      />
    </div>
  );
};
