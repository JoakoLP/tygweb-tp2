// Configuración de las APIs
const STRAPI_URL = 'https://gestionweb.frlp.utn.edu.ar/api/grupo22-peliculas';
const STRAPI_TOKEN = '8c457faa9e1976eda8492d0c470848626d5e7255008b189a8774819632c1e1c675acd69a6eaca57d7771e1c03e2b93b457f250d8007e6dcda81493b7199c7f76de93730cf2496417a057999bf78d10ddc89b11ecaa0e8787dc3abe97c79f69fde29cd958c93e7eb928419506215d60338d45ed8a9b71704b6c09a2050a64f86f';
const TMDB_API_KEY = 'b3c0719e1dc9e02c2bb08f162987bb0a';

let graficoInstancia = null;

// Controla la navegación entre secciones y la carga de datos
function mostrarSeccion(id) {
    document.querySelectorAll('.seccion').forEach(sec => sec.classList.remove('activa'));
    document.getElementById(`seccion-${id}`).classList.add('activa');

    if (id === 'visualizar') {
        cargarDatosStrapi();
    }
}

// Obtiene el Top 3 de películas del año en TMDB y las registra en Strapi si no existen
async function buscarYGuardar() {
    const anio = document.getElementById('input-anio').value;
    const divEstado = document.getElementById('mensaje-estado');
    const divVistaPrevia = document.getElementById('vista-previa');

    if (!anio) {
        alert('Por favor, ingresa un año válido.');
        return;
    }

    divEstado.style.color = 'black';
    divEstado.innerText = `Buscando las películas más populares de ${anio} en TMDB...`;
    divVistaPrevia.innerHTML = '';

    try {
        const urlTMDB = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=es-ES&sort_by=popularity.desc&primary_release_year=${anio}`;
        const resTMDB = await fetch(urlTMDB);

        if (!resTMDB.ok) {
            throw new Error('No se pudo conectar con la API de TMDB.');
        }

        const dataTMDB = await resTMDB.json();
        const top3 = dataTMDB.results.slice(0, 3);

        if (top3.length === 0) {
            divEstado.innerText = `No se encontraron películas para el año ${anio}.`;
            return;
        }

        divEstado.innerText = `Verificando registros existentes en la base de datos...`;

        const resExistentes = await fetch(`${STRAPI_URL}?filters[anio][$eq]=${anio}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${STRAPI_TOKEN}`
            }
        });

        const jsonExistentes = await resExistentes.json();
        const guardadas = jsonExistentes.data || [];

        let nuevasGuardadas = 0;

        for (const peli of top3) {
            const yaExiste = guardadas.some(item => {
                const p = item.attributes || item;
                return p.tmdb_id === peli.id || p.titulo === peli.title;
            });

            if (!yaExiste) {
                const payload = {
                    data: {
                        titulo: peli.title,
                        anio: parseInt(anio),
                        popularidad: peli.popularity,
                        tmdb_id: peli.id
                    }
                };

                const resStrapi = await fetch(STRAPI_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${STRAPI_TOKEN}`
                    },
                    body: JSON.stringify(payload)
                });

                if (!resStrapi.ok) {
                    throw new Error('Error al guardar las películas en Strapi.');
                }
                nuevasGuardadas++;
            }

            divVistaPrevia.innerHTML += `
                <div class="card-pelicula">
                    <h3>${peli.title}</h3>
                    <p><strong>Año:</strong> ${anio} | <strong>Popularidad:</strong> ${peli.popularity} ${yaExiste ? '<span style="color: #00adb5; font-size: 0.85em;">(Registrada previamente)</span>' : ''}</p>
                </div>
            `;
        }

        divEstado.style.color = 'green';
        if (nuevasGuardadas === 0) {
            divEstado.innerText = `Las 3 películas de ${anio} ya se encontraban registradas en Strapi.`;
        } else if (nuevasGuardadas < top3.length) {
            divEstado.innerText = `Se registraron ${nuevasGuardadas} películas nuevas de ${anio} (${top3.length - nuevasGuardadas} ya existían).`;
        } else {
            divEstado.innerText = `Se guardaron correctamente las 3 películas de ${anio} en Strapi.`;
        }

    } catch (error) {
        console.error(error);
        divEstado.style.color = 'red';
        divEstado.innerText = `Error: ${error.message}`;
    }
}

// Obtiene los datos almacenados en Strapi y renderiza la tabla y el gráfico
async function cargarDatosStrapi() {
    const tablaBody = document.getElementById('tabla-body');
    tablaBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Cargando datos...</td></tr>';

    try {
        const res = await fetch(`${STRAPI_URL}?pagination[limit]=100&sort=anio:desc`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${STRAPI_TOKEN}`
            }
        });

        if (!res.ok) {
            throw new Error(`Error al consultar la API (${res.status})`);
        }

        const json = await res.json();
        const peliculas = json.data;

        tablaBody.innerHTML = '';

        if (!peliculas || peliculas.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No hay datos registrados en el sistema.</td></tr>';
            return;
        }

        peliculas.forEach(item => {
            const p = item.attributes || item;
            tablaBody.innerHTML += `
                <tr>
                    <td>${p.anio}</td>
                    <td><strong>${p.titulo}</strong></td>
                    <td>${p.popularidad}</td>
                </tr>
            `;
        });

        renderizarGrafico(peliculas);

    } catch (error) {
        console.error(error);
        tablaBody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:red;">No se pudieron obtener los datos de Strapi.</td></tr>';
    }
}

// Genera el gráfico de barras con Chart.js
function renderizarGrafico(peliculas) {
    const ctx = document.getElementById('graficoPopularidad').getContext('2d');
    const datosGrafico = peliculas.slice(0, 30);

    const etiquetas = datosGrafico.map(item => {
        const p = item.attributes || item;
        return `${p.titulo} (${p.anio})`;
    });

    const valoresPopularidad = datosGrafico.map(item => {
        const p = item.attributes || item;
        return p.popularidad;
    });

    if (graficoInstancia) {
        graficoInstancia.destroy();
    }

    graficoInstancia = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: etiquetas,
            datasets: [{
                label: 'Popularidad',
                data: valoresPopularidad,
                backgroundColor: '#00adb5',
                borderColor: '#008c93',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: true, 
                    position: 'top',
                    labels: { color: '#eeeeee' }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#cccccc' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: { 
                    beginAtZero: true, 
                    title: { display: true, text: 'Popularidad', color: '#eeeeee' },
                    ticks: { color: '#cccccc' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
}