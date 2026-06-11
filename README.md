# cv-ciscojmg

Currículum interactivo con apariencia de IDE (inspirado en Cursor): explorador de archivos `.md`, pestañas, editor Monaco en solo lectura, terminal ficticia y paleta de comandos.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Vista previa Markdown

Por defecto los archivos se muestran **renderizados** (no en texto plano). En la barra del editor puedes cambiar:

- **Vista previa** — HTML renderizado (por defecto)
- **Código fuente** — Monaco (solo lectura)

Cambia de vista con los botones sobre el editor, clic en la barra de estado, `Ctrl+Shift+V`, o la paleta (`Ctrl+Shift+P`).

**Tema:** clic en el nombre del tema en la barra de estado (abajo a la derecha) o en el botón «Tema: …» sobre el editor.

### Imágenes

Coloca imágenes junto al `.md` o en `public/`:

```markdown
<!-- Relativa al archivo (recomendado) -->
![Mi foto](./avatar.png)

<!-- Desde public/ (ruta absoluta del sitio) -->
![Logo](/assets/logo.png)
```

Ejemplo: en `content/about/profile.md` usa `![](./avatar.png)` y guarda la imagen en `content/about/avatar.png`.

También puedes usar URLs externas (`https://…`).

## Añadir contenido

Crea archivos `.md` dentro de `content/`:

```
content/
  README.md
  about/profile.md
  experience/mi-empresa.md
```

El árbol del explorador se genera automáticamente en el build.

## Temas

Cuatro temas: **Cursor Dark**, **Cursor Light**, **Midnight**, **Dark Purple** (por defecto).

- Paleta de comandos: `Ctrl+Shift+P` → busca "Tema"
- Terminal: `theme dark` | `theme light` | `theme midnight` | `theme purple`

## GitHub Pages

### 1. Configurar la URL base

Vite usa la variable `VITE_BASE_PATH` como `base` del sitio:

| Tipo de sitio | Valor de `VITE_BASE_PATH` |
|---------------|---------------------------|
| `https://usuario.github.io/repo/` | `/repo/` (barra final incluida) |
| `https://usuario.github.io/` (repo `usuario.github.io`) | `/` |

**Ejemplo** para `https://ciscojmg.github.io/cv-ciscojmg/`:

```bash
VITE_BASE_PATH=/cv-ciscojmg/ npm run build
```

### 2. Variable en GitHub (recomendado)

En el repositorio: **Settings → Secrets and variables → Actions → Variables**

- Nombre: `VITE_BASE_PATH`
- Valor: `/cv-ciscojmg/` (ajusta según tu repo)

El workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) usa esa variable; si no existe, usa `/cv-ciscojmg/` por defecto.

### 3. Activar Pages

**Settings → Pages → Build and deployment → Source: GitHub Actions**

Cada push a `main` despliega automáticamente el build de `dist/` (no uses «Deploy from a branch»).

### Build manual

```bash
npm run build
npm run preview
```

## Atajos

| Atajo | Acción |
|-------|--------|
| `Ctrl+Shift+P` | Paleta de comandos |
| `Ctrl+P` | Abrir archivo rápido |
| `Ctrl+B` | Alternar barra lateral |
| `Ctrl+J` / `⌘J` | Alternar terminal |
| `Ctrl+W` | Cerrar pestaña activa |

En macOS usa `Cmd` en lugar de `Ctrl`.

## Terminal (comandos)

`help`, `ls`, `cat`, `open`, `theme`, `clear`, `whoami`, `pwd`, `files`
