import React, { useState } from 'react';

export interface AdminMutationField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  defaultValue?: string | boolean;
  options?: Array<{ value: string; label: string }>;
}

interface AdminMutationFormProps {
  title: string;
  description: string;
  submitLabel: string;
  fields: AdminMutationField[];
  onSubmit: (values: Record<string, string | boolean>) => Promise<{ mensaje?: string } | void>;
  onSuccess?: () => void | Promise<void>;
}

export const AdminMutationForm: React.FC<AdminMutationFormProps> = ({
  title,
  description,
  submitLabel,
  fields,
  onSubmit,
  onSuccess,
}) => {
  const initialValues = () => Object.fromEntries(fields.map((field) => [field.name, field.defaultValue ?? '']));
  const [values, setValues] = useState<Record<string, string | boolean>>(initialValues);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const result = await onSubmit(values);
      setMessage(result?.mensaje || 'Operación completada correctamente.');
      setValues(initialValues());
      await onSuccess?.();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo completar la operación.');
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="admin-mutation-card" aria-labelledby={`admin-form-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <div className="admin-mutation-card__header">
        <h2 id={`admin-form-${title.replace(/\s+/g, '-').toLowerCase()}`}>{title}</h2>
        <p>{description}</p>
      </div>
      <form className="admin-mutation-form" onSubmit={submit}>
        {fields.map((field) => {
          const value = values[field.name];
          const common = {
            id: `admin-field-${field.name}`,
            name: field.name,
            required: field.required,
            disabled: pending,
          };
          return (
            <label key={field.name} className={field.type === 'checkbox' ? 'admin-mutation-form__check' : ''}>
              <span>{field.label}</span>
              {field.type === 'textarea' ? (
                <textarea
                  {...common}
                  value={String(value)}
                  placeholder={field.placeholder}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                />
              ) : field.type === 'select' ? (
                <select
                  {...common}
                  value={String(value)}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                >
                  <option value="">Selecciona…</option>
                  {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              ) : field.type === 'checkbox' ? (
                <input
                  {...common}
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.checked }))}
                />
              ) : (
                <input
                  {...common}
                  type={field.type || 'text'}
                  value={String(value)}
                  placeholder={field.placeholder}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                />
              )}
            </label>
          );
        })}
        <div className="admin-mutation-form__footer">
          <button type="submit" className="admin-primary-button" disabled={pending}>
            {pending ? 'Procesando…' : submitLabel}
          </button>
          {message && <p className="admin-form-message admin-form-message--success" role="status">{message}</p>}
          {error && <p className="admin-form-message admin-form-message--error" role="alert">{error}</p>}
        </div>
      </form>
    </section>
  );
};
