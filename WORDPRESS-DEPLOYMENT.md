# Guía de Instalación en WordPress

## Preparación

La aplicación ya está configurada y compilada para funcionar en WordPress. Los archivos están en la carpeta `dist/`.

## Pasos para Instalar

### 1. Subir archivos a WordPress

Conecta a tu servidor WordPress por FTP o cPanel y sigue estos pasos:

1. Ve a la carpeta raíz de tu WordPress (donde está `wp-content`)
2. Crea una nueva carpeta llamada `virtual-closet`
3. Sube TODO el contenido de la carpeta `dist/` a `virtual-closet/`

Tu estructura debería quedar así:
```
tu-wordpress/
├── wp-content/
├── wp-admin/
├── wp-includes/
├── virtual-closet/          ← Nueva carpeta
│   ├── index.html
│   ├── assets/
│   │   ├── index-[hash].css
│   │   └── index-[hash].js
```

### 2. Acceder a la aplicación

Una vez subidos los archivos, podrás acceder a tu closet virtual en:

```
https://tudominio.com/virtual-closet/
```

### 3. Configurar variables de entorno

**IMPORTANTE:** Antes de subir los archivos, asegúrate de que el archivo `.env` contiene:

```env
VITE_SUPABASE_URL=https://vinixzfqtulalhsmlcia.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbml4emZxdHVsYWxoc21sY2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNzQ2NTUsImV4cCI6MjA3OTc1MDY1NX0.uB4TTNFbI-wkYiIM1XoORY-EZD4zK3y-frn_WPwr7p0
VITE_GEMINI_API_KEY=AIzaSyBQC5lIEWmNzt7jTPpbpErVfTfNcWNRwJs
```

Estas variables ya están compiladas en el build, por lo que funcionarán automáticamente.

### 4. Configurar CORS en Supabase (opcional)

Si tienes problemas de acceso a la base de datos:

1. Ve a tu proyecto en [Supabase](https://supabase.com/dashboard)
2. Ve a Settings → API
3. Verifica que tu dominio de WordPress esté permitido

## Integración con WordPress

### Opción A: Enlace en el menú

Añade un enlace personalizado en tu menú de WordPress:
- URL: `https://tudominio.com/virtual-closet/`
- Texto: "Mi Closet Virtual"

### Opción B: Página dedicada con iframe

Crea una nueva página en WordPress y usa este código HTML:

```html
<iframe
  src="/virtual-closet/"
  style="width: 100%; min-height: 100vh; border: none;"
  title="Closet Virtual"
></iframe>
```

### Opción C: Redirección desde una página

Crea una página en WordPress y añade este código JavaScript:

```html
<script>
window.location.href = '/virtual-closet/';
</script>
```

## Cambiar la ruta de instalación

Si quieres usar una ruta diferente a `/virtual-closet/`:

1. Edita `vite.config.ts` y cambia la línea:
   ```typescript
   base: '/tu-nueva-ruta/',
   ```

2. Ejecuta:
   ```bash
   npm run build
   ```

3. Sube los archivos de `dist/` a la carpeta correspondiente en WordPress

## Base de Datos

La aplicación usa Supabase como base de datos, que es completamente independiente de WordPress. Esto significa:

✅ No necesitas configurar nada en la base de datos de WordPress
✅ Funciona desde cualquier dominio
✅ Los datos están seguros en la nube
✅ No afecta el rendimiento de tu WordPress

## Solución de Problemas

### La página se ve sin estilos
- Verifica que la carpeta `assets/` se haya subido correctamente
- Asegúrate de que los archivos CSS y JS estén en `virtual-closet/assets/`

### Error de conexión a base de datos
- Verifica las variables de entorno en `.env` antes de compilar
- Revisa la configuración de CORS en Supabase

### Las rutas no funcionan
- Asegúrate de que la carpeta se llama exactamente `virtual-closet`
- Si usas otro nombre, actualiza el `base` en `vite.config.ts` y recompila

## Seguridad

**NOTA IMPORTANTE:** La API key de Gemini está incluida en el código JavaScript del frontend. Esto significa que cualquier persona que inspeccione el código puede verla.

Para mayor seguridad, considera:
- Usar límites de cuota en Google Cloud Console
- Restringir la API key a dominios específicos
- Implementar un backend que maneje las llamadas a la API

## Soporte

Si tienes problemas, verifica:
1. Que los archivos estén en la ubicación correcta
2. Que tu servidor soporte aplicaciones JavaScript
3. Que no haya conflictos con plugins de WordPress (especialmente de caché)
