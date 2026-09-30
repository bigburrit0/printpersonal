# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Calculadora de impresión 3D — contexto para Claude Code

## Qué es

- Calculadora web que da el **costo real** y el **precio mínimo de venta**, en pesos uruguayos, de impresiones 3D hechas con una **Bambu Lab A1**.
- El dueño vive en Uruguay y tiene tarifa **UTE Residencial Triple Horario**. Vende piezas impresas (diseños de MakerWorld) por Facebook Marketplace.
- Nació como un artefacto de claude.ai ("Costo de Impresión A1"). El objetivo ahora es convertirla en una **web app** propia.

**Idioma:** toda la interfaz y los textos para el usuario van en **español rioplatense** (voseo: "tocá", "elegí"). Montos con formato `es-UY`: `$1.234,56`.

**Cómo trabajar con el dueño:** no le molesta que haya cosas pendientes, pero le molesta mucho que se afirmen cosas sin verificarlas. Verificá antes de afirmar y separá siempre lo comprobado de lo supuesto.

## Estructura

```
index.html            estructura de la página (sin lógica)
styles.css            todo el estilo: tokens de color claro y oscuro, componentes, animaciones
app.js                lógica: cálculo, render, hojas, proyectos, sincronización
data/filamentos.js    precios de filamentos (window.FILAMENTOS)
docs/                 investigación y fuentes (precios, consumo de la A1, diseño en el celular)
tests/smoke.mjs       prueba de humo con Playwright (números del ejemplo + nada se sale de la pantalla)
scripts/build.sh      arma _site/, lo único que se publica
```

- Es JavaScript sin framework ni paso de compilación.
- Para verla: `npm start` y abrir http://localhost:8080. También funciona abriendo `index.html` directamente.
- Para probarla: `npm install && npm test`.
  - Hay una sola prueba (`node tests/smoke.mjs`); falla con código de salida 1.
  - Necesita el Chromium de Playwright. Si no está: `npx playwright install chromium`, o poné en `CHROMIUM_PATH` la ruta de un Chromium ya instalado.
- Para armar lo que se publica: `npm run build` (o `sh scripts/build.sh`). Genera `_site/`, que no se sube al repositorio.

## Publicación (decidida el 29/09/2026)

- **Dónde:** repositorio **privado** en GitHub, publicado gratis con **Cloudflare Pages**, conectado por Git.
  - Cada push a `main` se publica solo.
  - Configuración: comando de build `sh scripts/build.sh`, carpeta de salida `_site`.
  - Los pasos para el dueño están en `README.md`.
  - Se descartaron:
    - GitHub Pages: con la cuenta gratis exige que el repositorio sea público;
    - Netlify: el plan gratis pausa los sitios cuando se acaban los créditos;
    - Vercel: el plan gratis no admite uso comercial.
- **Qué se publica:** solo lo que está en `FILES`, en `scripts/build.sh`.
  - Es a propósito: `docs/`, `CLAUDE.md` y `tests/` no tienen que quedar a la vista.
  - Si la página empieza a cargar un archivo nuevo, agregalo ahí. Si no, en producción falta aunque en local funcione.
- **Los datos dependen de la dirección:** los proyectos viven en el localStorage del origen (`<proyecto>.pages.dev`).
  - Cambiar el nombre del proyecto de Cloudflare, cambiar de hosting o agregar un dominio deja al dueño con la app vacía.
  - Antes de cualquiera de esas cosas, el dueño tiene que exportar una copia (Proyectos → Exportar) e importarla en la dirección nueva.
  - Las versiones de prueba de otras ramas tienen otra dirección y, por lo tanto, otros datos.

## Cómo está armado `app.js`

- **Scripts clásicos, sin módulos:** `index.html` carga `data/filamentos.js` y después `app.js`. El estado es global:
  - `allProjects`: todos los proyectos;
  - `proj`: el que está abierto;
  - `cfg`: los ajustes.
- **Flujo:** cada `input` o `change` del formulario llama a `readForm()`, después a `save()` y después a `renderAll()`.
  - `save()` escribe en localStorage enseguida.
  - Si hay base de datos, escribe también ahí, después de 700 ms sin cambios.
- **Cálculo:** todo pasa por `compute(impresión)`.
  - `phasesFor` arma las fases.
  - `pieces` las corta por franja con `segments` y `band`.
  - `pieceCost` aplica el precio de cada franja.
  - Con `withBest`, prueba las 24 horas de inicio para sugerir la más barata.
- **Franjas y feriados:**
  - Las horas de las franjas (7, 17 y 23) están fijas en `band()` y `nextBoundary()`. En Ajustes solo se cambian los precios.
  - Los feriados no salen de un calendario: cada impresión tiene su casilla `feriado`.

### Trampas

- **El material se guarda como índice** de `FILAMENTOS` (`p.mat`), o como `'custom'` si es "Otra bobina".
  - Si reordenás o borrás filas de `data/filamentos.js`, los proyectos ya guardados pasan a apuntar a otro material.
  - Agregá filas al final, o migrá los índices guardados.
- **El material por defecto se busca por su nombre exacto:** `'Fremover PLA+ High Speed 1 kg'`. Si lo renombrás, la app se rompe al cargar una impresión nueva, y también la prueba.
- **El nombre del material decide el consumo al imprimir** (`printW`):
  - si contiene "abs" o "asa", usa `wABS`;
  - si contiene "pc" como palabra suelta, usa `wPC`;
  - en cualquier otro caso usa `wPLA`, y "Otra bobina" también.
- **Cambiar un valor por defecto no llega a quien ya usó la app.** Los valores están en `DEF`, al principio de `app.js`, pero al arrancar `persistLocal()` guarda todos los ajustes como `cfg_*`. Por ejemplo, para que llegue un dólar o una tarifa nueva, hace falta una migración.

## Reglas del cálculo (no cambiarlas sin que el dueño lo pida)

### 1. Tiempo y fases de consumo

- **Horas** = h + min ÷ 60.
- La energía se calcula **por fase**. La duración que ingresa el usuario es el total: el arranque se descuenta de ahí y la hora de fin no cambia.

| Fase | Consumo | Duración | Origen |
|---|---|---|---|
| Calentando la cama | V² ÷ R = 230² ÷ 47,5 = **1113,68 W** | **2 min** | resistencia oficial; duración **ESTIMADA** |
| Arranque y calibración | **120 W** | **4 min** | foro de usuarios |
| Imprimiendo | **95 W** PLA y otros / **200 W** ABS y ASA / **150 W** PC | el resto | wiki oficial de Bambu Lab |

- El arranque se puede apagar para cada impresión (interruptor "Calentamiento y calibración").

### 2. Energía

- Cada tramo: `kWh = W × h ÷ 1000`, multiplicado por el precio de la franja UTE en la que cae.
- Si un tramo cruza de una franja a otra, se prorratea.

| Franja | Horario, días hábiles | $/kWh con IVA |
|---|---|---|
| Valle | 00:00–07:00 | $2,9805 |
| Llano | 07:00–17:00 y 23:00–24:00 | $6,3098 |
| Punta | 17:00–23:00 | $14,6815 |

- Pliego UTE vigente desde el 01/01/2026.
- Fines de semana y feriados: no hay punta, y de 07:00 a 24:00 se cobra llano.

### 3. Filamento

- `gramos × (precio US$ × dólar ÷ gramos de la bobina)`.
- El dólar por defecto es $41,35 (BROU, venta, 24/09/2026).
- Los precios de las tiendas están en US$ y no aclaran si incluyen IVA.

### 4. Costo y precio mínimo

- **Costo** = energía + filamento.
- **Precio mínimo de venta** = filamento × **2** + energía × **1,5**, redondeado **hacia arriba** a **$10**.
  - Todo esto se puede cambiar en Ajustes; redondeo 0 = sin redondear.
  - El precio del **proyecto** se redondea sobre la **suma exacta** de sus impresiones, no sumando precios ya redondeados.
  - **Margen** = precio redondeado − costo.
- Cálculos intermedios con **4 decimales**; resultados a **2**.
- **No incluir** cargo fijo, potencia contratada, desgaste, fallos ni mano de obra.

### Valores de control

Proyecto de ejemplo "ajedrez medieval": 2 placas de 103 g y 10 h cada una, con Fremover PLA+ High Speed a US$16 el kg.

| | Inicio | Costo | Precio mínimo |
|---|---|---|---|
| Placa 1 | jue 24/09 23:00 | **$72,15** (energía $4,01 + filamento $68,14) | **$150** (exacto $142,30) |
| Placa 2 | vie 25/09 11:00 | **$77,55** | **$160** (exacto $150,39) |
| Proyecto | | **$149,70** · 206 g | **$300** (exacto $292,69) |

Si un cambio mueve estos números y no era esa la intención, está mal.

**Qué verifica `tests/smoke.mjs`,** a 1200 px y a 390 px:

- el costo y el precio mínimo de la Placa 1;
- el costo, los gramos y el precio mínimo del proyecto;
- que no haya desplazamiento horizontal;
- que no haya errores de JavaScript.

**Qué no verifica:** la Placa 2 ni los valores "exacto". Si tocás el cálculo, comprobalos a mano.

**Cómo funciona:**

- Lee los ids `#pCost`, `#pSale`, `#projTotal`, `#projGrams` y `#projSale`. Si los renombrás, actualizá la prueba.
- Los montos se animan (`tweenText`, 480 ms) y la prueba espera 1,5 s antes de leerlos. Si alargás la animación, alargá también esa espera.

## Guardado de datos

- **Proyectos:** varios, cada uno con varias impresiones.
- **Dentro de claude.ai:** se guardan con la base de datos del artefacto (`window.claude.use('db')`, colección `projects`, un documento por proyecto).
- **Fuera de claude.ai:** `window.claude` no existe, así que la app usa **solo localStorage**. Claves:
  - `proyectos_v2`: todos los proyectos;
  - `proyecto_actual`: el que está abierto;
  - `cfg_*`: los ajustes;
  - `ultima_copia`: cuándo se exportó la última copia (milisegundos);
  - `proyecto_v1`: el formato viejo; solo se lee para migrarlo.
- **Copia de seguridad** (hoja Proyectos, abajo; sección "copia de seguridad" de `app.js`):
  - **Exportar** descarga `calculadora-3d-copia-AAAA-MM-DD.json`, con `{app, version, exportado, proyectos, ajustes}`.
    - No incluye el ejemplo sin tocar (`seed`).
    - Cada impresión lleva además `matNombre`, porque `mat` es un índice y la lista de filamentos puede cambiar. Al importar, si el índice no coincide con el nombre, se busca por nombre.
    - Si cambiás el formato, subí `BACKUP_VER`. La app rechaza copias de una versión mayor que la suya.
  - **Importar** nunca pisa nada:
    - si ya existe un proyecto con las mismas impresiones, lo saltea;
    - si llega un id que ya existe pero con otros datos, entra como copia con " (importado)";
    - si entra al menos un proyecto, borra el ejemplo sin tocar.
    - Todo se puede deshacer con el aviso.
  - **Ajustes de la copia:** se aplican solo si acá siguen como vienen de fábrica (`DEF`), o sea en un dispositivo o navegador nuevo.
  - **Validación:** lo importado pasa por `cleanProject` y `cleanPrint`, que aceptan solo campos conocidos y regeneran los ids inválidos. Es necesario: los ids se insertan sin escapar en `data-id="…"`.
  - **Si no se pudo guardar:** después de importar se comprueba que `proyectos_v2` quedó guardado. Si no, se deshace todo.
- **Para la web app:** para tener sincronización entre dispositivos hay que reemplazar esa capa por un backend propio (por ejemplo Supabase o Firebase con login). Está aislada en `app.js`, en las secciones "proyectos: memoria local + base de datos del artefacto" y "sincronización con la base de datos". La lógica de fusión usa `updatedAt`, `synced` y `seed`.

## Diseño (lo que ya se decidió; mantenerlo)

- **Primero el celular.**
  - Nada de desplazamiento horizontal.
  - Botones de 44 px o más en pantallas táctiles.
  - Campos con letra de 17 px (así el iPhone no hace zoom) y `inputmode` numérico.
- **Dock inferior de vidrio en el celular:** costo y precio de la impresión, total del proyecto y "+". Se esconde con el teclado abierto (`body.typing`).
- **Hojas inferiores** (Material, Ajustes, Proyectos):
  - se cierran deslizando **y** con un botón;
  - la de Material se ajusta a `visualViewport` para no quedar debajo del teclado.
- **Firma visual:** un reloj de 24 h con las franjas de UTE y el arco de la impresión.
- **Vidrio (backdrop-filter):** solo en la capa de controles flotantes (barra, dock, avisos).
- **Color:**
  - tema claro y oscuro con tokens en `:root`;
  - acento verde azulado para la acción principal y el precio mínimo;
  - las franjas valle, llano y punta llevan letra (V, L, P) además de color.
- **Animaciones:** 100–400 ms, solo `transform` y `opacity`, y todas se apagan con `prefers-reduced-motion`.
- **Aviso con "Deshacer":** no se cierra solo, y se mueve dentro de la hoja abierta para que se pueda tocar.

## Ideas para convertirla en web app (sin decidir; preguntarle al dueño)

El 29/09/2026 se hicieron el hosting y la copia de seguridad. La app instalable se le ofreció al dueño y quedó pendiente.

1. **Web app instalable:** `manifest.webmanifest`, íconos y un service worker para usarla sin conexión.
   - En iPhone, Safari borra el localStorage del sitio tras 7 días de uso de Safari sin abrir la app. Las apps agregadas a la pantalla de inicio no tienen ese límite, pero tampoco comparten datos con Safari: los datos se pasan con la copia de seguridad.
2. **Login y sincronización** de proyectos entre dispositivos (ver "Guardado de datos").
3. **Registro de productos y stock** para lo que vende en Marketplace: el dueño está armando un catálogo.
4. **Actualizar precios** de filamentos o traerlos de las tiendas (hoy están fijos al 24/09/2026).
5. **Medir la A1 real** con un medidor de enchufe: el calentamiento de 2 min de la cama es una estimación.

## Fuentes

Ver `docs/research.md`. Las principales:
- wiki.bambulab.com (consumo y resistencia de la cama);
- el foro de Bambu Lab (pico de ~1000 W, arranque de ~4 min);
- el pliego tarifario de UTE de enero de 2026;
- proyectocolor.uy y macrotec.com.uy (precios).
