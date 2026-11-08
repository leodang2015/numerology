# Guía de archivos del proyecto de numerología

Esta guía explica la estructura y el propósito de los archivos propios del proyecto. Describe el código que existe en el repositorio, incluyendo las funciones de IA para lecturas y compatibilidad.

## 1. Resumen del proyecto

El proyecto es una API web construida con Node.js y Express. Utiliza MongoDB mediante Mongoose para guardar usuarios, perfiles numerológicos, análisis de compatibilidad, lecturas y registros de auditoría. También utiliza Gemini para generar lecturas numerológicas y análisis de compatibilidad.

El recorrido general de una petición es:

1. `index.js` inicia Express, carga la configuración y monta los routers.
2. Un archivo de `src/routers/` encuentra la ruta HTTP solicitada.
3. Si corresponde, se ejecutan middlewares y validadores.
4. Un controlador de `src/controllers/` aplica la lógica y consulta el modelo.
5. Un modelo de `src/models/` define la forma de los documentos de MongoDB.
6. Para las funciones con IA, un servicio de `src/services/` llama a Gemini.
7. El controlador devuelve una respuesta JSON al cliente.

La aplicación es una API; en los archivos revisados no aparece una interfaz web o aplicación de frontend.

## 2. Archivos de la raíz

| Archivo | Propósito |
|---|---|
| [`index.js`](./index.js) | Punto de entrada. Carga `dotenv`, crea la aplicación Express, habilita la lectura de JSON, monta las rutas `/api/v1`, configura respuestas para rutas inexistentes y errores, conecta con MongoDB y luego inicia el servidor. Usa el puerto `PORT` o `1799` si no está definido. |
| [`package.json`](./package.json) | Manifiesto del proyecto: nombre, versión, uso de módulos ES, scripts y paquetes requeridos. `npm start` ejecuta `node index.js`; `npm run dev` ejecuta Nodemon. Entre las dependencias principales están Express, Mongoose, el SDK de Gemini, dotenv, express-validator y JWT/Bcrypt declarados por el proyecto. |
| [`package-lock.json`](./package-lock.json) | Bloquea las versiones concretas del árbol de dependencias para que las instalaciones sean reproducibles. Se actualiza con el gestor de paquetes; no suele editarse manualmente. |
| [`.env.example`](./.env.example) | Plantilla de variables de configuración. Enumera `PORT`, `MONGODB_URI`, `GEMINI_API_KEY`, `GEMINI_MODEL` y `SECRETORPRIVATEKEY`, sin proporcionar valores secretos. Puede copiarse a `.env` y completarse localmente. |
| [`.env`](./.env) | Archivo local de configuración real, que puede contener credenciales y claves. No se documentan ni reproducen aquí sus valores. No se debe compartir ni subir al repositorio. |
| [`.gitignore`](./.gitignore) | Indica a Git que ignore `.env` y `node_modules/`, evitando versionar secretos y paquetes instalados. |
| [`EXPLICACION-ARCHIVOS.md`](./EXPLICACION-ARCHIVOS.md) | Este documento. Describe el propósito de los archivos y el funcionamiento general. |
| [`POSTMAN.md`](./POSTMAN.md) | Guía práctica de Postman con ejemplos de solicitudes y JSON para cada router de la API. |
| [`FLUJO-PETICIONES.md`](./FLUJO-PETICIONES.md) | Explica las relaciones entre documentos, el formato de las peticiones, sus respuestas esperadas y cómo se escriben los cambios en MongoDB. |

## 3. Conexión a la base de datos

### `src/DataBase/cnxmongo.js`

Exporta la función `x`, que conecta Mongoose a MongoDB usando `MONGODB_URI`. Si no se configura esa variable, usa una base local llamada `trabajodenumologia` en `mongodb://127.0.0.1:27017/trabajodenumologia`. `index.js` espera a que esta conexión se establezca antes de iniciar el servidor.

## 4. Modelos de datos

Los modelos definen los campos, tipos, referencias y algunas reglas que Mongoose aplica a los documentos.

### `src/models/Users.js`

Define el modelo `User` con nombre completo, correo, contraseña guardada como hash, fecha de nacimiento y fecha de registro. El correo se almacena en minúsculas y se declara único. Mongoose agrega marcas de tiempo de creación y actualización.

### `src/models/NumerologyProfiles.js`

Define el modelo `NumerologyProfile`. Cada perfil está asociado con un usuario por `usuario_id` y contiene `numero_vida`, `numero_expresion` y `numero_alma`, requeridos y con mínimo 1.

### `src/models/CompatibilityMatches.js`

Define el modelo `CompatibilityMatch`, que registra dos usuarios, un puntaje de compatibilidad de 0 a 100 y la interpretación generada por IA. Incluye fechas de creación y actualización.

### `src/models/Readings.js`

Define el modelo `Reading`, que guarda el prompt, la respuesta, el tipo de lectura, la fecha, el usuario y perfil asociados, el modelo de IA y el total de tokens si está disponible. `respuesta` admite diferentes estructuras porque su tipo es `Mixed`.

### `src/models/AuditLogs.js`

Define el modelo `AuditLog` para registrar endpoint, método HTTP, código de estado, fecha y usuario opcional. El método se restringe a `GET`, `POST`, `PUT`, `PATCH` o `DELETE`.

Las referencias `ref` de Mongoose conectan documentos por ObjectId, pero no crean una relación SQL ni garantizan que el documento relacionado exista. En este proyecto solo las consultas de perfiles usan `populate("usuario_id")`; las consultas de lecturas, compatibilidades y auditoría devuelven sus IDs. Borrar un documento no elimina automáticamente los documentos que lo referencian. Para los ejemplos de peticiones, respuestas y persistencia, consulta [`FLUJO-PETICIONES.md`](./FLUJO-PETICIONES.md).

## 5. Rutas HTTP

Los routers conectan las URLs con sus validadores, middlewares y controladores. Se montan desde `index.js` bajo `/api/v1`.

### `src/routers/Users.js`

Define rutas bajo `/api/v1/users`:

- `POST /` crea una cuenta después de validar sus datos.
- `POST /login` autentica por correo y contraseña.
- `GET /` y `GET /:id` consultan usuarios y requieren JWT.
- `PUT /:id` actualiza un usuario y requiere JWT.
- `DELETE /:id` elimina un usuario y requiere JWT.

### `src/routers/NumerologyProfiles.js`

Define rutas bajo `/api/v1/numerology-profiles`:

- `GET /` y `GET /:id` consultan perfiles.
- `POST /` crea un perfil y requiere JWT.
- `PUT /:id` actualiza un perfil y requiere JWT.
- `DELETE /:id` elimina un perfil y requiere JWT.

### `src/routers/CompatibilityMatches.js`

Define rutas bajo `/api/v1/compatibility-matches`:

- `POST /analyze` requiere JWT, recibe los IDs de dos perfiles y genera un análisis con Gemini.
- `POST /` guarda un análisis enviado en el cuerpo de la petición y requiere JWT.
- `GET /` y `GET /:id` consultan análisis.
- `PUT /:id` actualiza un análisis y requiere JWT.
- `DELETE /:id` elimina un análisis y requiere JWT.

### `src/routers/Readings.js`

Define rutas bajo `/api/v1/readings`:

- `POST /generate` requiere JWT y genera una lectura con Gemini para un perfil del usuario.
- `POST /` guarda una lectura enviada en el cuerpo de la petición y requiere JWT.
- `GET /` y `GET /:id` consultan lecturas.
- `PUT /:id` actualiza una lectura y requiere JWT.
- `DELETE /:id` elimina una lectura y requiere JWT.

### `src/routers/AuditLogs.js`

Define rutas bajo `/api/v1/audit-logs`. Protege todo el router con JWT. Permite listar, consultar, crear, actualizar y eliminar registros de auditoría.

## 6. Controladores

Los controladores procesan las peticiones, interactúan con los modelos y producen respuestas HTTP.

### `src/controllers/Users.js`

Implementa el registro, el inicio de sesión y las operaciones CRUD de usuarios. Durante el registro y el cambio de contraseña convierte la contraseña recibida en un hash con `bcryptjs`. En el inicio de sesión compara la contraseña con el hash y devuelve un JWT cuando los datos son válidos.

### `src/controllers/NumerologyProfiles.js`

Implementa las operaciones CRUD de perfiles numerológicos. En las consultas usa `populate("usuario_id")` para incluir la información asociada del usuario. Si se produce un error, lo pasa al middleware de errores de Express.

### `src/controllers/CompatibilityMatches.js`

Implementa las operaciones CRUD de compatibilidad y la función de generación:

- `generarCompatibilityMatch` busca el perfil propio ligado al usuario autenticado y el perfil de la otra persona.
- Rechaza perfiles inexistentes y perfiles que pertenezcan al mismo usuario.
- Solicita el puntaje y la interpretación al servicio de Gemini.
- Guarda el resultado en `CompatibilityMatch`.
- Si Gemini no está disponible o falla, responde con un error de servicio en lugar de guardar un resultado inventado.

### `src/controllers/Readings.js`

Implementa las operaciones CRUD de lecturas y `generarReading`. La generación exige un perfil perteneciente al usuario autenticado. Antes de llamar a Gemini busca si ya existe una lectura para ese perfil, tipo y modelo; si la encuentra, devuelve el resultado almacenado con `cache: true`. Si no, solicita la lectura, la guarda con sus metadatos y responde con `cache: false`.

### `src/controllers/AuditLogs.js`

Implementa las operaciones CRUD de registros de auditoría. Lee los datos de la solicitud, usa el modelo `AuditLog` y devuelve códigos HTTP adecuados para creación, consulta, ausencia de datos o errores.

## 7. Servicios de inteligencia artificial

Los servicios encapsulan las llamadas al SDK `@google/genai`. La clave se toma de `GEMINI_API_KEY` (también se contemplan dos nombres alternativos en el código). El modelo se toma de `GEMINI_MODEL` o, si no se define, del valor predeterminado escrito en cada servicio.

### `src/services/GeminiReading.js`

Implementa `generarLecturaNumerologica`. Envía a Gemini los números de vida, expresión y alma del perfil y el tipo de lectura solicitado. Solicita una respuesta JSON estructurada con resumen, interpretaciones, fortalezas, áreas de trabajo y número destacado.

El esquema y el prompt piden respuestas concisas: resumen de hasta dos frases y 30 palabras, interpretaciones de hasta 25 palabras y elementos de listas de hasta ocho palabras. Devuelve los datos generados, el nombre del modelo y los tokens reportados por Gemini cuando estén disponibles.

### `src/services/GeminiCompatibility.js`

Implementa `generarCompatibilidadNumerologica`. Envía a Gemini los tres números de dos perfiles y pide un puntaje entero entre 0 y 100 junto con una interpretación breve, en español, de hasta dos frases y 40 palabras. Comprueba que el JSON se pueda interpretar, que el puntaje esté en el rango esperado y que la interpretación no esté vacía.

La lectura y la compatibilidad se describen como interpretaciones orientativas; el prompt indica que no se debe presentar la numerología como ciencia ni hacer predicciones deterministas.

## 8. Middlewares

### `src/middlewares/Webtoken.js`

Exporta dos funciones:

- `generarJWT(uid)` crea un token firmado con `SECRETORPRIVATEKEY` con vigencia de cuatro horas.
- `validarJWT` lee el token de la cabecera `x-token`, lo verifica, busca al usuario y coloca ese usuario en `req.usuario`. Rechaza peticiones sin token o con token inválido, usuario inexistente o inactivo.

### `src/middlewares/validarCampos.js`

Consulta los errores recopilados por `express-validator`. Si hay errores, devuelve HTTP 400 con el campo y el mensaje de cada uno. Si no los hay, deja continuar la petición.

## 9. Validadores de entrada

Estos archivos declaran las reglas de `express-validator` que los routers ejecutan antes de llamar a los controladores.

### `src/validators/Users.js`

Valida el registro y la actualización de usuarios: nombre, correo, longitud mínima de contraseña y formato de fechas. También valida las credenciales de inicio de sesión y los IDs de usuario en la URL.

### `src/validators/NumerologyProfiles.js`

Valida el `usuario_id` como ObjectId y los números de vida, expresión y alma como enteros mayores o iguales a 1. Incluye reglas para creación, actualización e IDs de ruta.

### `src/validators/CompatibilityMatches.js`

Valida los IDs de usuarios, comprueba en la base de datos su existencia al crear un análisis manual, evita que los dos usuarios sean iguales y limita el puntaje a 0–100. También valida el texto de interpretación, actualizaciones y los IDs de perfil que recibe `/analyze`.

### `src/validators/Readings.js`

Valida los campos de lectura para creación y actualización. Para la generación comprueba que `perfil_id` sea un ObjectId y que `tipo_lectura` sea uno de `general`, `amor`, `trabajo` o `proposito`.

### `src/validators/AuditLogs.js`

Valida endpoint, método HTTP permitido, código de estado, fecha y usuario opcional de cada registro de auditoría. También define reglas de actualización e ID de ruta.

## 10. Documentos de `laboratorio/`

Esta carpeta contiene documentación de análisis y ejercicios sobre la API. Algunos ejemplos y nombres de archivo citados allí corresponden a versiones o ejercicios anteriores; para saber cómo funciona el código vigente, se debe contrastar cada afirmación con `src/`.

### `laboratorio/analisis-api.md`

Documento de análisis del recorrido de peticiones, responsabilidades de archivos y ejercicios de comprobación. Incluye observaciones sobre el código y deja algunas comprobaciones marcadas como pendientes. Debe leerse como informe de análisis, no como sustituto del código.

### `laboratorio/defensa-tecnica.md`

Contiene respuestas técnicas sobre validaciones, defensa en capas, integridad referencial, actualización parcial y asignación masiva. Algunos ejemplos mencionan rutas y archivos con nombres antiguos que no coinciden con la estructura actual.

### `laboratorio/informe-ataque.md`

Registra un ejercicio de ataques de prueba contra la API y sus resultados reportados. Incluye solicitudes, respuestas y veredictos del ejercicio. No se debe asumir que esos resultados reflejan automáticamente la versión actual sin repetir las pruebas en un entorno controlado.

### `laboratorio/bitacora-reparacion.md`

Describe la reparación de una validación de integridad referencial para IDs de usuario en los análisis de compatibilidad. Usa ejemplos con nombres de archivos anteriores; el validador actual está en `src/validators/CompatibilityMatches.js`.

## 11. Carpetas excluidas del inventario

- `node_modules/` contiene paquetes instalados desde npm. Sus miles de archivos son código de terceros generado/administrado por npm, no archivos fuente mantenidos directamente para esta aplicación. Las dependencias principales se explican en `package.json`.
- `.git/` contiene los datos internos del historial y control de versiones.

## 12. Configuración y ejecución local

1. Instalar Node.js y MongoDB.
2. Crear `.env` basándose en `.env.example` y completar las variables localmente. No publicar claves ni contraseñas.
3. Instalar dependencias con `npm install`.
4. Iniciar en desarrollo con `npm run dev` o normalmente con `npm start`.
5. Confirmar que MongoDB está accesible y que `MONGODB_URI` y `SECRETORPRIVATEKEY` están configuradas. Para las funciones de IA también se necesita una clave de Gemini válida.

Las rutas protegidas requieren el encabezado:

```http
x-token: <token-jwt>
```

El token se obtiene mediante el inicio de sesión. Las respuestas de la API son JSON.

## 13. Consideraciones sobre el alcance

- El puntaje e interpretación de compatibilidad los propone Gemini a partir de los números enviados al modelo; son orientativos y no constituyen una medición científica.
- Las lecturas generadas se almacenan y pueden reutilizarse desde caché según perfil, tipo y modelo.
- El listado de carpetas de código no incluye `node_modules`, `.git` ni los valores internos del archivo `.env`.
- Esta guía explica los archivos de la aplicación identificados en la revisión; no afirma que se hayan ejecutado todas las rutas ni que se haya probado una llamada real a MongoDB o Gemini.

## 14. Cómo hacer peticiones a las rutas

### Dirección base y formato

En los ejemplos se usa `http://localhost:1799` como dirección base. Si se cambió el puerto, reemplázalo por el valor configurado en `PORT`. Las rutas de la API comienzan con `/api/v1`.

Las peticiones que envían JSON deben incluir:

```http
Content-Type: application/json
```

Las rutas protegidas también requieren el token obtenido al iniciar sesión:

```http
x-token: <token-jwt>
```

En Postman, selecciona el método HTTP, escribe la URL, agrega esos encabezados en la pestaña **Headers** y, para `POST` o `PUT`, elige **Body → raw → JSON** y pega el objeto correspondiente.

### GET: consultar datos

`GET` obtiene información. Normalmente no lleva cuerpo JSON. Para una consulta por ID, reemplaza `:id` por el ID real de MongoDB.

```http
GET http://localhost:1799/api/v1/numerology-profiles
```

Consultar un perfil:

```http
GET http://localhost:1799/api/v1/numerology-profiles/66a123456789012345678901
```

En el código actual, el listado y la consulta por ID de perfiles no requieren token. En cambio, `GET /api/v1/users` y `GET /api/v1/users/:id` sí requieren `x-token`.

### POST: crear o generar

`POST` envía datos para crear un recurso o ejecutar una operación. El JSON va en el cuerpo de la petición.

**Crear una cuenta** (no requiere token):

```http
POST http://localhost:1799/api/v1/users
Content-Type: application/json
```

```json
{
  "nombre_completo": "Ana Ejemplo",
  "email": "ana@example.com",
  "password_hash": "clave-segura-123",
  "fecha_nacimiento": "1995-06-15"
}
```

Aunque el nombre del campo recibido sea `password_hash`, al registrarse se envía la contraseña en texto normal por HTTPS; el servidor la convierte en hash antes de guardarla. No envíes ni compartas contraseñas reales en ejemplos públicos.

**Iniciar sesión** (no requiere token):

```http
POST http://localhost:1799/api/v1/users/login
Content-Type: application/json
```

```json
{
  "email": "ana@example.com",
  "password_hash": "clave-segura-123"
}
```

La respuesta incluye un token. Cópialo para las siguientes peticiones protegidas y úsalo en el encabezado `x-token`.

**Crear un perfil numerológico** (requiere token):

```http
POST http://localhost:1799/api/v1/numerology-profiles
Content-Type: application/json
x-token: <token-jwt>
```

```json
{
  "usuario_id": "66a123456789012345678901",
  "numero_vida": 7,
  "numero_expresion": 3,
  "numero_alma": 9
}
```

Usa como `usuario_id` el ID del usuario correspondiente.

**Generar una lectura con IA** (requiere token):

```http
POST http://localhost:1799/api/v1/readings/generate
Content-Type: application/json
x-token: <token-jwt>
```

```json
{
  "perfil_id": "66b123456789012345678901",
  "tipo_lectura": "general"
}
```

Los tipos permitidos son `general`, `amor`, `trabajo` y `proposito`. El perfil debe pertenecer al usuario autenticado.

**Generar compatibilidad con IA** (requiere token):

```http
POST http://localhost:1799/api/v1/compatibility-matches/analyze
Content-Type: application/json
x-token: <token-jwt>
```

```json
{
  "perfil_id_propio": "66b123456789012345678901",
  "perfil_id_compatibilidad": "66c123456789012345678901"
}
```

El primer perfil debe pertenecer al usuario autenticado; el segundo, a otro usuario. Gemini genera un puntaje y una interpretación, y la API guarda el análisis. Se necesita que MongoDB y la clave de Gemini estén configurados.

### PUT: actualizar datos

El proyecto implementa `PUT` para actualizar. Las reglas de varios campos son opcionales, así que se puede enviar solo el campo que se desea cambiar.

**Actualizar el nombre de un usuario** (requiere token):

```http
PUT http://localhost:1799/api/v1/users/66a123456789012345678901
Content-Type: application/json
x-token: <token-jwt>
```

```json
{
  "nombre_completo": "Ana Nuevo Nombre"
}
```

**Actualizar un perfil** (requiere token):

```http
PUT http://localhost:1799/api/v1/numerology-profiles/66b123456789012345678901
Content-Type: application/json
x-token: <token-jwt>
```

```json
{
  "numero_vida": 8
}
```

Los campos se deben enviar con el tipo y formato que exige el validador de cada recurso.

### PATCH: método no implementado actualmente

`PATCH` se suele utilizar para actualizaciones parciales, pero **ninguno de los routers actuales declara una ruta `PATCH`**. Por ejemplo, esta petición no tiene una ruta asociada:

```http
PATCH http://localhost:1799/api/v1/numerology-profiles/66b123456789012345678901
Content-Type: application/json
x-token: <token-jwt>
```

```json
{
  "numero_vida": 8
}
```

El servidor responderá que la ruta o el método no existen. Para actualizar con la implementación actual, usa `PUT` como en los ejemplos anteriores. Que el validador de registros de auditoría acepte el texto `"PATCH"` como valor de `metodo` solo significa que puede registrar una petición PATCH; no crea endpoints PATCH.

### DELETE: eliminar un recurso

`DELETE` elimina el recurso indicado por su ID. No necesita cuerpo JSON. En los endpoints protegidos agrega el encabezado `x-token`.

**Eliminar un perfil numerológico** (requiere token):

```http
DELETE http://localhost:1799/api/v1/numerology-profiles/66b123456789012345678901
x-token: <token-jwt>
```

La API devuelve un mensaje de confirmación si encuentra y elimina el documento, o un error `404` si el ID no existe.

### Resumen de los endpoints principales

| Método | Ruta | ¿Token? | Uso |
|---|---|---:|---|
| `POST` | `/api/v1/users` | No | Registrar usuario |
| `POST` | `/api/v1/users/login` | No | Iniciar sesión y obtener token |
| `GET` | `/api/v1/users` | Sí | Listar usuarios |
| `GET` | `/api/v1/numerology-profiles` | No | Listar perfiles |
| `POST` | `/api/v1/numerology-profiles` | Sí | Crear perfil |
| `PUT` | `/api/v1/numerology-profiles/:id` | Sí | Actualizar perfil |
| `DELETE` | `/api/v1/numerology-profiles/:id` | Sí | Eliminar perfil |
| `POST` | `/api/v1/readings/generate` | Sí | Generar lectura con Gemini |
| `POST` | `/api/v1/compatibility-matches/analyze` | Sí | Generar análisis de compatibilidad |
| `GET` | `/api/v1/audit-logs` | Sí | Listar registros de auditoría |

La tabla muestra ejemplos representativos, no todas las rutas. Para la lista completa de operaciones de cada recurso, consulta la sección **Rutas HTTP** de esta guía y los routers de `src/routers/`.
