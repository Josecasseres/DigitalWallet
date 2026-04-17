# DigitalWallet

Aplicación móvil de billetera digital desarrollada con Ionic + Angular y Firebase como backend. Permite gestionar tarjetas de crédito/débito, realizar pagos simulados, recargar saldo y llevar un historial completo de movimientos.

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Framework | Ionic 8 + Angular 20 |
| Backend / Auth | Firebase Authentication + Firestore |
| Nativo | Capacitor 8 |
| Autenticación biométrica | `capacitor-native-biometric` |
| Notificaciones | `@capacitor/push-notifications` + `@capacitor/local-notifications` |
| Google Sign-In | `@capawesome/capacitor-google-sign-in` |

---

## Funcionalidades

### Autenticación
- Registro con email y contraseña
- Inicio de sesión con email/contraseña o Google
- Login biométrico (huella / Face ID) vinculado a la cuenta del usuario

### Dashboard
- Panel de saldo total con opción de ocultar/mostrar
- Acciones rápidas: Agregar tarjeta, Pagar, Historial, Simular ingreso
- Vista de tarjetas con efecto 3D tilt interactivo
- Selección de tarjeta activa con indicador de puntos
- Editar nombre del titular de una tarjeta
- Recargar saldo (registrado en el historial)
- Eliminar tarjeta con confirmación
- Últimos 3 movimientos en tiempo real
- Modo claro / oscuro con persistencia en `localStorage`

### Tarjetas
- Agregar tarjetas con validación Luhn del número
- Soporte para redes Visa, Mastercard, Amex, Discover
- Previsualización en tiempo real durante el registro

### Pagos (Checkout)
- Selección de tarjeta origen
- Monto, comercio y descripción configurables
- Botón para aleatorizar datos de prueba
- Validación de saldo suficiente con transacción atómica en Firestore

### Simulador de ingresos
- Acredita dinero a una tarjeta seleccionada
- Registra el ingreso en el historial como tipo `deposit`

### Historial de movimientos
- Lista completa con distinción visual entre pagos e ingresos
- Balance neto del periodo (icono y color dinámicos según positivo/negativo)
- Desglose de ingresos vs gastos
- Filtros por tarjeta y por fecha
- Reacciones con emoji: mantener presionado cualquier movimiento (~600 ms) abre un panel con 56 emojis organizados por categorías
- Gráfico de barras decorativo del periodo

---

## Estructura del proyecto

```
src/
├── app/
│   ├── core/
│   │   ├── models/          # WalletCard, Movement, AccountProfile
│   │   └── services/        # AccountService, WalletService, TransactionService,
│   │                        #   ThemeService, FeedbackService, FingerprintService,
│   │                        #   DatabaseService, AlertingService
│   ├── pages/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── dashboard/
│   │   ├── new-card/
│   │   ├── checkout/
│   │   └── movements/
│   └── shared/
│       └── components/
│           ├── wallet-card/          # Tarjeta con efecto 3D tilt
│           ├── balance-panel/        # Panel de saldo total
│           ├── action-grid/          # Botones de acción rápida
│           ├── movement-list/        # Lista de movimientos con hold-to-react
│           ├── content-placeholder/  # Skeletons de carga
│           ├── date-selector/        # Selector de fecha con limpiar
│           └── payment-simulator/    # Modal de ingreso simulado
├── global.scss                       # Tokens de diseño, animaciones, tema claro/oscuro
android/                              # Proyecto Capacitor Android
```

---

## Modelo de datos (Firestore)

```
accounts/{uid}/
  ├── (document)           # Perfil: displayName, biometricEnabled
  ├── cards/{cardId}       # WalletCard: network, lastDigits, cardHolder, availableBalance, ...
  └── movements/{movId}    # Movement: storeName, chargedAmount, timestamp, type, reaction, ...
```

El campo `type` en `Movement` puede ser `'payment'` (pago) o `'deposit'` (ingreso/recarga). Los registros anteriores sin `type` se tratan como pagos.

---

## Instalación y ejecución

### Requisitos
- Node.js 18+
- Ionic CLI: `npm install -g @ionic/cli`
- Android Studio (para compilar APK)

### Pasos

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo web
ionic serve

# Build de producción
ionic build

# Sincronizar con Android
npx cap sync android

# Abrir en Android Studio
npx cap open android
```

> **Firebase:** El proyecto requiere un archivo `google-services.json` en `android/app/` y la configuración correcta en `src/environments/environment.ts`. Estos archivos no se incluyen en el repositorio.

---

## Diseño

Tema neon-glass oscuro con modo claro opcional:

- Paleta principal: púrpura `#7c3aed`, rosa `#ec4899`, cyan `#22d3ee`
- Superficies tipo vidrio esmerilado (`backdrop-filter: blur`)
- Sistema de animaciones: fade-up, scale-pop, card-flip, shimmer, float-orb
- Cambio de tema basado en clases CSS (`body.dw-dark` / `body.dw-light`) con variables CSS como puente hacia Ionic

---

## Autor

**Jose Carlos** — Parcial II · 8vo semestre Ingeniería de Sistemas
