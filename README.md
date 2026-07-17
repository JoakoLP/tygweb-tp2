# TP Nro 2: Strapi
**Asignatura:** Tecnología y Gestión Web  
**Universidad:** UTN - Facultad Regional La Plata (FRLP)  
**Carrera:** Ingeniería en Sistemas de Información  
**Grupo:** 22  
**Integrantes:** 
 - Esperanza Franco
 - Islas Tomas
 - Takara Joaquin
 - Veliz Condori Ruben

---

## 📋 Descripción del Proyecto
Este proyecto resuelve el problema asignado para el Trabajo Práctico Grupal Nro 2: **"Obtener las 3 películas más populares estrenadas en un año específico"**. 

El sistema permite al usuario consultar la API externa de **The Movie Database (TMDB)** filtrando por año de estreno, procesar la respuesta mediante reglas de negocio para capturar exclusivamente el Top 3 de popularidad, y persistir automáticamente los registros en una instancia compartida del manejador de contenidos **Strapi (Headless CMS)**. Posteriormente, la aplicación recupera el historial de datos almacenados en Strapi y los presenta a través de una tabla dinámica y un gráfico de barras comparativo.

---

## 🛠️ Tecnologías y Librerías Utilizadas
* **Frontend:** HTML5, CSS3 (Diseño responsivo con estética *Dark Mode* y efecto *Glassmorphism*).
* **Lógica de Cliente:** JavaScript (ES6+ puro, consumo de servicios asíncronos con `Fetch API` y `async/await`).
* **Backend / CMS:** [Strapi Headless CMS](https://strapi.io/) (Instancia provista por la cátedra en servidor universitario).
* **Visualización de Datos:** [Chart.js v4](https://www.chartjs.org/) (Renderizado de gráficos estadísticos en canvas HTML).
* **API de Datos:** [TMDB API v3](https://developer.themoviedb.org/docs/getting-started) (`GET /discover/movie`).

---

## 📁 Estructura del Repositorio
```text
TP-2/
└── Grupo22/
    ├── index.html       # Estructura del maquetado (Layout de cabecera, menú lateral, central y pie)
    ├── styles.css       # Hoja de estilos (Paleta oscura, vidrio esmerilado y estructura firme)
    ├── app.js           # Lógica de integración (Peticiones TMDB, POST/GET Strapi y Chart.js)
    ├── logo.png         # Activo gráfico para la cabecera de la universidad
    └── README.md        # Documentación de arquitectura y uso del sistema