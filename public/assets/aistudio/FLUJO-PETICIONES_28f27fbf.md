# Flujo de peticiones, referencias y datos en MongoDB

Este documento describe las rutas definidas actualmente en `index.js` y `src/routers/`. Los ejemplos usan los documentos que existan en la base configurada en `MONGODB_URI`; los IDs son valores ilustrativos, no IDs fijos.

Para ver cuerpos JSON listos para copiar en Postman, consulta [`POSTMAN.md`](./POSTMAN.md). Esta guía explica cómo se relacionan las colecciones, qué respuestas esperar y qué datos escribe cada petición.

## 1. Preparar una petición en Postman

1. Inicia la API con `npm run dev` o `npm start`. Por defecto escucha en `http://localhost:1799`.
2. Define en un Environment la variable `baseUrl` con el valor `http://localhost:1799/api/v1`.
3. Selecciona el método y la URL de la operación.
4. Para enviar un cuerpo, elige **Body → raw → JSON** y añade `Content-Type: application/json`.
5. En las rutas protegidas, añade la cabecera `x-token` con el JWT obtenido de `POST {{baseUrl}}/users/login`.
6. Pulsa **Send**. La respuesta aparece como JSON; el código HTTP indica si la operación tuvo éxito.

Un token no se escribe en el body. Los IDs de MongoDB sí se envían como cadenas JSON de 24 caracteres hexadecimales, por ejemplo `"507f1f77bcf86cd799439011"`.

## 2. Cómo se comportan las referencias

| Documento | Campo de referencia | Referencia a | Uso en consultas |
|---|---|---|---|
| Perfil numerológico | `usuario_id` | Usuario (`User`) | `GET /numerology-profiles` y `GET /numerology-profiles/:id` llaman a `populate("usuario_id")`; muestran el usuario si existe. |
| Lectura | `usuario_id` | Usuario (`User`) | Se guarda como ObjectId al generar una lectura; las consultas CRUD actuales no hacen `populate`. |
| Lectura | `perfil_id` | Perfil (`NumerologyProfile`) | Se guarda como ObjectId al generar una lectura; las consultas CRUD actuales no hacen `populate`. |
| Compatibilidad | `usuario_id_1`, `usuario_id_2` | Dos usuarios (`User`) | El análisis guarda los IDs de los usuarios; las consultas CRUD actuales no hacen `populate`. |
| Registro de auditoría | `user_id` | Usuario (`User`), opcional | Se guarda como ObjectId si se envía; las consultas CRUD actuales no hacen `populate`. |

`ref` indica a Mongoose qué modelo corresponde al ObjectId. No crea una clave foránea de MongoDB ni comprueba automáticamente que el documento exista. El validador de perfiles comprueba el formato de `usuario_id`, pero no consulta si ese usuario existe; en el alta manual de compatibilidades sí se comprueba que los dos usuarios existan y sean distintos.

Las eliminaciones son independientes: borrar un usuario no borra sus perfiles, lecturas, compatibilidades ni auditorías; borrar un perfil no borra las lecturas que lo referencian. Los IDs huérfanos pueden seguir guardados. Además, las rutas de listar y obtener pueden responder con `null` en una referencia poblada cuyo documento ya no exista.

## 3. Qué petición escribe cada documento

- `POST /users` crea un usuario y convierte la contraseña recibida en un hash con bcrypt.
- `POST /numerology-profiles` crea un perfil con los números enviados y el `usuario_id`.
- `POST /readings` crea una lectura manual. Solo guarda `prompt`, `respuesta`, `tipo_lectura` y `fecha`; no asocia usuario ni perfil desde el body.
- `POST /readings/generate` obtiene el usuario del token y el perfil indicado, llama a Gemini si no existe una lectura equivalente en caché y guarda usuario, perfil, tipo, prompt, respuesta y metadatos del modelo.
- `POST /compatibility-matches` crea manualmente un análisis con los dos usuarios, puntaje e interpretación enviados.
- `POST /compatibility-matches/analyze` obtiene los perfiles, llama a Gemini y guarda los usuarios asociados, el puntaje y la interpretación resultantes.
- `POST /audit-logs` crea un registro solo cuando se llama expresamente a esta ruta. Los demás endpoints no generan automáticamente un audit log.

`PUT /:id` actualiza los campos permitidos que se incluyen en el body; los campos omitidos no se deben enviar como `null` para conservarlos. `DELETE /:id` elimina únicamente el documento de esa colección. Las lecturas y compatibilidades manuales no llaman a Gemini.

## 4. Resumen de rutas y respuestas

En las tablas, `200` significa operación correcta; las respuestas exitosas son JSON. La respuesta exacta de error depende de la ruta y del middleware que la procese.

### Usuarios — `{{baseUrl}}/users`

| Método y ruta | Token | Qué hace y qué responde |
|---|---|---|
| `POST /` | No | Crea un usuario; `201` y el documento creado. La contraseña se guarda como hash. El controlador actual incluye el campo `password_hash` con el hash en su respuesta: no compartas esa respuesta. |
| `POST /login` | No | Credenciales correctas: `200` con `usuario` y `token`. Incorrectas: `400` con mensaje de credenciales inválidas. El objeto `usuario` incluye `password_hash` con el hash según el controlador actual; no compartas esa respuesta. |
| `GET /` | Sí | Lista usuarios; `200` y un arreglo, posiblemente `[]`. |
| `GET /:id` | Sí | Devuelve el usuario con `200`; si no existe, `404`. |
| `PUT /:id` | Sí | Actualiza los campos incluidos; `200` y el usuario actualizado. Si no existe, `404`. Una contraseña recibida se vuelve a cifrar. |
| `DELETE /:id` | Sí | Elimina solo el usuario; `200` con mensaje o `404` si no existe. |

### Perfiles — `{{baseUrl}}/numerology-profiles`

| Método y ruta | Token | Qué hace y qué responde |
|---|---|---|
| `GET /` | No | Lista perfiles; `200` y arreglo con `usuario_id` poblado cuando corresponde. |
| `GET /:id` | No | Devuelve un perfil y su usuario poblado; `200` o `404`. |
| `POST /` | Sí | Guarda `usuario_id`, `numero_vida`, `numero_expresion` y `numero_alma`; `201` con el perfil. Los números deben ser enteros ≥ 1. |
| `PUT /:id` | Sí | Actualiza los campos enviados; `200` o `404`. |
| `DELETE /:id` | Sí | Elimina solo el perfil; `200` con mensaje o `404`. Las lecturas relacionadas permanecen. |

### Lecturas — `{{baseUrl}}/readings`

| Método y ruta | Token | Qué hace y qué responde |
|---|---|---|
| `GET /` | No | Lista lecturas; `200` y arreglo, posiblemente vacío. |
| `GET /:id` | No | Devuelve la lectura; `200` o `404`. |
| `POST /` | Sí | Guarda lectura manual (`prompt`, `respuesta` de texto, `tipo_lectura` y fecha opcional); `201`. No asocia perfil ni usuario desde el cuerpo. |
| `POST /generate` | Sí | Recibe `perfil_id` y tipo `general`, `amor`, `trabajo` o `proposito`. Nueva lectura: `201` y `cache: false`. Lectura ya guardada para ese usuario/perfil/tipo/modelo: `200` y `cache: true`. Perfil no encontrado o ajeno: `404`. Error de Gemini: `503`. |
| `PUT /:id` | Sí | Actualiza `prompt`, `respuesta`, `tipo_lectura` o `fecha`; `200` o `404`. |
| `DELETE /:id` | Sí | Elimina solo la lectura; `200` con mensaje o `404`. |

La lectura generada incluye información de modelo y tokens cuando Gemini los proporciona. Los listados no rellenan los documentos de usuario y perfil.

### Compatibilidades — `{{baseUrl}}/compatibility-matches`

| Método y ruta | Token | Qué hace y qué responde |
|---|---|---|
| `GET /` | No | Lista análisis; `200` y arreglo, posiblemente vacío. |
| `GET /:id` | No | Devuelve un análisis; `200` o `404`. |
| `POST /` | Sí | Guarda manualmente dos IDs de usuario, puntaje 0–100 e interpretación; `201`. Los usuarios deben existir y ser distintos. |
| `POST /analyze` | Sí | Recibe `perfil_id_propio` y `perfil_id_compatibilidad`; Gemini genera el puntaje e interpretación. Éxito: `201` con el análisis guardado. Perfil inexistente: `404`; perfiles del mismo usuario: `400`; fallo de Gemini: `503`. |
| `PUT /:id` | Sí | Actualiza los campos enviados; `200` o `404`. |
| `DELETE /:id` | Sí | Elimina solo el análisis; `200` con mensaje o `404`. |

Las consultas CRUD devuelven los IDs de usuario sin `populate`. Las interpretaciones y puntajes generados son orientativos, no una evaluación científica.

### Auditoría — `{{baseUrl}}/audit-logs`

Todas las rutas requieren token porque `validarJWT` está instalado para todo el router.

| Método y ruta | Qué hace y qué responde |
|---|---|
| `GET /` | Lista registros; `200` y arreglo, posiblemente vacío. |
| `GET /:id` | Devuelve el registro; `200` o `404`. |
| `POST /` | Guarda endpoint, método HTTP y status code, más fecha y usuario opcionales; `201`. |
| `PUT /:id` | Actualiza los campos enviados; `200` o `404`. |
| `DELETE /:id` | Elimina solo el registro; `200` con mensaje o `404`. |

Los métodos permitidos para el campo `metodo` son `GET`, `POST`, `PUT`, `PATCH` y `DELETE`; `status_code` debe ser entero de 100 a 599. Aceptar `"PATCH"` como valor de ese campo no crea una ruta HTTP PATCH. Estos registros solo se insertan al llamar a `/audit-logs`; no son una bitácora automática de todas las peticiones.

## 5. Cómo leer las respuestas de error

- **400 — validación:** suele devolver un JSON como:

  ```json
  {
    "mensaje": "Error de validación",
    "errores": [
      {
        "campo": "numero_vida",
        "mensaje": "El número de vida debe ser un entero mayor o igual a 1"
      }
    ]
  }
  ```

  Los textos concretos dependen del campo que no pase la validación. Otros controladores también usan `400` para errores al crear o actualizar.

- **401 — autenticación:** falta `x-token`, el JWT no es válido/expiró o su usuario no existe.
- **404 — recurso:** el ID es válido, pero no se encontró el documento; también puede indicar un perfil no disponible para el usuario autenticado.
- **404 — ruta:** método o URL no están implementados.
- **503 — Gemini:** no se pudo generar una lectura o compatibilidad; comprueba la configuración del servidor y vuelve a intentarlo.
- **500 — error interno:** ocurrió un error no controlado durante el procesamiento.

Un `GET` de listado que responde `200` con `[]` no es un error: significa que la colección no tiene documentos para esa consulta.

## 6. Nota sobre la escritura de JSON

En Postman usa **Body → raw → JSON**. Las claves y los textos van entre comillas dobles; números y códigos HTTP se escriben como números, no como texto. No añadas comentarios dentro del JSON. Por ejemplo, para registrar un audit log:

```json
{
  "endpoint": "/api/v1/readings",
  "metodo": "POST",
  "status_code": 201
}
```

Un `POST` crea un documento nuevo; un `PUT` modifica el documento identificado por `:id`; un `GET` solo consulta; un `DELETE` elimina. Las rutas que generan con Gemini son `/readings/generate` y `/compatibility-matches/analyze`; las rutas sin esos sufijos guardan los datos que envía el cliente.
