# CV en PDF — Francisco Javier Mujica García

CV en **formato de resumen americano**: una sola página, en español, enfocado en logros.

## Archivos

- `cv-francisco-mujica.html` — fuente editable del CV (HTML + CSS, autocontenido).
- `cv-francisco-mujica.pdf` — PDF listo para enviar (tamaño Carta / Letter).

## Cómo editar

Abre `cv-francisco-mujica.html` y edita el texto. Para previsualizar, ábrelo en cualquier navegador.

## Cómo regenerar el PDF

### Opción A — Desde el navegador (la más simple)

1. Abre `cv-francisco-mujica.html` en Chrome o Edge.
2. `Ctrl + P` → Destino: **Guardar como PDF**.
3. Tamaño de papel: **Carta (Letter)** · Márgenes: **Ninguno** · activa **Gráficos de fondo**.
4. Guardar.

### Opción B — Automático (PowerShell, sin abrir nada)

```powershell
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$html = "$PWD\cv-francisco-mujica.html"
$pdf  = "$PWD\cv-francisco-mujica.pdf"
$uri  = ([System.Uri]$html).AbsoluteUri
Start-Process -FilePath $edge -ArgumentList @(
  "--headless=new","--disable-gpu","--no-pdf-header-footer",
  "--print-to-pdf=`"$pdf`"","`"$uri`""
) -NoNewWindow -Wait
```

> Ejecútalo dentro de la carpeta `cv-pdf/`.
