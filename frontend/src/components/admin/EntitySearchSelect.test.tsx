import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EntitySearchSelect } from './EntitySearchSelect';

describe('EntitySearchSelect', () => {
  it('busca por datos humanos y devuelve la referencia interna seleccionada', () => {
    const onChange = vi.fn();
    render(<EntitySearchSelect label="Proveedor" value={null} onChange={onChange} options={[
      { value: 10, label: 'Distribuidora Andina', description: 'RUC 0990001112' },
      { value: 20, label: 'Hardware del Pacífico', description: 'RUC 0990002223' },
    ]} />);
    fireEvent.click(screen.getByRole('button', { name: /buscar o seleccionar/i }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar Proveedor' }), { target: { value: 'Pacífico' } });
    expect(screen.queryByText('Distribuidora Andina')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: /Hardware del Pacífico/i }));
    expect(onChange).toHaveBeenCalledWith(20);
  });
});
