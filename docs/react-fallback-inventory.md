# Inventario Exacto de Fallbacks

| ID | Archivo | Línea | Fragmento | Clasificación | Ruta destino | Rol | Impacto real | Acción requerida | Fase propuesta |
|---|---|---|---|---|---|---|---|---|---|
| 1 | frontend/src/api/checkout.api.ts | 6 | `cod_metodo_envio?: number,` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 2 | frontend/src/api/checkout.api.ts | 12 | `if (cod_metodo_envio) {` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 3 | frontend/src/api/checkout.api.ts | 13 | `payload.cod_metodo_envio = cod_metodo_envio;` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 4 | frontend/src/api/http.ts | 29 | `// En métodos que alteran el estado, adjuntamos la cookie 'csrftoken' oficial de Django` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 5 | frontend/src/api/membership.api.ts | 10 | `const data = await getJSON<PaymentMethodsResponse>('/operaciones/api/metodos-pago/');` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 6 | frontend/src/api/membership.api.ts | 16 | `cod_metodo_pago: number,` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 7 | frontend/src/api/membership.api.ts | 22 | `cod_metodo_pago,` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 8 | frontend/src/api/payments.api.ts | 10 | `const res = await getJSON<PaymentMethodsData>('/operaciones/api/metodos-pago/');` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 9 | frontend/src/api/payments.api.ts | 11 | `return res.metodos || [];` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 10 | frontend/src/api/payments.api.ts | 20 | `}): Promise<{ ok: boolean; mensaje: string; cod_metodo_pago?: number }> {` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 11 | frontend/src/api/payments.api.ts | 21 | `const res = await postForm<{ ok: boolean; mensaje: string; cod_metodo_pago?: number }>(` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 12 | frontend/src/api/payments.api.ts | 22 | `'/operaciones/api/metodos-pago/registrar/',` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 13 | frontend/src/api/payments.api.ts | 27 | `mensaje: String(res?.mensaje || 'Método de pago registrado.'),` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 14 | frontend/src/api/payments.api.ts | 28 | `cod_metodo_pago: res?.cod_metodo_pago ? Number(res.cod_metodo_pago) : undefined,` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 15 | frontend/src/api/payments.api.ts | 34 | `cod_metodo_pago: number;` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 16 | frontend/src/api/shipping.api.ts | 5 | `const res = await getJSON<ShippingMethodsData>('/operaciones/api/metodos-envio/');` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 17 | frontend/src/api/shipping.api.ts | 6 | `return res.metodos || [];` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 18 | frontend/src/api/supportInternal.api.ts | 32 | `* Carga todos los tickets del sistema consumiendo el módulo corporativo de soporte` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 19 | frontend/src/components/account/AccountSidebar.tsx | 103 | `href="/perfil/"` | LEGACY_DJANGO_ROUTE | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 20 | frontend/src/components/account/AccountSidebar.tsx | 114 | `href="/pedidos/"` | LEGACY_DJANGO_ROUTE | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 21 | frontend/src/components/account/MembershipPanel.tsx | 16 | `metodosPago: PaymentMethodItem[];` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 22 | frontend/src/components/account/MembershipPanel.tsx | 19 | `cod_metodo_pago: number,` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 23 | frontend/src/components/account/MembershipPanel.tsx | 30 | `metodosPago,` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 24 | frontend/src/components/account/MembershipPanel.tsx | 206 | `metodosPago={metodosPago}` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 25 | frontend/src/components/account/MembershipPaymentForm.tsx | 7 | `metodosPago: PaymentMethodItem[];` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 26 | frontend/src/components/account/MembershipPaymentForm.tsx | 10 | `cod_metodo_pago: number,` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 27 | frontend/src/components/account/MembershipPaymentForm.tsx | 18 | `metodosPago,` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 28 | frontend/src/components/account/MembershipPaymentForm.tsx | 25 | `const [selectedMetodo, setSelectedMetodo] = useState<number>(` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 29 | frontend/src/components/account/MembershipPaymentForm.tsx | 26 | `metodosPago[0]?.cod_metodo_pago || 0` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 30 | frontend/src/components/account/MembershipPaymentForm.tsx | 35 | `if (!selectedPlan || !selectedMetodo) {` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 31 | frontend/src/components/account/MembershipPaymentForm.tsx | 36 | `setError('Por favor selecciona un plan y un método de pago válido.');` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 32 | frontend/src/components/account/MembershipPaymentForm.tsx | 43 | `await onPay(selectedPlan, selectedMetodo, renovacion);` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 33 | frontend/src/components/account/MembershipPaymentForm.tsx | 160 | `<label htmlFor="select-metodo-pago" className="tt-label" style={{ display: 'block', marginBottom: '0` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 34 | frontend/src/components/account/MembershipPaymentForm.tsx | 161 | `Método de Pago Corporativo Simulado *` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 35 | frontend/src/components/account/MembershipPaymentForm.tsx | 163 | `{metodosPago.length > 0 ? (` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 36 | frontend/src/components/account/MembershipPaymentForm.tsx | 165 | `id="select-metodo-pago"` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 37 | frontend/src/components/account/MembershipPaymentForm.tsx | 168 | `value={selectedMetodo}` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 38 | frontend/src/components/account/MembershipPaymentForm.tsx | 169 | `onChange={(e) => setSelectedMetodo(Number(e.target.value))}` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 39 | frontend/src/components/account/MembershipPaymentForm.tsx | 172 | `{metodosPago.map((m) => (` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 40 | frontend/src/components/account/MembershipPaymentForm.tsx | 173 | `<option key={m.cod_metodo_pago} value={m.cod_metodo_pago}>` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 41 | frontend/src/components/account/MembershipPaymentForm.tsx | 182 | `No tienes tarjetas corporativas guardadas. Agrega tu primer método simulado en el proceso de Checkou` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 42 | frontend/src/components/account/MembershipPaymentForm.tsx | 205 | `disabled={loading || metodosPago.length === 0}` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 43 | frontend/src/components/admin/AdminFallbackCard.tsx | 4 | `interface AdminFallbackCardProps {` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 44 | frontend/src/components/admin/AdminFallbackCard.tsx | 11 | `export const AdminFallbackCard: React.FC<AdminFallbackCardProps> = ({` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 45 | frontend/src/components/admin/AdminFallbackCard.tsx | 15 | `actionText = 'Abrir Panel Clásico Django',` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 46 | frontend/src/components/admin/AdminInventoryAlerts.tsx | 32 | `Todos los almacenes operan en niveles normales de abastecimiento en PostgreSQL.` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 47 | frontend/src/components/admin/AdminModuleHeader.tsx | 92 | `<span>Abrir Panel Clásico</span>` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 48 | frontend/src/components/admin/AdminProductActions.tsx | 104 | `title="Editar avanzado en Panel Clásico Django"` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 49 | frontend/src/components/admin/AdminSidebar.tsx | 177 | `href="/panel/"` | LEGACY_DJANGO_ROUTE | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 50 | frontend/src/components/admin/AdminSidebar.tsx | 182 | `title="Abre el panel clásico Django para gestión avanzada no implementada en React"` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 51 | frontend/src/components/admin/AdminSidebar.tsx | 184 | `<span>Abrir Panel Clásico</span>` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 52 | frontend/src/components/checkout/CheckoutConfirmation.tsx | 124 | `MÉTODO DE PAGO` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 53 | frontend/src/components/checkout/CheckoutReview.tsx | 32 | `Verifica tus productos, dirección y método antes de crear la orden formal en PostgreSQL.` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 54 | frontend/src/components/checkout/CheckoutReview.tsx | 70 | `<Truck size={14} /> MÉTODO DE ENVÍO` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 55 | frontend/src/components/checkout/CheckoutReview.tsx | 83 | `<div style={{ fontSize: '0.8125rem', color: '#ef4444' }}>Falta seleccionar método de envío</div>` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 56 | frontend/src/components/checkout/PaymentMethodSelector.tsx | 25 | `<CreditCard size={20} color="var(--tt-color-primary)" /> Método de Pago Corporativo (Simulado)` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 57 | frontend/src/components/checkout/PaymentMethodSelector.tsx | 95 | `const isSelected = selectedMethodId === method.cod_metodo_pago;` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 58 | frontend/src/components/checkout/PaymentMethodSelector.tsx | 98 | `key={method.cod_metodo_pago}` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 59 | frontend/src/components/checkout/PaymentMethodSelector.tsx | 99 | `onClick={() => onSelectMethod(method.cod_metodo_pago)}` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 60 | frontend/src/components/checkout/ShippingMethodSelector.tsx | 21 | `<Truck size={20} color="var(--tt-color-primary)" /> Selecciona el Método de Envío` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 61 | frontend/src/components/checkout/ShippingMethodSelector.tsx | 30 | `const isSelected = selectedMethodId === method.cod_metodo_envio;` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 62 | frontend/src/components/checkout/ShippingMethodSelector.tsx | 33 | `key={method.cod_metodo_envio}` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 63 | frontend/src/components/checkout/ShippingMethodSelector.tsx | 34 | `onClick={() => onSelectMethod(method.cod_metodo_envio)}` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 64 | frontend/src/components/layout/Footer.tsx | 119 | `<span>© 2026 TechTail Corporation. Todos los derechos reservados.</span>` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 65 | frontend/src/components/layout/PublicHeader.tsx | 90 | `href="/panel/"` | LEGACY_DJANGO_ROUTE | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 66 | frontend/src/components/layout/PublicHeader.tsx | 103 | `href="/proveedores/"` | LEGACY_DJANGO_ROUTE | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 67 | frontend/src/components/product/ProductCarousel.tsx | 66 | `<span>Ver Todo</span>` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 68 | frontend/src/components/product/ProductGrid.tsx | 50 | `'Verifica tus filtros, intenta usar términos más generales o limpia la búsqueda actual para ver todo` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 69 | frontend/src/components/product/ProductInfo.tsx | 75 | `Todos los precios incluyen impuestos locales según facturación y destino.` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 70 | frontend/src/components/provider/ProviderFilters.tsx | 19 | `statusOptions = ['TODOS', 'ACTIVO', 'INACTIVO'],` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 71 | frontend/src/components/provider/ProviderFilters.tsx | 43 | `<option value="">Todos los Estados</option>` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 72 | frontend/src/components/provider/ProviderFilters.tsx | 45 | `<option key={i} value={st === 'TODOS' ? '' : st}>` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 73 | frontend/src/components/provider/ProviderFilters.tsx | 46 | `{st === 'TODOS' ? 'Todos los Estados' : st}` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 74 | frontend/src/components/provider/ProviderOrderDrawer.tsx | 83 | `href="/proveedores/"` | LEGACY_DJANGO_ROUTE | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 75 | frontend/src/components/provider/ProviderOrderDrawer.tsx | 103 | `href="/panel/"` | LEGACY_DJANGO_ROUTE | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 76 | frontend/src/components/provider/ProviderProductDetailModal.tsx | 174 | `href="/proveedores/"` | LEGACY_DJANGO_ROUTE | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 77 | frontend/src/components/provider/ProviderSidebar.tsx | 69 | `href="/proveedores/"` | LEGACY_DJANGO_ROUTE | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 78 | frontend/src/components/supplierManager/ProcurementDetailDrawer.tsx | 97 | `href="/panel/"` | LEGACY_DJANGO_ROUTE | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 79 | frontend/src/components/supplierManager/SupplierDetailDrawer.tsx | 112 | `href="/panel/"` | LEGACY_DJANGO_ROUTE | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 80 | frontend/src/components/supplierManager/SupplierManagerFilters.tsx | 19 | `statusOptions = ['TODOS', 'ACTIVO', 'INACTIVO'],` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 81 | frontend/src/components/supplierManager/SupplierManagerFilters.tsx | 45 | `<option key={i} value={st === 'TODOS' ? '' : st}>` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 82 | frontend/src/components/supplierManager/SupplierManagerFilters.tsx | 46 | `{st === 'TODOS' ? 'Todos los estados' : st}` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 83 | frontend/src/components/supplierManager/SupplierManagerSidebar.tsx | 78 | `href="/panel/"` | LEGACY_DJANGO_ROUTE | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 84 | frontend/src/components/supplierManager/SupplierManagerSidebar.tsx | 86 | `<span>Panel Clásico (/panel/)</span>` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 85 | frontend/src/components/support/SupportFilters.tsx | 22 | `statusOptions = ['TODOS', 'ABIERTO', 'EN_PROCESO', 'RESUELTO', 'CERRADO'],` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 86 | frontend/src/components/support/SupportFilters.tsx | 49 | `<option value="">Todos los Estados</option>` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 87 | frontend/src/components/support/SupportFilters.tsx | 51 | `<option key={i} value={st === 'TODOS' ? '' : st}>` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 88 | frontend/src/components/support/SupportFilters.tsx | 52 | `{st === 'TODOS' ? 'Todos los Estados' : st}` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 89 | frontend/src/components/support/SupportOrderDrawer.tsx | 159 | `href="/panel/"` | LEGACY_DJANGO_ROUTE | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 90 | frontend/src/components/support/SupportSidebar.tsx | 69 | `href="/panel/"` | LEGACY_DJANGO_ROUTE | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 91 | frontend/src/components/support/SupportSidebar.tsx | 77 | `<span>Panel Clásico (/panel/)</span>` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 92 | frontend/src/components/ui/EmptyState.tsx | 16 | `actionText = 'Ver Todo el Catálogo',` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 93 | frontend/src/components/ui/SearchAutocomplete.tsx | 105 | `<option value="">Todos los departamentos</option>` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 94 | frontend/src/components/ui/SearchAutocomplete.tsx | 206 | `Ver todos los resultados en el Catálogo para "{query}" →` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 95 | frontend/src/components/warehouse/WarehouseFilters.tsx | 25 | `estadosDisponibles = ['TODOS', 'NORMAL', 'CRITICO', 'SIN_STOCK'],` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 96 | frontend/src/components/warehouse/WarehouseFilters.tsx | 51 | `<option value="">Todos los Almacenes</option>` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 97 | frontend/src/components/warehouse/WarehouseFilters.tsx | 69 | `<option key={idx} value={est === 'TODOS' ? '' : est}>` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 98 | frontend/src/components/warehouse/WarehouseFilters.tsx | 70 | `{est === 'TODOS' ? 'Todos los estados' : est}` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 99 | frontend/src/components/warehouse/WarehouseSidebar.tsx | 78 | `href="/panel/"` | LEGACY_DJANGO_ROUTE | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 100 | frontend/src/components/warehouse/WarehouseSidebar.tsx | 86 | `<span>Panel Clásico (/panel/)</span>` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 101 | frontend/src/hooks/useAuth.ts | 49 | `window.location.href = '/logout/';` | HARD_NAVIGATION | / | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 102 | frontend/src/hooks/useCheckout.ts | 34 | `setSelectedShippingId(data[0].cod_metodo_envio);` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 103 | frontend/src/hooks/useCheckout.ts | 37 | `console.error('Error cargando métodos de envío:', err);` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 104 | frontend/src/hooks/useCheckout.ts | 55 | `setError('Por favor selecciona un método de pago.');` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 105 | frontend/src/hooks/useCheckout.ts | 74 | `cod_metodo_pago: selectedPaymentId,` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 106 | frontend/src/hooks/useMembership.ts | 21 | `const [metodosPago, setMetodosPago] = useState<PaymentMethodItem[]>([]);` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 107 | frontend/src/hooks/useMembership.ts | 31 | `fetchPaymentMethods().catch(() => ({ ok: true, metodos: [] })),` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 108 | frontend/src/hooks/useMembership.ts | 42 | `setMetodosPago(resPay.metodos || []);` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 109 | frontend/src/hooks/useMembership.ts | 55 | `cod_metodo_pago: number,` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 110 | frontend/src/hooks/useMembership.ts | 59 | `const res = await payMembership(cod_plan, cod_metodo_pago, renovacion_automatica, idempotency_key);` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 111 | frontend/src/hooks/useMembership.ts | 87 | `metodosPago,` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 112 | frontend/src/hooks/usePaymentMethods.ts | 30 | `const msg = err instanceof Error ? err.message : 'Error al cargar métodos de pago';` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 113 | frontend/src/pages/CatalogPage.tsx | 95 | `onClick={() => window.location.reload()}` | HARD_RELOAD | / | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 114 | frontend/src/pages/CatalogPage.tsx | 181 | `<span>Todos los departamentos</span>` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 115 | frontend/src/pages/CheckoutPage.tsx | 70 | `// Auto-seleccionar primer método de pago si no hay uno seleccionado` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 116 | frontend/src/pages/CheckoutPage.tsx | 73 | `setSelectedPaymentId(paymentMethods[0].cod_metodo_pago);` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 117 | frontend/src/pages/CheckoutPage.tsx | 144 | `const selectedShippingObj = shippingMethods.find((s) => s.cod_metodo_envio === selectedShippingId);` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 118 | frontend/src/pages/CheckoutPage.tsx | 145 | `const selectedPaymentObj = paymentMethods.find((p) => p.cod_metodo_pago === selectedPaymentId);` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 119 | frontend/src/pages/CheckoutPage.tsx | 276 | `setCheckoutError('Selecciona un método de envío para continuar.');` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 120 | frontend/src/pages/CheckoutPage.tsx | 342 | `setCheckoutError('Debes seleccionar o registrar un método de pago.');` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 121 | frontend/src/pages/CheckoutPage.tsx | 400 | `<ArrowLeft size={16} /> Volver a modificar Método de Pago` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 122 | frontend/src/pages/CheckoutPage.tsx | 515 | `if (res.ok && res.cod_metodo_pago) {` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 123 | frontend/src/pages/CheckoutPage.tsx | 516 | `setSelectedPaymentId(res.cod_metodo_pago);` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 124 | frontend/src/pages/DjangoFallbackPage.tsx | 5 | `interface DjangoFallbackPageProps {` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 125 | frontend/src/pages/DjangoFallbackPage.tsx | 11 | `export const DjangoFallbackPage: React.FC<DjangoFallbackPageProps> = ({` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 126 | frontend/src/pages/HomePage.tsx | 46 | `onClick={() => window.location.reload()}` | HARD_RELOAD | / | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 127 | frontend/src/pages/LoginPage.tsx | 18 | `setError('Por favor completa todos los campos.');` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 128 | frontend/src/pages/ProductDetailPage.tsx | 37 | `window.location.href = `/login?next=/producto/${product.cod_producto}`;` | HARD_NAVIGATION | / | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 129 | frontend/src/pages/account/AccountDashboardPage.tsx | 136 | `Ver todos los pedidos →` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 130 | frontend/src/pages/account/AccountDashboardPage.tsx | 258 | `<a href="/perfil/" className="tt-btn tt-btn--secondary" style={{ fontSize: '0.8125rem', padding: '0.` | LEGACY_DJANGO_ROUTE | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 131 | frontend/src/pages/account/AccountDashboardPage.tsx | 262 | `<a href="/pedidos/" className="tt-btn tt-btn--secondary" style={{ fontSize: '0.8125rem', padding: '0` | LEGACY_DJANGO_ROUTE | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 132 | frontend/src/pages/account/MembershipPage.tsx | 13 | `metodosPago,` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 133 | frontend/src/pages/account/MembershipPage.tsx | 37 | `metodosPago={metodosPago}` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 134 | frontend/src/pages/admin/AdminControlPage.tsx | 5 | `import { AdminFallbackCard } from '../../components/admin/AdminFallbackCard';` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 135 | frontend/src/pages/admin/AdminControlPage.tsx | 32 | `<AdminFallbackCard` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 136 | frontend/src/pages/admin/AdminControlPage.tsx | 34 | `description="La configuración profunda granular por permisos y parámetros organizacionales reside en` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 137 | frontend/src/pages/admin/AdminControlPage.tsx | 36 | `actionText="Control Empresarial (Panel Clásico)"` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 138 | frontend/src/pages/admin/AdminCouponsPage.tsx | 5 | `import { AdminFallbackCard } from '../../components/admin/AdminFallbackCard';` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 139 | frontend/src/pages/admin/AdminCouponsPage.tsx | 22 | `<AdminFallbackCard` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 140 | frontend/src/pages/admin/AdminCouponsPage.tsx | 24 | `description="La creación de cupones con reglas por monto mínimo y vigencia está centralizada en el P` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 141 | frontend/src/pages/admin/AdminCouponsPage.tsx | 26 | `actionText="Crear Cupón (Panel Clásico)"` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 142 | frontend/src/pages/admin/AdminInventoryPage.tsx | 52 | `href="/panel/"` | LEGACY_DJANGO_ROUTE | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 143 | frontend/src/pages/admin/AdminInventoryPage.tsx | 58 | `<span>Gestión Avanzada (Panel Clásico)</span>` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 144 | frontend/src/pages/admin/AdminOrdersPage.tsx | 44 | `<option value="">Todos los pedidos</option>` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 145 | frontend/src/pages/admin/AdminPaymentsPage.tsx | 5 | `import { AdminFallbackCard } from '../../components/admin/AdminFallbackCard';` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 146 | frontend/src/pages/admin/AdminPaymentsPage.tsx | 31 | `<AdminFallbackCard` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 147 | frontend/src/pages/admin/AdminPaymentsPage.tsx | 35 | `actionText="Finanzas y Pagos (Panel Clásico)"` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 148 | frontend/src/pages/admin/AdminPrimePage.tsx | 5 | `import { AdminFallbackCard } from '../../components/admin/AdminFallbackCard';` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 149 | frontend/src/pages/admin/AdminPrimePage.tsx | 22 | `<AdminFallbackCard` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 150 | frontend/src/pages/admin/AdminPrimePage.tsx | 24 | `description="La edición de reglas de facturación recurrente y parámetros fiscales Prime se encuentra` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 151 | frontend/src/pages/admin/AdminPrimePage.tsx | 26 | `actionText="Administrar Prime (Panel Clásico)"` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 152 | frontend/src/pages/admin/AdminProcurementPage.tsx | 5 | `import { AdminFallbackCard } from '../../components/admin/AdminFallbackCard';` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 153 | frontend/src/pages/admin/AdminProcurementPage.tsx | 32 | `<AdminFallbackCard` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 154 | frontend/src/pages/admin/AdminProcurementPage.tsx | 36 | `actionText="Crear Orden (Panel Clásico)"` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 155 | frontend/src/pages/admin/AdminProductsPage.tsx | 78 | `<option value="">Todos los estados</option>` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 156 | frontend/src/pages/admin/AdminProductsPage.tsx | 124 | `href="/panel/"` | LEGACY_DJANGO_ROUTE | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 157 | frontend/src/pages/admin/AdminProductsPage.tsx | 131 | `<span>Crear Producto (Panel Clásico)</span>` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 158 | frontend/src/pages/admin/AdminProductsPage.tsx | 159 | `description="Ajusta los criterios de búsqueda o crea un nuevo producto en el panel clásico Django."` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 159 | frontend/src/pages/admin/AdminProductsPage.tsx | 162 | `href="/panel/"` | LEGACY_DJANGO_ROUTE | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 160 | frontend/src/pages/admin/AdminProductsPage.tsx | 168 | `<span>Abrir Panel Clásico</span>` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 161 | frontend/src/pages/admin/AdminPromotionsPage.tsx | 5 | `import { AdminFallbackCard } from '../../components/admin/AdminFallbackCard';` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 162 | frontend/src/pages/admin/AdminPromotionsPage.tsx | 22 | `<AdminFallbackCard` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 163 | frontend/src/pages/admin/AdminPromotionsPage.tsx | 24 | `description="La configuración avanzada de promociones con intervalos de fechas y asociación múltiple` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 164 | frontend/src/pages/admin/AdminPromotionsPage.tsx | 26 | `actionText="Gestionar Campañas (Panel Clásico)"` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 165 | frontend/src/pages/admin/AdminReportsPage.tsx | 5 | `import { AdminFallbackCard } from '../../components/admin/AdminFallbackCard';` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 166 | frontend/src/pages/admin/AdminReportsPage.tsx | 22 | `<AdminFallbackCard` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 167 | frontend/src/pages/admin/AdminReportsPage.tsx | 26 | `actionText="Centro de Reportes (Panel Clásico)"` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 168 | frontend/src/pages/admin/AdminSuppliersPage.tsx | 5 | `import { AdminFallbackCard } from '../../components/admin/AdminFallbackCard';` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 169 | frontend/src/pages/admin/AdminSuppliersPage.tsx | 22 | `<AdminFallbackCard` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 170 | frontend/src/pages/admin/AdminSuppliersPage.tsx | 24 | `description="El alta administrativa y la gestión avanzada de proveedores y usuarios asociados está d` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 171 | frontend/src/pages/admin/AdminSuppliersPage.tsx | 26 | `actionText="Administrar Proveedores (Panel Clásico)"` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 172 | frontend/src/pages/admin/AdminTrackingPage.tsx | 5 | `import { AdminFallbackCard } from '../../components/admin/AdminFallbackCard';` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 173 | frontend/src/pages/admin/AdminTrackingPage.tsx | 40 | `<AdminFallbackCard` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 174 | frontend/src/pages/admin/AdminTrackingPage.tsx | 44 | `actionText="Centro Logístico (Panel Clásico)"` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 175 | frontend/src/pages/provider/ProviderDashboardPage.tsx | 275 | `href="/proveedores/"` | LEGACY_DJANGO_ROUTE | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 176 | frontend/src/pages/provider/ProviderOrdersPage.tsx | 39 | `href="/proveedores/"` | LEGACY_DJANGO_ROUTE | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 177 | frontend/src/pages/provider/ProviderOrdersPage.tsx | 66 | `statusOptions={['TODOS', 'PENDIENTE', 'EN_REVISION', 'APROBADA', 'EN_TRANSITO', 'RECIBIDA']}` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 178 | frontend/src/pages/provider/ProviderProductsPage.tsx | 47 | `href="/proveedores/"` | LEGACY_DJANGO_ROUTE | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 179 | frontend/src/pages/provider/ProviderProductsPage.tsx | 74 | `statusOptions={['TODOS', 'ACTIVO', 'INACTIVO']}` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 180 | frontend/src/pages/supplierManager/SupplierManagerMissingPage.tsx | 141 | `href="/panel/"` | LEGACY_DJANGO_ROUTE | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 181 | frontend/src/pages/supplierManager/SupplierManagerProcurementPage.tsx | 40 | `href="/panel/"` | LEGACY_DJANGO_ROUTE | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 182 | frontend/src/pages/supplierManager/SupplierManagerProcurementPage.tsx | 67 | `statusOptions={['TODOS', 'PENDIENTE', 'EN_REVISION', 'APROBADA', 'EN_TRANSITO', 'RECIBIDA']}` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 183 | frontend/src/pages/supplierManager/SupplierManagerProductsPage.tsx | 60 | `statusOptions={['TODOS', 'ACTIVO', 'INACTIVO']}` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 184 | frontend/src/pages/supplierManager/SupplierManagerSuppliersPage.tsx | 61 | `statusOptions={['TODOS', 'ACTIVO', 'INACTIVO']}` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 185 | frontend/src/pages/support/SupportDashboardPage.tsx | 104 | `Ver Todos →` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 186 | frontend/src/pages/support/SupportIncidentsPage.tsx | 36 | `href="/panel/"` | LEGACY_DJANGO_ROUTE | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 187 | frontend/src/pages/support/SupportIncidentsPage.tsx | 142 | `href="/panel/"` | LEGACY_DJANGO_ROUTE | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 188 | frontend/src/pages/support/SupportOrdersPage.tsx | 41 | `href="/panel/"` | LEGACY_DJANGO_ROUTE | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 189 | frontend/src/pages/support/SupportOrdersPage.tsx | 68 | `statusOptions={['TODOS', 'PENDIENTE', 'PAGADO', 'VERIFICADO', 'CONFIRMADO', 'PREPARANDO', 'LISTO_ENV` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 190 | frontend/src/pages/support/SupportTicketsPage.tsx | 75 | `statusOptions={['TODOS', 'ABIERTO', 'EN_PROCESO', 'RESUELTO', 'CERRADO']}` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 191 | frontend/src/pages/warehouse/WarehouseAlertsPage.tsx | 59 | `estadosDisponibles={['TODOS', 'CRITICA', 'ALTA', 'MEDIA', 'BAJA']}` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 192 | frontend/src/pages/warehouse/WarehouseInventoryPage.tsx | 76 | `estadosDisponibles={['TODOS', 'NORMAL', 'STOCK_CRITICO', 'SIN_STOCK']}` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 193 | frontend/src/pages/warehouse/WarehouseOrdersPage.tsx | 58 | `estadosDisponibles={['TODOS', 'PAGADO', 'VERIFICADO', 'CONFIRMADO', 'EN_PREPARACION', 'PREPARANDO', ` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 194 | frontend/src/routes/AppRouter.tsx | 10 | `import { DjangoFallbackPage } from '../pages/DjangoFallbackPage';` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 195 | frontend/src/routes/AppRouter.tsx | 460 | `<DjangoFallbackPage` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 196 | frontend/src/routes/AppRouter.tsx | 470 | `<DjangoFallbackPage` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 197 | frontend/src/routes/AppRouter.tsx | 480 | `<DjangoFallbackPage` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 198 | frontend/src/routes/AppRouter.tsx | 490 | `<DjangoFallbackPage` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 199 | frontend/src/routes/RoleRoute.tsx | 10 | `fallbackPath?: string;` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 200 | frontend/src/routes/RoleRoute.tsx | 19 | `fallbackPath = '/panel/',` | ADMIN_FALLBACK_COMPONENT | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 201 | frontend/src/routes/RoleRoute.tsx | 20 | `fallbackLabel = 'Abrir Panel Clásico',` | TRUE_DJANGO_FALLBACK | /panel/ | ADMIN | Rompe SPA | Migrar a React nativo | FASE 3 |
| 202 | frontend/src/routes/RoleRoute.tsx | 162 | `href={fallbackPath}` | ADMIN_FALLBACK_COMPONENT | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 203 | frontend/src/types/checkout.types.ts | 2 | `cod_metodo_envio: number;` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 204 | frontend/src/types/checkout.types.ts | 12 | `metodos: ShippingMethod[];` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 205 | frontend/src/types/membership.types.ts | 52 | `cod_metodo_pago: number;` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 206 | frontend/src/types/membership.types.ts | 66 | `metodos: PaymentMethodItem[];` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 207 | frontend/src/types/payment.types.ts | 2 | `cod_metodo_pago: number;` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
| 208 | frontend/src/types/payment.types.ts | 19 | `metodos: PaymentMethod[];` | TODO_FUNCTIONAL | N/A | USER | Rompe SPA | Migrar a React nativo | FASE 3 |
