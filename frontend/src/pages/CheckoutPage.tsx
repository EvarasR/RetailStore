import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useCheckout, CheckoutStep } from '../hooks/useCheckout';
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
import { postForm } from '../api/http';

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
    setCreatedOrder,
    confirmedPayment,
    error: checkoutError,
    setError: setCheckoutError,
    processing,
    handleCreateOrder,
    handlePay,
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

  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

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

  const currentNumericStep = useMemo(() => {
    if (!isAuthenticated) return 1;
    switch (step) {
      case 'CART':
      case 'ADDRESS': return 2;
      case 'SHIPPING': return 3;
      case 'PAYMENT_METHOD': return 4;
      case 'REVIEW': return 5;
      case 'CREATING_ORDER':
      case 'ORDER_CREATED':
      case 'APPLYING_COUPON':
      case 'READY_TO_PAY':
      case 'AUTHORIZING':
      case 'AUTHORIZED':
      case 'CAPTURING':
      case 'PAYMENT_DECLINED':
      case 'ERROR':
        return 5;
      case 'COMPLETED': return 6;
      default: return 2;
    }
  }, [isAuthenticated, step]);

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

  // Si el carrito está vacío y no hay pedido recuperado/creado, detener checkout
  if ((!cart || cart.cantidad_items === 0) && currentNumericStep !== 6 && !createdOrder) {
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

  const handleApplyCoupon = async () => {
    if (!createdOrder?.cod_pedido) return;
    if (!couponCode.trim()) {
      setCheckoutError('Introduce un código de cupón válido.');
      return;
    }
    try {
      setApplyingCoupon(true);
      setCheckoutError(null);
      const res = await postForm<any>(`/api/pedidos/${createdOrder.cod_pedido}/cupon/`, {
        codigo_cupon: couponCode.trim(),
      });
      if (res.ok) {
        // Actualizamos importando del backend
        setCreatedOrder({
          ...createdOrder,
          subtotal: res.subtotal,
          descuento: res.descuento,
          impuesto: res.impuesto,
          costo_envio: res.costo_envio,
          total: res.total,
        });
        setCouponCode('');
      } else {
        setCheckoutError(res.mensaje || 'Error al aplicar cupón');
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'Error al aplicar el cupón');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'ADDRESS':
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  if (!selectedAddressId) {
                    setCheckoutError('Debes seleccionar una dirección para el cálculo en BD.');
                    return;
                  }
                  setCheckoutError(null);
                  setStep('SHIPPING');
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

      case 'SHIPPING':
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
                onClick={() => setStep('ADDRESS')}
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
                  setStep('PAYMENT_METHOD');
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

      case 'PAYMENT_METHOD':
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
                onClick={() => setStep('SHIPPING')}
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
                  setStep('REVIEW');
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

      case 'REVIEW':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <CheckoutReview
              cart={cart!}
              address={selectedAddressObj}
              shippingMethod={selectedShippingObj}
              paymentMethod={selectedPaymentObj}
              onConfirmOrder={async () => {
                const ok = await handleCreateOrder();
                if (ok) {
                  await refreshCart(); // Vacía el carrito localmente
                }
              }}
              processing={processing}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setStep('PAYMENT_METHOD')}
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

      case 'CREATING_ORDER':
        return (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Skeleton height="150px" />
            <h3 style={{ marginTop: '1rem' }}>Creando Pedido en PostgreSQL...</h3>
          </div>
        );

      case 'ORDER_CREATED':
      case 'APPLYING_COUPON':
      case 'READY_TO_PAY':
      case 'AUTHORIZING':
      case 'AUTHORIZED':
      case 'CAPTURING':
      case 'PAYMENT_DECLINED':
      case 'ERROR':
        // Pantalla de Resumen Post-Pedido Oficial DB-First
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="tt-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <CheckCircle2 size={32} color="#10b981" />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Pedido Oficial #{createdOrder?.cod_pedido} Creado</h3>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>El pedido ha sido materializado en PostgreSQL. Ya no puedes alterar su contenido directamente.</p>
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid var(--tt-color-border)', paddingTop: '1.5rem' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Resumen del Pedido DB-First</h4>
                <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9375rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <span>{createdOrder?.subtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Envío:</span>
                    <span>{createdOrder?.costo_envio}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Descuento:</span>
                    <span style={{ color: '#10b981' }}>{createdOrder?.descuento}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.125rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--tt-color-border)' }}>
                    <span>Total Final:</span>
                    <span>{createdOrder?.total}</span>
                  </div>
                </div>
              </div>

              {step !== 'AUTHORIZING' && step !== 'CAPTURING' && (
                <div style={{ marginTop: '2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>¿Tienes un cupón de descuento?</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={applyingCoupon}
                      placeholder="Ej: TECHTAIL2026"
                      style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--tt-color-border)', backgroundColor: 'var(--tt-color-surface)' }}
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode}
                      style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', backgroundColor: 'var(--tt-color-primary)', color: 'white', fontWeight: 600, border: 'none', cursor: applyingCoupon || !couponCode ? 'not-allowed' : 'pointer' }}
                    >
                      {applyingCoupon ? 'Aplicando...' : 'Aplicar'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handlePay}
              disabled={processing || applyingCoupon}
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontWeight: 800,
                fontSize: '1.125rem',
                cursor: processing || applyingCoupon ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              }}
            >
              {step === 'AUTHORIZING' ? 'Autorizando Pago...' : step === 'CAPTURING' ? 'Capturando Pago...' : `Confirmar Pago de ${createdOrder?.total}`}
            </button>
          </div>
        );

      case 'COMPLETED':
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
      currentStep={currentNumericStep}
      summary={
        currentNumericStep !== 6 && currentNumericStep < 5 ? (
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
      
      {step === 'PAYMENT_DECLINED' && (
        <Alert variant="warning" title="Pago Rechazado por la Pasarela" className="mb-4">
          El pago no pudo ser autorizado. Tu pedido #{createdOrder?.cod_pedido} está guardado de forma segura. Selecciona o agrega un nuevo método de pago e inténtalo de nuevo.
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
