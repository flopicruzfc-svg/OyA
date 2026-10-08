# Gestión interna del estudio

App de gestión interna (clientes, proyectos, tareas, calendario, equipo) en React 18 + htm, sin paso de compilación.

## Estructura
- `index.html`  – HTML base, carga React, ReactDOM y htm desde CDN
- `css/styles.css` – estilos (tema claro/oscuro con variables CSS)
- `js/app.js` – lógica y pantallas de la app

## Uso
Abrir `index.html` en el navegador, o servir la carpeta (`python3 -m http.server`).

## Importante
La app obtiene base de datos, usuario y archivos desde el runtime de artifacts de Claude
(`window.claude.use('db' | 'user' | 'assets')`). Fuera de claude.ai esas capacidades no existen,
así que no hay persistencia ni login hasta que se reemplacen por tu propio backend.
