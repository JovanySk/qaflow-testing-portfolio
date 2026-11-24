# QAFlow — Aplicación de manufactura

Aplicación mínima Node.js, Express, HTML, CSS, JavaScript y MySQL. Su único propósito es funcionar como **sistema simplificado utilizado como objeto de pruebas** para el portafolio QAFlow.

## Alcance implementado

- Login exitoso.
- Login incorrecto.
- Validación de campos de login vacíos.
- Consulta de productos.
- Creación de productos.
- Rechazo de SKU duplicado.
- Registro de entradas de inventario.
- Rechazo de salidas con stock insuficiente.

## Requisitos

- Node.js 20 o superior.
- Docker Desktop con contenedores Linux habilitados.
- Imagen `mysql:8.0` disponible en Docker.

## Configuración

El MySQL de QAFlow se ejecuta en un contenedor separado del MySQL instalado en el equipo. El contenedor persistente se crea una sola vez:

```powershell
docker run --detach --name qaflow-mysql --restart unless-stopped --publish 127.0.0.1:3307:3306 --env MYSQL_ROOT_PASSWORD=change_me_root --env MYSQL_DATABASE=qaflow_sut --volume qaflow_mysql_data:/var/lib/mysql mysql:8.0
```

En usos posteriores basta con:

```powershell
docker start qaflow-mysql
```

Después, desde `09_Sistema_Bajo_Prueba/api`:

```powershell
npm ci
npm start
```

El archivo `.env` incluido en el directorio de trabajo conecta Express con `127.0.0.1:3307/qaflow_sut`. La aplicación crea su esquema y los datos semilla de forma idempotente.

Página web y API: `http://127.0.0.1:3000`

No abras `web/index.html` mediante Live Server o el puerto 5500. Ese servidor solo entrega archivos y responderá HTTP 405 al `POST /api/auth/login`. La pantalla debe abrirse desde Express en el puerto 3000.

Credencial inicial del objeto de pruebas:

- Usuario: `qa.admin`
- Contraseña: `QaflowDemo#2026`

## Endpoints

| Método | Endpoint | Propósito |
|---|---|---|
| GET | `/api/health` | Estado de API y conexión MySQL |
| POST | `/api/auth/login` | Autenticación |
| POST | `/api/auth/logout` | Cierre de sesión |
| GET | `/api/products` | Consulta de productos |
| POST | `/api/products` | Creación de producto |
| POST | `/api/inventory/movements` | Entrada o salida de inventario |

Los endpoints protegidos requieren `Authorization: Bearer <token>`. Los errores usan una estructura común con `code` y `message` para facilitar las validaciones posteriores de API.

## Automatización Cypress

Cypress es una suite externa de automatización; no se ejecuta al presionar el botón de inicio de sesión. Las pruebas abren la aplicación, completan los campos mediante `data-cy`, interceptan las solicitudes y verifican las respuestas.

Con Express disponible en `http://127.0.0.1:3000`, ejecuta desde `05_Automatizacion_Cypress`:

```powershell
npm ci
npm run cy:run
```

La especificación se encuentra en `cypress/e2e/login.cy.js` y cubre login exitoso, credenciales incorrectas, campos vacíos y cierre de sesión.

## Límites intencionales

No contiene módulos completos de Pedidos, BOM, Órdenes de Producción o Inspecciones de Calidad. Esos dominios forman parte de la cobertura documental del portafolio, pero no se implementan como módulos empresariales en esta aplicación mínima.
