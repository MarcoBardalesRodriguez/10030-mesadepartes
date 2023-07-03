const $ = (id) => document.getElementById(id) // shortcut for document.getElementById

// EVENTS ON DOM CONTENT LOADED
// document.addEventListener('DOMContentLoaded', () => {
window.electronAPI.initDatabase()
    .then(() => console.log('database initialized successfuly'))
    .catch((error) => console.log(error))

const containerLogs = $('container_logs') // container where the logs will be rendered

// FUNCTIONS 

async function renderLogs(logs, container) {
    // function to render logs in a html element
    // @logs: array of logs
    // @container: html element where the logs will be rendered
    await logs.forEach(log => {
        const tr = document.createElement('tr')
        tr.innerHTML = `
            <td>${log.id}</td>
            <td>${log.date}</td>
            <td>${log.log_from}</td>
            <td>${log.log_to}</td>
            <td>${log.description}</td>
            <td>
                <button 
                class="btn btn-warning btn-sm" 
                onclick="editLog(event)" 
                data-identifier="${log.id}"
                type="button"
                data-toggle="modal"
                data-target="#ModalCenter"
                >Editar</button>
            </td>
            <td>
                <button 
                class="btn btn-danger btn-sm" 
                onclick="deleteLog(event)"
                data-identifier="${log.id}"
                >Borrar</button>
            </td>
        `
        container.appendChild(tr)
    })
}

async function renderOnLoadedDOM(container) {
    // function to render logs when the DOM is loaded
    // @container: html element where the logs will be rendered
    let newLogs = await window.electronAPI.logGetWithLimit(0, 10)
    container.innerHTML = ''
    console.log('container cleared')
    await renderLogs(newLogs, container)
    start = 10 // start index for the next logs
}
async function renderNextLogs(start, step, container) {
    // function to render more logs in a html element
    // @start: start index
    // @step: number of logs to get
    // @container: html element where the logs will be rendered
    let newLogs = await window.electronAPI.logGetWithLimit(start, step);
    await renderLogs(newLogs, container);
}

async function renderSearchResults(search, container) {
    // function to render search results in a html element
    // @search: search string
    // @container: html element where the logs will be rendered
    let resultLogs = await window.electronAPI.logSearch(search);
    container.innerHTML = ''
    console.log('container cleared')
    await renderLogs(resultLogs, container)
}

function reloadAndFocusTable() {
    location.hash = '#container_logs'
    location.reload()
}



// GET FIRST LOGS AND RENDER IN TABLE
document.addEventListener('DOMContentLoaded', () => {
    renderOnLoadedDOM(containerLogs)
        .then(() => console.log('logs rendered successfuly'))
        .catch((error) => console.log(error))
})


// SEARCH LOGS
const searchInput = document.getElementById('search_input');
let searchTimeout;

searchInput.addEventListener('input', () => {
    // Limpiar el timeout anterior (si existe) para evitar búsquedas innecesarias
    clearTimeout(searchTimeout)

    const searchText = searchInput.value // Obtener el texto del input de búsqueda
    console.log(searchText)

    // Establecer un nuevo timeout para retrasar la búsqueda
    searchTimeout = setTimeout(() => {
        console.log(searchText)

        // Comprobar si el input está vacío
        if (searchText === '') {
            renderOnLoadedDOM(containerLogs)
                .then(() => {
                    console.log('logs rendered successfuly')
                    btnShowMore.disabled = false; // Habilitar el botón nuevamente
                })
                .catch((error) => {
                    console.log(error)
                    btnShowMore.disabled = false; // Habilitar el botón nuevamente
                })
        } else {
            renderSearchResults(searchText, containerLogs)
                .then(() => {
                    console.log('logs rendered successfuly')
                    btnShowMore.disabled = true; // Deshabilitar el botón durante las busquedas
                })
                .catch((error) => {
                    console.log(error)
                    btnShowMore.disabled = true; // Deshabilitar el botón durante las busquedas
                })
        }
    }, 500); // Esperar 500 ms antes de realizar la búsqueda 
});


// SAVE NEW LOG
const formNewLog = $('form_new_log') // get the main form
//inputs
const inpFrom = $('inp_from')
const inpTo = $('inp_to')
const inpDescription = $('inp_description')

formNewLog.addEventListener('submit', async (e) => {
    e.preventDefault();
    const log = {
        log_from: inpFrom.value,
        log_to: inpTo.value,
        description: inpDescription.value
    };

    try {
        await window.electronAPI.logNew(log);
        console.log('log saved successfully');
        // alert('Log saved!');
        reloadAndFocusTable()
    } catch (error) {
        console.log(error);
    }
});


// EDIT LOG
const formEditLog = $('form_edit_log') // get the edit form
// edit inputs
const inpEditFrom = $('inp_edit_from')
const inpEditTo = $('inp_edit_to')
const inpEditDescription = $('inp_edit_description')
const btnSaveChanges = $('btn_save_changes') // button to save changes

function editLog(e) {
    // function que obtiene el log a editar, llena los inputs
    // y asigna el id al botón de guardar cambios
    // @e: event
    const identifier = e.target.dataset.identifier
    console.log(identifier)

    window.electronAPI.logGet(identifier)
        .then((log) => {
            console.log(inpEditFrom.value)
            inpEditFrom.value = log.log_from
            inpEditTo.value = log.log_to
            inpEditDescription.value = log.description
            btnSaveChanges.dataset.identifier = identifier
        })
        .catch((error) => console.log(error))
}

btnSaveChanges.addEventListener('click', () => {
    const identifier = btnSaveChanges.dataset.identifier
    console.log(identifier)
    const log = {
        id: identifier,
        log_from: inpEditFrom.value,
        log_to: inpEditTo.value,
        description: inpEditDescription.value
    }
    window.electronAPI.logUpdate(log)
        .then(() => {
            console.log('log updated successfuly')
            reloadAndFocusTable()
        })
        .catch((error) => console.log(error))
})


// DELETE LOG
function deleteLog(e) {
    const identifier = e.target.dataset.identifier;
    window.electronAPI.logDelete(identifier)
        .then(() => {
            console.log('log deleted successfully');
            reloadAndFocusTable()
        })
        .catch((error) => {
            console.log(error);
        });
}


// RENDER MORE LOGS
const btnShowMore = $('btn_show_more') // button to show more logs

let isLoading = false; // Variable para rastrear si se está cargando actualmente
let start = 10
const step = 10

btnShowMore.addEventListener('click', () => {
    if (isLoading) return; // Si ya se está cargando, no hacer nada

    // Si no se está cargando
    isLoading = true; // Marcar como carga en progreso
    btnShowMore.disabled = true; // Deshabilitar el botón durante la carga

    renderNextLogs(start, step, containerLogs)
        .then(() => {
            console.log('logs rendered successfuly')
            start = start + step; // Incrementar el valor de inicio para la próxima carga
            isLoading = false; // Marcar como carga completa
            btnShowMore.disabled = false; // Habilitar el botón nuevamente
        })
        .catch((error) => {
            console.log(error)
            isLoading = false; // Marcar como carga completa
            btnShowMore.disabled = false; // Habilitar el botón nuevamente
        })
})

