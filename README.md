# Portafolio — Valentina Moreno

Portafolio profesional de **Valentina Moreno**, desarrolladora Full Stack (React · TypeScript · Node.js)
con foco en el sector fintech. Bilingüe (ES/EN), con escena 3D interactiva, efecto parallax y
animaciones ligadas al scroll.

---

## Stack

| Área | Tecnologías |
| --- | --- |
| Base | React 19, Vite 8, JavaScript (ESM) |
| Estilos | Tailwind CSS 4 con sistema de diseño propio (`@theme`) |
| Rutas | react-router-dom 7 (`BrowserRouter`) |
| 3D | three.js + @react-three/fiber (sin drei: los ayudantes se implementaron a mano) |
| Animación | Motion (Framer Motion), Lenis (scroll suave), react-parallax-tilt |
| Contenido | JSON bilingüe + Context de React con persistencia en `localStorage` |
| Iconos | lucide-react + react-icons |
| Extras | react-countup, react-intersection-observer, SweetAlert2, EmailJS |
| Minijuego | Motor propio en `<canvas>` + efectos de sonido sintetizados (Web Audio) |
| Despliegue | Vercel / cualquier hosting estático |

---

## Puesta en marcha

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción en dist/
npm run preview  # previsualiza el build
```

### Variables de entorno

El formulario de contacto usa EmailJS. Copia `.env.example` como `.env` y rellena las claves:

```bash
VITE_EMAILJS_PUBLIC_KEY=...
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_ID=...
```

Si no defines estas variables, se usan unos valores por defecto heredados para no romper
el despliegue actual. **Recomendado:** define las tuyas y añádelas también en el hosting.

---

## Estructura

```
src/
├── App.jsx                 # composición de la página y orden de secciones
├── main.jsx                # punto de entrada
├── config/emailjs.js       # credenciales desde variables de entorno
├── data/
│   ├── content.es.json     # TODO el contenido en español
│   ├── content.en.json     # TODO el contenido en inglés
│   └── sections.js         # orden y anclas de las secciones
├── hooks/
│   ├── useSmoothScroll.js  # Lenis + respeto por "movimiento reducido"
│   ├── useActiveSection.js # resalta el enlace activo del menú
│   └── useWebGLSupport.js  # detecta WebGL antes de montar el 3D
├── i18n/LanguageProvider.jsx
├── game/
│   ├── RunnerGame.js      # motor del minijuego (física, colisiones, dibujo en canvas)
│   └── GameSound.js       # efectos de sonido sintetizados con Web Audio
├── pages/NotFound.jsx     # página 404 con el minijuego
├── styles/main.css         # sistema de diseño (tokens, tipografías, utilidades)
└── components/
    ├── layout/   Navbar, Footer, NoiseOverlay
    ├── sections/ Hero, About, Skills, Projects, Experience, Services, Contact
    ├── game/     Runner (canvas + HUD + controles)
    ├── three/    Hero3D (carga diferida), HeroScene, NetworkMesh, WebGLFallback
    └── ui/       botones, tarjetas, parallax, contadores, iconos…
```

### Rutas

| Ruta | Vista |
| --- | --- |
| `/` | Portafolio completo |
| `/cualquier-otra-cosa` | Página 404 con el minijuego |

Las secciones se enlazan con anclas normales (`/#proyectos`), así que puedes
compartir un enlace directo a cualquier sección.

> **Importante para el hosting:** al usar `BrowserRouter`, el servidor debe
> devolver `index.html` en las rutas desconocidas. En Vercel ya está resuelto con
> [`vercel.json`](vercel.json). En Netlify añade un archivo `_redirects` con
> `/*  /index.html  200`; en GitHub Pages tendrías que copiar `index.html` a
> `404.html`. Sin esa regla, los enlaces profundos darían un 404 del servidor
> (la portada seguiría funcionando).

---

## El minijuego del 404

La página 404 incluye **«Cubo infinito»**, un runner de un solo botón al estilo
Geometry Dash:

- Salto con `Espacio`, `↑`, `W`, `Enter` o clic/toque; reinicio con `R`.
- Velocidad progresiva, patrones de obstáculos variados (pinchos, bloques,
  escaleras) y monedas opcionales.
- Partículas de explosión, sacudida de cámara, rastro del cubo y récord guardado
  en `localStorage`.
- Sonido generado en el navegador (sin archivos de audio), con botón de silencio.
- Respeta `prefers-reduced-motion`: sin sacudida de cámara y con el ratón más
  contenido, pero el juego sigue siendo jugable (es intrínsecamente animado).

---

### Orden de las secciones y por qué

1. **Hero** — propuesta de valor, estado de disponibilidad, escena 3D y stack.
2. **Sobre mí** — relato profesional + métricas + forma de trabajar.
3. **Stack técnico** — tecnologías agrupadas por responsabilidad.
4. **Proyectos** — casos de estudio con estructura reto → solución → decisiones → resultado.
5. **Experiencia** — línea de tiempo profesional.
6. **Servicios** — en qué puede aportar a un equipo.
7. **Contacto** — canales directos y formulario.

El recorrido responde a las preguntas que se hace un reclutador en orden:
*quién es → con qué trabaja → qué ha construido → dónde lo ha aplicado → qué ofrece → cómo contactarla.*

---

## Cómo editar el contenido

Todo el texto vive en `src/data/content.es.json` y `src/data/content.en.json`.
Ambos archivos tienen **exactamente la misma estructura**: si añades una clave en uno,
añádela en el otro para que el cambio de idioma no muestre huecos.

Los textos en `[CORCHETES]` son huecos intencionados y se muestran resaltados en ámbar
en la interfaz. Ver la sección siguiente.

---

## ✅ Pendiente de completar

Estos campos están marcados con corchetes y **deben sustituirse por datos reales** antes
de publicar el portafolio. Se ven resaltados en ámbar en la propia web.

- [ ] **Métrica de impacto** (`about.stats`, entrada `impact`) — hoy no muestra número.
- [ ] **Resultado de cada proyecto** (`projects.items[].result`) — 4 proyectos.
- [ ] **Experiencia 1** — periodo, empresa, ciudad y 3 logros medibles.
- [ ] **Experiencia 2** — periodo, empresa, ciudad y 2 logros.
- [ ] **Experiencia 3** — periodo, rol, empresa, ciudad, resumen y 1 logro.
- [ ] **CV descargable** (`contact.cvHref`) — súbelo a `public/` y pon la ruta
  (p. ej. `/cv-valentina-moreno.pdf`). El botón solo aparece cuando hay valor.
- [ ] **Repositorios** (`projects.items[].links.code`) — están vacíos; añade la URL
  de cada repo para que aparezca el botón «Ver código».
- [ ] **Imágenes de los proyectos** — hoy son capturas de las apps. Sustituirlas por
  capturas del *dashboard* en uso mejora mucho la primera impresión.

> Las métricas solo funcionan si son verificables. Es mejor una cifra modesta y real
> («reduje el tiempo de carga un 30 %») que un número redondo sin respaldo.

---

## Accesibilidad y rendimiento

- Enlace «saltar al contenido» y foco visible en todos los elementos interactivos.
- Navegación completa por teclado, incluido el menú móvil (se cierra con `Escape`).
- Se respeta `prefers-reduced-motion`: si está activo, se desactivan Lenis, el tilt,
  los contadores y las animaciones de entrada; el contenido nunca queda oculto.
- La escena 3D solo se carga cuando el navegador está ocioso y hay soporte WebGL;
  si no lo hay, se muestra un degradado estático.
- Tipografías auto-alojadas (sin peticiones a Google Fonts → mejor rendimiento y GDPR).
- `three.js` va en un chunk aparte que se descarga después del contenido principal.

### Peso del build

| Chunk | Gzip | Cuándo se descarga |
| --- | --- | --- |
| `index` (app + router + juego) | ~51 kB | En la carga inicial |
| `react` | ~120 kB | En la carga inicial |
| `motion` | ~46 kB | En la carga inicial |
| `lenis` | ~6 kB | En la carga inicial |
| CSS + tipografías | ~28 kB | En la carga inicial |
| `three` + `HeroScene` | ~242 kB | Diferido: cuando el navegador está ocioso y hay WebGL |

El camino crítico ronda los **250 kB gzip**; three.js no compite con el primer render.

---

## Scripts de verificación

Dos scripts levantan Chrome en modo headless vía el protocolo DevTools (sin
puppeteer ni playwright), recorren la interfaz, capturan pantallas y reportan
errores de runtime y de layout:

```bash
# necesita el servidor en el puerto 5199 (npm run dev o npm run preview)
node --experimental-websocket scripts/verify.mjs 5199 tmp-screens      # portafolio: secciones, idioma, móvil, anclas, 404
node --experimental-websocket scripts/verify-404.mjs 5199 tmp-screens  # 404 + minijuego: saltar, chocar, reiniciar, récord
node --experimental-websocket scripts/diag.mjs 5199 /ruta              # diagnóstico puntual de una ruta
```

`verify-404.mjs` pulsa teclas reales (`Input.dispatchKeyEvent`) y comprueba el
estado interno del motor, la altura del salto, las partículas del choque y el
reinicio. Las capturas quedan en `tmp-screens/` (ignorado por git).

---

## Autora

**Valentina Moreno** — [GitHub](https://github.com/valemorenodev) ·
[LinkedIn](https://www.linkedin.com/in/diana-valentina-moreno/)
