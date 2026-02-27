# Scripts

## Create Demo Users

Este script crea 17 usuarios de demostración usando el servicio `adminService` de la aplicación.

### Instalación

Primero, instala las dependencias necesarias (si no lo has hecho):

```bash
npm install tsx --save-dev
```

### Uso

Simplemente ejecuta el script:

```bash
npx tsx scripts/create-demo-users.ts
```

### Usuarios creados

El script creará 17 usuarios con los siguientes emails y nombres:

1. Lucia@chicasguapas.tv - Lucia Demo
2. arianadelafuent@gmail.com - Ariana De la Fuente
3. Info.catale@gmail.com - Catale Info
4. fiorellaacri@gmail.com - Fiorella Acri
5. puppa.careaga@gmail.com - Puppa Careaga
6. sandrabarreraj@gmail.com - Sandra Barrera
7. solmacaluso@gmail.com - Solma Caluso
8. Antomaglietti@gmail.com - Anto Maglietti
9. Info@andreinaespino.com - Andreina Espino
10. snesi@itimegroup.com.ar - Snesi ITime
11. CFigari@hotmail.com - C Figari
12. joseibarramia@icloud.com - Jose Ibarramia
13. Andrea@thetourismlab.com - Andrea Tourism
14. jackie@longevitypragency.com - Jackie Longevity
15. Cristianfabianalidelaflor@gmail.com - Cristian De la Flor
16. Sm@unicoin.com - SM Unicoin
17. Waiteagustina@gmail.com - Agustina Waite

**Contraseña para todos:** `Demo2026@`

### Notas

- Los emails se confirman automáticamente (no requieren verificación)
- El script incluye un delay de 1 segundo entre creaciones para evitar problemas
- Si un usuario ya existe, se mostrará un error pero el script continuará con los demás
- Todos los usuarios se crean con rol 'user'
- Los campos `terms_accepted` y `onboarding_completed` se establecen en `false`

