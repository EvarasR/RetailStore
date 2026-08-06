import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useCheckout } from '../hooks/useCheckout';
import { useAddresses } from '../hooks/useAddresses';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { CheckoutLayout } from '../components/checkout/CheckoutLayout';
import { CheckoutSessionStep } from '../components/checkout/CheckoutSessionStep';
import { AddressSelector } from '../components/checkout/AddressSelector';
import { AddressForm } from '../components/checkout/AddressForm';
import { ShippingMethodSelector } from '../components/checkout/ShippingMethodSelector';
import { PaymentMethodSelector } from '../components/checkout/PaymentMethodSelector';
import { PaymentCardForm } from '../components/checkout/PaymentCardForm';
import { CheckoutReview } from '../components/checkout/CheckoutReview';
import { CheckoutConfirmation } from '../components/checkout/CheckoutConfirmation';
import { CheckoutSummary } from '../components/checkout/CheckoutSummary';
import { Alert } from '../components/ui/Alert';
import { Skeleton } from '../components/ui/Skeleton';

export const CheckoutPage: React.FC = () => {
  const { autenticado: isAuthenticated, loading: authLoading, usuario, es_prime, roles } = useAuth();
  const { cart, loading: cartLoading, refreshCart } = useCart();
  const {
    step,
    setStep,
    shippingMethods,
    loadingShipping,
    selectedAddressId,
    setSelectedAddressId,
    selectedShippingId,
    setSelectedShippingId,
    selectedPaymentId,
    setSelectedPaymentId,
    createdOrder,
    confirmedPayment,
    error: checkoutError,
    setError: setCheckoutError,
    processing,
    submitCheckout,
  } = useCheckout();

  const {
    addresses,
    loading: loadingAddresses,
    locations,
    loadLocations,
    createAddress,
    deleteAddress,
  } = useAddresses();

  const {
    methods: paymentMethods,
    loading: loadingPayments,
    registerMethod,
  } = usePaymentMethods();

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);

  // Auto-seleccionar dirección predeterminada al cargar
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const pred = addresses.find((a) => a.es_predeterminada);
      setSelectedAddressId(pred ? pred.cod_direccion : addresses[0].cod_direccion);
    }
  }, [addresses, selectedAddressId, setSelectedAddressId]);

  // Auto-seleccionar primer método de pago si no hay uno seleccionado
  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPaymentId) {
      setSelectedPaymentId(paymentMethods[0].cod_metodo_pago);
    }
  }, [paymentMethods, selectedPaymentId, setSelectedPaymentId]);

  if (authLoading || cartLoading) {
    return (
      <div className="tt-container" style={{ padding: '2rem 1.5rem' }}>
        <Skeleton height="80px" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', marginTop: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Skeleton height="200px" />
            <Skeleton height="200px" />
          </div>
          <Skeleton height="350px" />
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar mensaje corporativo elegante
  if (!isAuthenticated) {
    return (
      <CheckoutLayout currentStep={1}>
        <CheckoutSessionStep
          isAuthenticated={false}
          usuario={null}
          es_prime={false}
          roles={[]}
          onNext={() => {}}
        />
      </CheckoutLayout>
    );
  }

  // Si el carrito está vacío y no estamos en confirmación
  if ((!cart || cart.cantidad_items === 0) && step !== 6) {
    return (
      <div className="tt-container" style={{ padding: '3rem 1.5rem', maxWidth: '720px', textAlign: 'center' }}>
        <div
          className="tt-card"
          style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}
        >
          <ShieldAlert size={48} color="#f59e0b" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            Tu Carrito Corporativo está Vacío
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9375rem', maxWidth: '440px', lineHeight: '1.6' }}>
            Para iniciar un proceso de compra o solicitar equipamiento al almacén de TechTail, debes tener productos activos en tu carrito de PostgreSQL.
          </p>
          <Link
            to="/catalogo"
            style={{
              backgroundColor: 'var(--tt-color-primary)',
              color: '#ffffff',
              padding: '0.875rem 1.75rem',
              borderRadius: '0.5rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            Explorar Catálogo TechTail
          </Link>
        </div>
      </div>
    );
  }

  const selectedAddressObj = addresses.find((a) => a.cod_direccion === selectedAddressId);
  const selectedShippingObj = shippingMethods.find((s) => s.cod_metodo_envio === selectedShippingId);
  const selectedPaymentObj = paymentMethods.find((p) => p.cod_metodo_pago === selectedPaymentId);

  const handleConfirmAndPay = async () => {
    const ok = await submitCheckout();
    if (ok) {
      await refreshCart();
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <CheckoutSessionStep
            isAuthenticated={true}
            usuario={usuario || null}
            es_prime={es_prime}
            roles={roles}
            onNext={() => {
              setCheckoutError(null);
              setStep(2);
            }}
          />
        );

      case 2:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <AddressSelector
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              onSelectAddress={(id) => {
                setSelectedAddressId(id);
                setCheckoutError(null);
              }}
              onOpenCreateForm={() => setShowAddressForm(true)}
              onDeleteAddress={async (id) => {
                await deleteAddress(id);
              }}
              loading={loadingAddresses}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  backgroundColor: 'var(--tt-color-surface)',
                  color: 'var(--tt-color-text)',
                  border: '1px solid var(--tt-color-border)',
                  padding: '0.875rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}
              >
                <ArrowLeft size={16} /> Paso anterior: Sesión
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!selectedAddressId) {
                    setCheckoutError('Debes seleccionar una dirección para el cálculo en BD.');
                    return;
                  }
                  setCheckoutError(null);
                  setStep(3);
                }}
                disabled={!selectedAddressId}
                style={{
                  backgroundColor: 'var(--tt-color-primary)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.875rem 1.75rem',
                  borderRadius: '0.5rem',
                  fontWeight: 700,
                  cursor: !selectedAddressId ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: !selectedAddressId ? 0.6 : 1,
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                }}
              >
                Siguiente: Envío <ArrowRight size={18} />
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <ShippingMethodSelector
              methods={shippingMethods}
              selectedMethodId={selectedShippingId}
              onSelectMethod={(id) => {
                setSelectedShippingId(id);
                setCheckoutError(null);
              }}
              loading={loadingShipping}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  backgroundColor: 'var(--tt-color-surface)',
                  color: 'var(--tt-color-text)',
                  border: '1px solid var(--tt-color-border)',
                  padding: '0.875rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}
              >
                <ArrowLeft size={16} /> Paso anterior: Dirección
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!selectedShippingId) {
                    setCheckoutError('Selecciona un método de envío para continuar.');
                    return;
                  }
                  setCheckoutError(null);
                  setStep(4);
                }}
                disabled={!selectedShippingId}
                style={{
                  backgroundColor: 'var(--tt-color-primary)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.875rem 1.75rem',
                  borderRadius: '0.5rem',
                  fontWeight: 700,
                  cursor: !selectedShippingId ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: !selectedShippingId ? 0.6 : 1,
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                }}
              >
                Siguiente: Pago <ArrowRight size={18} />
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <PaymentMethodSelector
              methods={paymentMethods}
              selectedMethodId={selectedPaymentId}
              onSelectMethod={(id) => {
                setSelectedPaymentId(id);
                setCheckoutError(null);
              }}
              onOpenCardForm={() => setShowCardForm(true)}
              loading={loadingPayments}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setStep(3)}
                style={{
                  backgroundColor: 'var(--tt-color-surface)',
                  color: 'var(--tt-color-text)',
                  border: '1px solid var(--tt-color-border)',
                  padding: '0.875rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}
              >
                <ArrowLeft size={16} /> Paso anterior: Envío
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!selectedPaymentId) {
                    setCheckoutError('Debes seleccionar o registrar un método de pago.');
                    return;
                  }
                  setCheckoutError(null);
                  setStep(5);
                }}
                disabled={!selectedPaymentId}
                style={{
                  backgroundColor: 'var(--tt-color-primary)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.875rem 1.75rem',
                  borderRadius: '0.5rem',
                  fontWeight: 700,
                  cursor: !selectedPaymentId ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: !selectedPaymentId ? 0.6 : 1,
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                }}
              >
                Siguiente: Revisión Final <ArrowRight size={18} />
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <CheckoutReview
              cart={cart!}
              address={selectedAddressObj}
              shippingMethod={selectedShippingObj}
              paymentMethod={selectedPaymentObj}
              onConfirmOrder={handleConfirmAndPay}
              processing={processing}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={processing}
                style={{
                  backgroundColor: 'var(--tt-color-surface)',
                  color: 'var(--tt-color-text)',
                  border: '1px solid var(--tt-color-border)',
                  padding: '0.875rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: 700,
                  cursor: processing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}
              >
                <ArrowLeft size={16} /> Volver a modificar Método de Pago
              </button>
            </div>
          </div>
        );

      case 6:
        return (
          <CheckoutConfirmation
            order={createdOrder}
            captureResult={confirmedPayment}
            address={selectedAddressObj}
            paymentMethod={selectedPaymentObj}
          />
        );

      default:
        return null;
    }
  };

  return (
    <CheckoutLayout
      currentStep={step}
      onStepClick={(s) => {
        // Permitir regresar a pasos anteriores si no estamos en step 6 (Confirmado)
        if (s < step && step !== 6 && !processing) {
          setCheckoutError(null);
          setStep(s as any);
        }
      }}
      summary={
        step !== 6 ? (
          <CheckoutSummary
            cart={cart}
            selectedShippingMethod={selectedShippingObj}
          />
        ) : undefined
      }
    >
      {checkoutError && (
        <Alert variant="error" title="Aviso en tu proceso de Checkout" className="mb-4">
          {checkoutError}
        </Alert>
      )}

      {renderStepContent()}

      {/* Modal para Crear Dirección */}
      {showAddressForm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto',
          }}
          onClick={() => setShowAddressForm(false)}
        >
          <div
            style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <AddressForm
              locations={locations}
              onLoadLocations={loadLocations}
              onCreateAddress={async (data) => {
                const res = await createAddress(data);
                if (res.ok && res.cod_direccion) {
                  setSelectedAddressId(res.cod_direccion);
                }
                return res;
              }}
              onClose={() => setShowAddressForm(false)}
            />
          </div>
        </div>
      )}

      {/* Modal para Agregar Tarjeta Simulada */}
      {showCardForm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto',
          }}
          onClick={() => setShowCardForm(false)}
        >
          <div
            style={{ width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <PaymentCardForm
              onRegisterMethod={async (data) => {
                const res = await registerMethod(data);
                if (res.ok && res.cod_metodo_pago) {
                  setSelectedPaymentId(res.cod_metodo_pago);
                }
                return res;
              }}
              onClose={() => setShowCardForm(false)}
            />
          </div>
        </div>
      )}
    </CheckoutLayout>
  );
};
