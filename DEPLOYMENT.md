# Guia de Despliegue en Hostinger

Ya he generado la versión de producción de tu aplicación. Sigue estos pasos para subirla a Hostinger:

## 1. Localizar los archivos
Los archivos listos para producción están en la carpeta **`dist`** de tu proyecto:
`d:\Trabajo\Proyectos\Closet\virtual-closet\dist`

Contenido importante que debes subir:
- `index.html`
- `.htaccess` (¡Muy importante para que funcionen las rutas!)
- Carpeta `assets`

## 2. Preparar en Hostinger
1. Entra al **Administrador de Archivos** de tu panel de Hostinger.
2. Navega a la carpeta de tu subdominio (ej: `public_html/app` o simplemente `public_html` si usas el dominio raíz).
3. **Borra todo el contenido anterior** que haya en esa carpeta para asegurar una instalación limpia (puedes hacer backup si quieres).

## 3. Subir la nueva versión
1. Selecciona **todos los archivos dentro de la carpeta `dist`** de tu PC.
2. Arrástralos al Administrador de Archivos de Hostinger.
   - Opcionalmente, puedes comprimir el contenido de `dist` en un `.zip`, subir el zip y descomprimirlo en Hostinger (es más rápido).

## ⚠️ Puntos clave
- Asegúrate de que el archivo `.htaccess` se suba. A veces está oculto en Windows/Mac. Este archivo es vital para que al recargar la página no dé Error 404.
- Si usas un subdominio, asegúrate de que la carpeta raíz sea la correcta.

¡Listo! Tu aplicación debería estar actualizada con los últimos cambios y correcciones.
