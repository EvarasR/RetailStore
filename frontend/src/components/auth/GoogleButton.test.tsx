import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GoogleButton } from './GoogleButton';
import { authenticateGoogle, prepareGoogle } from '../../api/googleAuth.api';

vi.mock('../../api/googleAuth.api', () => ({
  prepareGoogle: vi.fn(),
  authenticateGoogle: vi.fn(),
}));

describe('GoogleButton', () => {
  afterEach(() => {
    vi.clearAllMocks();
    delete window.google;
  });

  it('usa state y nonce del backend antes de autenticar la credencial', async () => {
    let callback: ((value: { credential?: string }) => void) | undefined;
    vi.mocked(prepareGoogle).mockResolvedValue({
      ok: true, state: 'state-servidor', nonce: 'nonce-servidor', client_id: 'client-id',
    });
    vi.mocked(authenticateGoogle).mockResolvedValue({ ok: true, autenticado: true });
    const onSuccess = vi.fn();
    window.google = {
      accounts: { id: {
        initialize: vi.fn((options: Record<string, unknown>) => { callback = options.callback as typeof callback; }),
        renderButton: vi.fn((element: HTMLElement) => { element.textContent = 'Continuar con Google'; }),
        cancel: vi.fn(),
      } },
    };

    render(<GoogleButton onSuccess={onSuccess} onError={vi.fn()} />);
    expect(await screen.findByText('Continuar con Google')).toBeInTheDocument();
    expect(window.google.accounts.id.initialize).toHaveBeenCalledWith(expect.objectContaining({ nonce: 'nonce-servidor' }));
    await act(async () => { await callback?.({ credential: 'id-token-opaco' }); });
    await waitFor(() => expect(authenticateGoogle).toHaveBeenCalledWith('id-token-opaco', 'state-servidor'));
    expect(onSuccess).toHaveBeenCalled();
  });

  it('muestra cancelación sin enviar una credencial vacía', async () => {
    let callback: ((value: { credential?: string }) => void) | undefined;
    vi.mocked(prepareGoogle).mockResolvedValue({ ok: true, state: 's', nonce: 'n', client_id: 'client-id' });
    const onError = vi.fn();
    window.google = {
      accounts: { id: {
        initialize: vi.fn((options: Record<string, unknown>) => { callback = options.callback as typeof callback; }),
        renderButton: vi.fn((element: HTMLElement) => { element.textContent = 'Continuar con Google'; }),
        cancel: vi.fn(),
      } },
    };
    render(<GoogleButton onSuccess={vi.fn()} onError={onError} />);
    await screen.findByText('Continuar con Google');
    act(() => callback?.({}));
    expect(onError).toHaveBeenCalledWith('Inicio con Google cancelado.');
    expect(authenticateGoogle).not.toHaveBeenCalled();
  });
});
