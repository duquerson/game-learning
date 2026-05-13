# Carrito de Compras con Descuentos Dinámicos

## Visión General

Módulo de carrito que aplica descuentos en tiempo real combinando múltiples fuentes: volumen, categoría, membrecía premium, cupones y temporada.

---

## 1. Tipos de Descuento

### 1.1 Descuento por Volumen (Cantidad de Items)

| Escala | Descuento |
|--------|-----------|
| 3-5 unidades del mismo producto | 5% |
| 6-10 unidades del mismo producto | 10% |
| 11+ unidades del mismo producto | 15% |
| Carrito completo > $200 | 5% adicional sobre el subtotal |

Configurable por admin (tabla `volume_discounts`).

### 1.2 Descuento por Categoría

- **Electrónica**: 3% (márgenes bajos)
- **Ropa y Accesorios**: 10% (temporada media)
- **Hogar**: 7%
- **Libros**: 15% (promoción permanente)
- **Alimentos**: 0% (márgenes mínimos)
- **Juguetes**: 5-20% (según temporada)

Reglas en tabla `category_discounts` con columna `max_discount` y `active_months`.

### 1.3 Descuento Premium (Usuario)

| Nivel | Beneficio |
|-------|-----------|
| **Silver** | 5% extra + envío gratis > $50 |
| **Gold** | 10% extra + envío gratis |
| **Platinum** | 15% extra + envío gratis + acceso anticipado a ofertas |

Se acumula con otros descuentos (no exclusivo).

### 1.4 Cupones Promocionales

| Tipo | Ejemplo | Regla |
|------|---------|-------|
| Porcentaje | `VERANO20` | 20% OFF, tope $50 |
| Monto fijo | `AHORRO10` | $10 OFF sobre $60+ |
| Envío gratis | `ENVIOFREE` | Sin costo de envío |
| Categoría | `LIBROS25` | 25% OFF solo en libros |
| Primera compra | `BIENVENIDO15` | 15% OFF en primera orden |

Validaciones:
- Fecha de expiración
- Uso máximo por usuario
- Monto mínimo de compra
- Tope de descuento
- Stackable o no con otros cupones

### 1.5 Descuentos por Temporada

| Temporada | Período | Descuento |
|-----------|---------|-----------|
| Black Friday | 25-30 Nov | 20-50% (categorías selectas) |
| Cyber Monday | 1 Dic | 15-40% (electrónica) |
| Buen Fin | 3er fin semana Nov | 10-30% |
| Navidad | 15-25 Dic | 10-25% |
| Hot Sale | 1ra semana Jun | 15-35% |
| Regreso a Clases | Ago | 10-20% (útiles/libros) |
| Día del Niño | 30 Abr | 15-30% (juguetes) |

Reglas en `seasonal_discounts` con `start_date`, `end_date`, `category_override`.

---

## 2. Motor de Descuentos (Discount Engine)

### Orden de Aplicación

```
1. Cupón promocional (si aplica)
2. Descuento por temporada (si aplica)
3. Descuento por categoría
4. Descuento por volumen
5. Descuento premium
```

Cada paso calcula sobre el subtotal restante post-descuentos anteriores. El motor expone:

```
applyDiscounts(cart: Cart, user: User, coupon?: string): DiscountBreakdown
```

### Estructura de respuesta

```typescript
interface DiscountBreakdown {
  subtotal: number
  discounts: DiscountApplied[]
  totalDiscount: number
  total: number
}

interface DiscountApplied {
  type: 'coupon' | 'seasonal' | 'category' | 'volume' | 'premium'
  label: string
  amount: number
  percentage: number
  stackable: boolean
}
```

---

## 3. Reglas de Stacking y Límites

- **Acumulación permitida**: Volumen + Categoría + Premium + Temporada
- **Cupón stackable**: Solo si flag `stackable = true`
- **Tope máximo acumulado**: 60% del subtotal original
- **Tope por cupón**: Definido en `max_discount_amount`
- **Exclusividad**: Si un cupón tiene `exclusive = true`, anula todos los demás descuentos

---

## 4. Vistas UI (Web)

### 4.1 Mini Carrito (Header)
- Ícono con contador de items
- Tooltip con resumen: subtotal, descuentos aplicados, total
- Link a carrito completo

### 4.2 Página de Carrito
- Lista de items con precio unitario, cantidad, subtotal por item
- **Sección de descuentos aplicados**: desglose línea por línea
- Input de cupón con validación en tiempo real (async)
- Temporizador si hay oferta por tiempo limitado
- Resumen final con:
  - Subtotal
  - Descuentos (desglosados)
  - Envío (estimado o gratis si aplica)
  - Total
- Botón "Proceder al pago"

### 4.3 Badges en Productos
- Etiqueta visual cuando aplica descuento por volumen
- "Lleva 3 y paga 2" o "15% OFF al llevar 6+"

---

## 5. Reglas de Negocio Adicionales

- **Máximo de items por orden**: 50 unidades por SKU
- **Cupón + oferta**: Si el cupón da mejor descuento que la oferta activa, se usa el cupón
- **Descuentos no retroactivos**: Al agregar/quitar items, se recalcula desde cero
- **Persistencia**: Carrito guardado en localStorage (anónimo) o DB (usuario logueado)
- **Moneda única**: MXN, con 2 decimales. Redondeo hacia abajo a favor del cliente

---

## 6. Base de Datos (Tablas Clave)

```sql
-- Descuentos por volumen
volume_discounts (id, product_id, min_qty, max_qty, discount_pct, active)

-- Descuentos por categoría
category_discounts (id, category_id, discount_pct, max_discount, active_months, active)

-- Cupones
coupons (id, code, type, value, min_purchase, max_discount, max_uses, max_per_user,
         expires_at, stackable, exclusive, category_id nullable, first_purchase_only, active)

-- Descuentos de temporada
seasonal_discounts (id, name, start_date, end_date, discount_pct, category_id nullable,
                    priority, active)

-- Descuentos premium
premium_tiers (id, name, discount_pct, free_shipping, free_shipping_min, active)

-- Desglose aplicado por orden
order_discounts (id, order_id, type, source_id, label, amount, percentage)
```

---

## 7. Casos de Borde

| Escenario | Comportamiento Esperado |
|-----------|------------------------|
| Cupón expirado | Rechazar con mensaje "Cupón vencido" |
| Cupón usado ya por el usuario | "Ya usaste este cupón" |
| Mínimo de compra no alcanzado | "Agrega $X más para usar este cupón" |
| Producto agotado al pagar | Remover del carrito, notificar |
| Descuentos que exceden el 60% | Cap en 60% del subtotal |
| Usuario sin sesión | No aplica descuento premium, mostrar "Inicia sesión para beneficios" |
| Temporada + Cupón stackable | Se acumulan, respetando topes |
| Cantidad reduce después de aplicar cupón | Recalcular descuento de volumen |
