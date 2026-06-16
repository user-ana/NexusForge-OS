# NexusForge OS — Plataforma de Gestión de Proyectos Gamificada

**NexusForge OS** es un entorno operativo web colaborativo, gamificado y en tiempo real diseñado específicamente para la gestión de proyectos de ingeniería de software académicos. La plataforma consolida el control de entregables, el seguimiento de tareas a largo plazo y la interacción competitiva en un único ecosistema unificado de alto rendimiento.

Inspirada en el diseño de plataformas de alta densidad de información como Discord y Twitch, NexusForge OS ofrece una experiencia visual envolvente, interactiva y técnicamente rigurosa.

---

## Características Principales

### 1. Centralización de Entregables

Elimina la dispersión de información al consolidar código, documentación y videos demostrativos en una sola vista unificada de proyecto.

### 2. Tablero Kanban Estricto

Permite el seguimiento del avance grupal y la asignación de tareas individuales de forma clara, eliminando la opacidad en el desarrollo de los proyectos.

### 3. Chat en Vivo e Hilos de Discusión

Sustituye la comunicación informal y fragmentada mediante hilos de discusión contextuales y un sistema de chat síncrono integrado directamente en los paneles de equipo.

### 4. Gamificación Competitiva y Duelos

Los proyectos son expuestos públicamente para someterse a la retroalimentación y escrutinio de la comunidad:

- **Duelos de Proyectos:** Enfrentamientos públicos donde los equipos demuestran su progreso.
- **Economía de Votos (Monedas):** Cada voto positivo válido de un usuario registrado actúa como una moneda inyectada directamente al proyecto.
- **Rangos de Clasificación Dinámica:** Los proyectos avanzan de rango automáticamente según su volumen de interacción (votos, estrellas, comentarios):
  $$\text{Bronce} \longrightarrow \text{Plata} \longrightarrow \text{Oro} \longrightarrow \text{Platino} \longrightarrow \text{Diamante}$$

---

## Identidad Visual y Experiencia de Usuario (UX/UI)

El diseño visual de la plataforma sigue directrices estrictas para priorizar la inmersión técnica y mitigar la fatiga visual en sesiones prolongadas:

- **Paleta de Colores Base:** Esquema _Ultra-Dark_ dominante empleando grises oscuros y azul marino profundo (`#0B0E14` a `#151A22`) para fondos de contenedores y paneles primarios. Texto base en gris claro suave (`#E2E8F0`).
- **Colores de Acento:** Violeta eléctrico y azul neón de alta saturación para representar estados activos, llamadas a la acción, notificaciones en tiempo real e indicadores de flujo en vivo.
- **Layout Multi-Panel (Estilo Discord):**
  - **Panel Izquierdo:** Navegación estática de clases y canales.
  - **Panel Central:** Espacio de trabajo reactivo (tableros Kanban, perfil del proyecto, feed de comentarios).
  - **Panel Derecho:** Control de presencia en tiempo real (miembros activos y chat de grupo en vivo).
- **Indicadores Reactivos:** Las tarjetas de proyecto muestran bordes iluminados con glows que corresponden al rango actual del proyecto (por ejemplo, resplandor dorado para rango **Oro** o cian cibernético para rango **Diamante**).

---

## Matriz de Roles y Permisos (RBAC)

El acceso y las acciones dentro de la plataforma se rigen por un sistema estricto de control de accesos para asegurar la integridad de las evaluaciones académicas:

| Permiso / Acción                                    | Maestro |       Estudiante       | Visitante |
| :-------------------------------------------------- | :-----: | :--------------------: | :-------: |
| Crear "Clases" y generar códigos de acceso          | **Sí**  |           No           |    No     |
| Crear "Grupos" e invitar/asignar miembros           | **Sí**  |         **Sí**         |    No     |
| Vincular Repositorios de GitHub y URL de despliegue |   No    | **Sí** (Propio Grupo)  |    No     |
| Operaciones CRUD en el Tablero Kanban del Grupo     |   No    | **Sí** (Propio Grupo)  |    No     |
| Enviar Mensajes en el Chat en Vivo del Grupo        |   No    | **Sí** (Propio Grupo)  |    No     |
| Ver Proyectos Públicos y Calificar con Estrellas    | **Sí**  |         **Sí**         |  **Sí**   |
| Acumular Monedas en Duelos                          |   No    | **Sí** (Voto recibido) |    No     |

---

## Arquitectura y Modelado de Datos

El diseño lógico utiliza entidades relacionales optimizadas para PostgreSQL mediante la especificación Prisma ORM:

- **Clase:** Unidad organizativa permanente del aula virtual (persiste indefinidamente para auditorías).
- **Grupo:** Unidad de trabajo conformada por estudiantes (público o privado).
- **Proyecto:** El núcleo de los metadatos técnicos (GitHub repo, deploy URL, monedas acumuladas, promedio de calificación y rango).
- **Tarea:** Entidad de control atómica mapeada al tablero Kanban del grupo (`TODO`, `DOING`, `DONE`).
- **Comentarios:** Hilos cronológicos inversos de discusión pública adjuntos al perfil del proyecto.

---

## Stack Tecnológico

La plataforma aprovecha un ecosistema homogéneo basado en **TypeScript**:

- **Frontend:** [Next.js](https://nextjs.org/) (App Router) y [Tailwind CSS](https://tailwindcss.com/) (v4).
- **Base de Datos y ORM:** [PostgreSQL](https://www.postgresql.org/) gestionado con [Prisma ORM](https://www.prisma.io/).
- **Autenticación y Almacenamiento:** [Supabase](https://supabase.com/) (para Auth robusto y Storage de buckets de imágenes/archivos).
- **Tiempo Real:** Servidor independiente en [Node.js](https://nodejs.org/) con [Socket.IO](https://socket.io/) para comunicación bidireccional continua.

---

## Mitigación de Riesgos Arquitectónicos

### 1. Conexiones WebSocket vs. Entornos Serverless

> [!IMPORTANT]
> Las plataformas de alojamiento Serverless tradicionales (como Vercel) no soportan conexiones WebSocket persistentes (Socket.IO).
>
> **Mitigación:** Se prohíbe alojar el socket en las API Routes de Next.js. El backend de tiempo real está estrictamente desacoplado. Next.js gestiona el renderizado web y _Server Actions_, mientras que un servidor dedicado de Node.js (desplegado en contenedor persistente como Railway, Render, VPS o EC2) aloja Socket.IO con conexión directa a la base de datos PostgreSQL.

### 2. Fraude en Votación de Visitantes Anónimos

> [!WARNING]
> Permitir votos anónimos que alteren la economía del juego expone el sistema a inyecciones masivas de votos falsos (vía scripts o proxies), destruyendo la competitividad.
>
> **Mitigación:** Los votos de usuarios con perfil **Visitante** se almacenan únicamente de forma local en la sesión del navegador (`localStorage`) como una métrica informativa secundaria de popularidad. Las **Monedas** reales y los cambios dinámicos de rango requieren estrictamente votos de **Maestros** o **Estudiantes** autenticados con cuentas institucionales.

---

## Desarrollo Local

### Requisitos Previos

Asegúrate de contar con Node.js (v18+) e npm instalados en tu sistema.

### Instalación de Dependencias

Instala los paquetes necesarios en el directorio raíz:

```bash
npm install
```

### Ejecutar Servidor de Desarrollo

Inicia el entorno de desarrollo local:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.
