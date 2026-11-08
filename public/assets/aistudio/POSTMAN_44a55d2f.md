# Guía de uso de Postman

Esta guía muestra cómo probar cada archivo de rutas de la API con Postman. Los ejemplos corresponden a los routers actuales del proyecto.

Para ver el flujo entre colecciones, qué devuelve cada operación y cómo se guardan las referencias, consulta también [FLUJO-PETICIONES.md](./FLUJO-PETICIONES.md).

## 1. Preparar Postman

Inicia el servidor con `npm run dev` o `npm start`. La dirección base por defecto es `http://localhost:1799`; si cambiaste `PORT`, usa el puerto configurado.

Para evitar repetir valores, puedes crear un Environment en Postman con estas variables:

| Variable | Valor de ejemplo |
|---|---|
| `baseUrl` | `http://localhost:1799/api/v1` |
| `token` | Déjalo vacío hasta iniciar sesión |
| `userId` | ID MongoDB de un usuario existente |
| `otherUserId` | ID MongoDB de otro usuario |
| `profileId` | ID MongoDB de un perfil |
| `otherProfileId` | ID MongoDB de otro perfil |
| `readingId` | ID MongoDB de una lectura |
| `matchId` | ID MongoDB de un análisis de compatibilidad |
| `auditLogId` | ID MongoDB de un registro de auditoría |

Los valores de IDs son ejemplos: reemplázalos por IDs reales devueltos por la API. Un ObjectId tiene 24 caracteres hexadecimales.

Para cada petición:

1. Selecciona el método HTTP y escribe la URL.
2. Para solicitudes JSON, abre **Headers** y añade `Content-Type` con valor `application/json`.
3. En los recursos protegidos, añade `x-token` con valor `{{token}}`.
4. Para `POST` y `PUT` con cuerpo, abre **Body → raw → JSON** y pega el ejemplo.
5. Pulsa **Send** y revisa el código de estado y la respuesta JSON.

## 2. Rutas de usuarios — `src/routers/Users.js`

Prefijo: `{{baseUrl}}/users`

### Registrar usuario

No requiere token. Envía la contraseña en texto normal sobre HTTPS; el servidor la convierte en hash antes de guardarla. El campo se llama `password_hash` por el contrato actual de la API.

**POST** `{{baseUrl}}/users`

```json
{
  "nombre_completo": "Ana Ejemplo",
  "email": "ana@example.com",
  "password_hash": "clave-segura-123",
  "fecha_nacimiento": "1995-06-15"
}
```

`fecha_registro` es opcional. Espera normalmente `201 Created`; el cuerpo es el usuario creado. El controlador actual devuelve el documento incluyendo `password_hash` ya cifrado. No compartas esa respuesta ni uses el hash como contraseña.

### Iniciar sesión y obtener token

No requiere token. Copia el campo `token` de la respuesta. En Postman puedes guardarlo manualmente en la variable `token`.

**POST** `{{baseUrl}}/users/login`

```json
{
  "email": "ana@example.com",
  "password_hash": "clave-segura-123"
}
```

Con credenciales correctas, responde `200 OK` con `usuario` y `token`. Guarda el token para enviarlo en `x-token`. Si las credenciales no coinciden, responde `400`.

El objeto `usuario` también incluye `password_hash` con el hash según la respuesta actual del controlador; no compartas esa respuesta.

### Listar usuarios

Requiere token. La respuesta contiene usuarios registrados.

**GET** `{{baseUrl}}/users`

### Obtener un usuario

Requiere token.

**GET** `{{baseUrl}}/users/{{userId}}`

### Actualizar un usuario

Requiere token. Todos los campos son opcionales; envía solo lo que quieras modificar.

**PUT** `{{baseUrl}}/users/{{userId}}`

```json
{
  "nombre_completo": "Ana Nuevo Nombre"
}
```

Para cambiar la contraseña, envía `password_hash` con la nueva contraseña en texto normal; el servidor vuelve a calcular el hash. Otros campos opcionales son `email`, `fecha_nacimiento` y `fecha_registro`.

### Eliminar un usuario

Requiere token. No necesita cuerpo.

**DELETE** `{{baseUrl}}/users/{{userId}}`

Una eliminación exitosa responde `200` con un mensaje. Las referencias de otros documentos no se eliminan automáticamente.

## 3. Rutas de perfiles numerológicos — `src/routers/NumerologyProfiles.js`

Prefijo: `{{baseUrl}}/numerology-profiles`

### Listar perfiles

No requiere token. Incluye la información del usuario asociado cuando Mongoose puede poblar la referencia.

**GET** `{{baseUrl}}/numerology-profiles`

El listado y la consulta individual devuelven el perfil con `usuario_id` poblado cuando el usuario referenciado existe.

### Obtener un perfil

No requiere token.

**GET** `{{baseUrl}}/numerology-profiles/{{profileId}}`

### Crear un perfil

Requiere token.

**POST** `{{baseUrl}}/numerology-profiles`

```json
{
  "usuario_id": "{{userId}}",
  "numero_vida": 7,
  "numero_expresion": 3,
  "numero_alma": 9
}
```

Los tres números deben ser enteros mayores o iguales a 1.

Una creación exitosa responde `201` con el perfil. `usuario_id` debe ser el ObjectId del usuario; el validador actual revisa su formato, pero no confirma que el usuario exista.

### Actualizar un perfil

Requiere token. Los campos son opcionales.

**PUT** `{{baseUrl}}/numerology-profiles/{{profileId}}`

```json
{
  "numero_vida": 8
}
```

También se pueden actualizar `usuario_id`, `numero_expresion` o `numero_alma`.

### Eliminar un perfil

Requiere token. No necesita cuerpo.

**DELETE** `{{baseUrl}}/numerology-profiles/{{profileId}}`

Una eliminación exitosa responde `200` con un mensaje. Las lecturas que ya apunten al perfil no se borran automáticamente.

## 4. Rutas de compatibilidad — `src/routers/CompatibilityMatches.js`

Prefijo: `{{baseUrl}}/compatibility-matches`

### Listar análisis

No requiere token.

**GET** `{{baseUrl}}/compatibility-matches`

### Obtener un análisis

No requiere token.

**GET** `{{baseUrl}}/compatibility-matches/{{matchId}}`

### Generar compatibilidad con Gemini

Requiere token y una clave Gemini configurada en el servidor. `perfil_id_propio` debe corresponder a un perfil del usuario autenticado. El otro perfil debe pertenecer a otro usuario.

**POST** `{{baseUrl}}/compatibility-matches/analyze`

```json
{
  "perfil_id_propio": "{{profileId}}",
  "perfil_id_compatibilidad": "{{otherProfileId}}"
}
```

Gemini genera un puntaje de 0 a 100 y una interpretación breve; la API guarda el resultado. La interpretación es orientativa, no una evaluación científica.

Si se genera correctamente, responde `201` con el análisis guardado. Si no encuentra alguno de los perfiles, responde `404`; si Gemini falla, responde `503`.

### Crear un análisis manual

Requiere token. Esta ruta no llama a Gemini: guarda el puntaje y la interpretación que envíes. Ambos usuarios deben existir y ser distintos.

**POST** `{{baseUrl}}/compatibility-matches`

```json
{
  "usuario_id_1": "{{userId}}",
  "usuario_id_2": "{{otherUserId}}",
  "puntaje_calculado": 82,
  "interpretacion_ia": "Se observan afinidades en sus objetivos y diferencias que pueden complementar la relación."
}
```

La respuesta exitosa es `201` con el análisis creado. Se comprueba que los usuarios existan y que sus IDs sean distintos.

### Actualizar un análisis

Requiere token. Los campos son opcionales.

**PUT** `{{baseUrl}}/compatibility-matches/{{matchId}}`

```json
{
  "puntaje_calculado": 86,
  "interpretacion_ia": "La combinación muestra afinidad y oportunidades de aprendizaje mutuo."
}
```

### Eliminar un análisis

Requiere token. No necesita cuerpo.

**DELETE** `{{baseUrl}}/compatibility-matches/{{matchId}}`

## 5. Rutas de lecturas — `src/routers/Readings.js`

Prefijo: `{{baseUrl}}/readings`

### Listar lecturas

No requiere token.

**GET** `{{baseUrl}}/readings`

### Obtener una lectura

No requiere token.

**GET** `{{baseUrl}}/readings/{{readingId}}`

### Generar una lectura con Gemini

Requiere token, una clave Gemini en el servidor y un perfil que pertenezca al usuario autenticado. Los tipos válidos son `general`, `amor`, `trabajo` y `proposito`.

**POST** `{{baseUrl}}/readings/generate`

```json
{
  "perfil_id": "{{profileId}}",
  "tipo_lectura": "general"
}
```

La respuesta indica `cache: true` cuando se devuelve una lectura existente, o `cache: false` cuando se acaba de generar y guardar una nueva.

Una lectura nueva responde `201`; una lectura ya guardada para el mismo usuario, perfil, tipo y modelo responde `200`. Si el perfil no pertenece al usuario autenticado, responde `404`; si Gemini falla, responde `503`.

### Crear una lectura manual

Requiere token. Esta ruta guarda los datos enviados y no llama a Gemini.

**POST** `{{baseUrl}}/readings`

```json
{
  "prompt": "Lectura numerológica de ejemplo",
  "respuesta": "Interpretación de ejemplo para la persona.",
  "tipo_lectura": "general"
}
```

`fecha` es opcional y debe estar en formato ISO 8601, por ejemplo `"2026-10-22T12:00:00.000Z"`. Para esta ruta, `respuesta` debe ser texto según el validador actual.

Una creación exitosa responde `201`. Esta ruta solo guarda los campos que el controlador copia del cuerpo (`prompt`, `respuesta`, `tipo_lectura` y `fecha`); no asocia usuario ni perfil.

### Actualizar una lectura

Requiere token. Todos los campos son opcionales.

**PUT** `{{baseUrl}}/readings/{{readingId}}`

```json
{
  "tipo_lectura": "amor",
  "respuesta": "Texto actualizado de la interpretación."
}
```

Se pueden actualizar `prompt`, `respuesta`, `tipo_lectura` y `fecha`.

### Eliminar una lectura

Requiere token. No necesita cuerpo.

**DELETE** `{{baseUrl}}/readings/{{readingId}}`

## 6. Rutas de auditoría — `src/routers/AuditLogs.js`

Prefijo: `{{baseUrl}}/audit-logs`. Todas las rutas requieren token.

### Listar registros

**GET** `{{baseUrl}}/audit-logs`

### Obtener un registro

**GET** `{{baseUrl}}/audit-logs/{{auditLogId}}`

### Crear un registro

**POST** `{{baseUrl}}/audit-logs`

```json
{
  "endpoint": "/api/v1/users/login",
  "metodo": "POST",
  "status_code": 200
}
```

`metodo` debe ser `GET`, `POST`, `PUT`, `PATCH` o `DELETE`. `status_code` debe ser un entero entre 100 y 599. `timestamp` y `user_id` son opcionales. Ejemplo con todos los campos:

```json
{
  "endpoint": "/api/v1/users/login",
  "metodo": "POST",
  "status_code": 200,
  "timestamp": "2026-10-22T12:00:00.000Z",
  "user_id": "{{userId}}"
}
```

### Actualizar un registro

**PUT** `{{baseUrl}}/audit-logs/{{auditLogId}}`

```json
{
  "status_code": 201,
  "metodo": "POST"
}
```

Los campos de actualización son opcionales. Se pueden modificar `endpoint`, `metodo`, `status_code`, `timestamp` y `user_id`.

### Eliminar un registro

**DELETE** `{{baseUrl}}/audit-logs/{{auditLogId}}`

No necesita cuerpo.

El router completo requiere `x-token`. Las altas responden `201`; consultas y cambios correctos responden `200`. Estos documentos son registros enviados manualmente: la API no crea automáticamente un audit log por cada petición.

## 7. ¿Hay rutas PATCH?

Actualmente, ninguno de los routers implementa una ruta con el método HTTP `PATCH`. Para modificar un recurso, usa `PUT` y envía los campos que quieras actualizar; las reglas de actualización son opcionales en los validadores.

Que el validador de auditoría permita guardar `"PATCH"` en el campo `metodo` solo sirve para registrar una petición con ese método; no crea una ruta PATCH.

## 8. Errores comunes

- **401**: falta el encabezado `x-token`, el token expiró o no es válido.
- **400**: hay campos faltantes, formato inválido o valores fuera del rango esperado. La respuesta suele incluir `errores` con el campo y su mensaje.
- **404**: el ID solicitado no corresponde a un documento existente.
- **503**: Gemini no pudo generar la lectura o compatibilidad; revisa que la clave del servidor sea válida y que el servicio esté disponible.
- **404 para cualquier ruta**: comprueba la URL, el prefijo `/api/v1`, el recurso y el método HTTP. Las rutas PATCH no existen.
- **Respuesta con array vacío (`[]`)**: el endpoint de listado funcionó, pero no encontró documentos en esa colección.
- **Referencias que aparecen como `null`**: el ObjectId guardado no tiene un documento relacionado; `ref` no garantiza por sí mismo que el documento exista.
