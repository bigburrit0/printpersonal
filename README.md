# Calculadora de impresión 3D (Bambu Lab A1 · UTE Triple Horario)

Calcula el costo real de cada impresión 3D en pesos uruguayos (luz por franja horaria + filamento) y el precio mínimo de venta. Permite guardar varios proyectos, cada uno con varias impresiones, y exportarlos o importarlos en un archivo.

## Cómo usarla en tu computadora

- **Ver:** abrí `index.html` en el navegador, o corré `npm start` y entrá a http://localhost:8080.
- **Probar:** `npm install` y después `npm test`. La prueba verifica los números del proyecto de ejemplo.

## Publicarla gratis, paso a paso

Vas a usar dos cuentas gratis:

- **GitHub**, que guarda el código en un repositorio privado. Es la misma cuenta que usa Claude Code en la nube.
- **Cloudflare Pages**, que publica la página.

Se configura una sola vez: después, cada cambio se publica solo.

### 1. Crear el repositorio en GitHub

1. **Cuenta:** entrá a github.com y creá una cuenta, si no tenés.
2. **Repositorio nuevo:** arriba a la derecha tocá **+** → **New repository**.
3. **Nombre:** poné `calculadora-impresion-3d`.
4. **Visibilidad:** elegí **Private**. No marques "Add a README": el proyecto ya trae uno.
5. **Crear:** tocá **Create repository**.

### 2. Subir los archivos

1. **Abrir el cargador:** en la página del repositorio vacío, tocá el enlace **uploading an existing file**.
2. **Arrastrar:** abrí esta carpeta en el Explorador de Windows, seleccioná **todo lo que hay adentro** y arrastralo a la página.
   - Tiene que incluir `.gitignore` y las carpetas `data`, `docs`, `scripts` y `tests`.
   - Arrastrá el contenido, no la carpeta `calculadora-impresion-3d` entera.
   - Si ves `node_modules` o `_site`, no los subas.
3. **Guardar:** abajo, tocá **Commit changes**.
4. **Comprobar:** en el repositorio tienen que aparecer `index.html`, `app.js` y la carpeta `scripts` con `build.sh` adentro.

### 3. Crear la cuenta de Cloudflare

1. **Cuenta:** entrá a dash.cloudflare.com y creá una cuenta gratis.
2. **Email:** confirmalo con el correo que te mandan.
3. **Sitio web:** no hace falta agregar un dominio ni un sitio web; si te lo ofrece, salteá ese paso.

### 4. Conectar Cloudflare con GitHub

1. **Pages:** en el menú de la izquierda andá a **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**. Si ves las opciones de Workers, elegí **Pages**.
2. **Autorizar:** tocá **GitHub** y entrá con tu cuenta.
3. **Repositorio:** cuando GitHub pregunte a qué repositorios dar acceso, elegí **Only select repositories** y marcá `calculadora-impresion-3d`. Después tocá **Install & Authorize**.
4. **Empezar:** elegí el repositorio y tocá **Begin setup**.

### 5. Configurar la publicación

| Campo | Qué poner |
|---|---|
| **Project name** | El nombre de la dirección. Por ejemplo, `calculadora-3d` da `calculadora-3d.pages.dev`. |
| **Production branch** | `main` |
| **Framework preset** | `None` |
| **Build command** | `sh scripts/build.sh` |
| **Build output directory** | `_site` |

Elegí bien el **Project name**: tus proyectos guardados quedan atados a esa dirección (ver "Para no perder tus proyectos").

Tocá **Save and Deploy**. Tarda unos minutos.

### 6. Comprobar que anda

1. **Abrir:** cuando termine, Cloudflare te muestra la dirección (`https://<nombre>.pages.dev`). Abrila.
2. **Revisar:** tiene que aparecer el proyecto de ejemplo "ajedrez medieval", con la Placa 1 a **$72,15** y un precio mínimo de **$150**.
3. **Probar en el celular:** abrí la misma dirección.

Solo se publican `index.html`, `styles.css`, `app.js` y `data/`. `docs/`, `tests/`, `CLAUDE.md` y este README quedan en el repositorio privado.

### Después: cómo se actualiza

- **Publicación automática:** cada cambio que llega a la rama `main` se publica solo, en unos minutos. Pasa tanto si lo subís vos como si lo hace Claude Code.
- **Ramas de prueba:** Claude Code en la nube suele trabajar en otra rama. Para cada rama, Cloudflare crea una **versión de prueba** en otra dirección (`<código>.<nombre>.pages.dev`), que sirve para mirar un cambio antes de pasarlo a `main`.
- **Datos separados:** las versiones de prueba no tienen tus proyectos. Tus datos están solo en la dirección principal.

## Para no perder tus proyectos

La app guarda los proyectos **en el navegador**, atados a la dirección exacta del sitio.

**Copia de seguridad:** en **Proyectos**, abajo, están **Exportar** e **Importar**.

- **Exportar** descarga un archivo `.json` con todos tus proyectos y tus ajustes. Guardalo en un lugar seguro, por ejemplo en Google Drive o en tu mail, y hacé una copia nueva cada tanto. La hoja te muestra la fecha de la última.
- **Importar** agrega los proyectos del archivo sin borrar ni pisar nada.
  - Si ya tenés un proyecto con exactamente las mismas impresiones, lo saltea.
  - Si un proyecto de la copia ya existe pero cambió desde entonces, lo agrega como copia "(importado)": no se pierde ninguna de las dos versiones.
  - Se puede deshacer con el botón del aviso.
- **Tus ajustes** (dólar, tarifas, márgenes) se importan solo si en ese navegador nunca los cambiaste.

**Cuándo usarla:**

- **Otro dispositivo:** para pasar tus proyectos a otro dispositivo o a otro navegador, exportás en uno e importás en el otro.
- **iPhone:**
  - Safari borra los datos del sitio si pasan 7 días de uso de Safari sin que abras la app.
  - Si la agregás a la pantalla de inicio, arranca vacía, porque no comparte datos con Safari: pasalos con Exportar e Importar.
- **Antes de cambiar de dirección:** no le cambies el nombre al proyecto de Cloudflare ni muevas la app a otro hosting sin exportar primero.
- **Borrar los datos de navegación** también borra los proyectos: por eso conviene tener la copia al día.
