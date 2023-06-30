const $ = (id) => document.getElementById(id) // shortcut for document.getElementById

// FUNCTIONS 

function renderLogs(logs) { // function to render logs in a body of a table
    const logs_list = $('logs_list')
    logs.forEach(log => {
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
                >Edit</button>
            </td>
            <td>
                <button 
                class="btn btn-danger btn-sm" 
                id="btn_delete_log_${log.id}"
                onclick="deleteLog(event)"
                data-identifier="${log.id}"
                >Delete</button>
            </td>
        `
        logs_list.appendChild(tr)
    })
}

async function renderNextLogs(start, step) {
    let newLogs = await window.electronAPI.logGetWithLimit(start, step);
    renderLogs(newLogs);
}


// EVENTS ON DOM CONTENT LOADED
document.addEventListener('DOMContentLoaded', async () => {
    await window.electronAPI.initDatabase() // function to initialize the database

    // GET FIRST 10 LOGS AND RENDER IN TABLE
    const logs = await window.electronAPI.logGetWithLimit(0, 10)
    renderLogs(logs)

    // GET AND RENDER MORE LOGS
    let isLoading = false; // Variable para rastrear si se está cargando actualmente
    let start = 10
    const step = 10
    
    const btn_show_more = $('btn_show_more')
    btn_show_more.addEventListener('click', async () => {
        if (isLoading) {
        return; // Si ya se está cargando, no hacer nada
        }
    
        isLoading = true; // Marcar como carga en progreso
        btn_show_more.disabled = true; // Deshabilitar el botón durante la carga
    
        await renderNextLogs(start, step) // Cargar más registros
        start = start + step; // Incrementar el valor de inicio para la próxima carga
    
        isLoading = false; // Marcar como carga completa
        btn_show_more.disabled = false; // Habilitar el botón nuevamente
    })
})

// EVENTS ON FORM SUBMIT
const newLogForm = $('log_form') // get the main form
//inputs
const logFrom = $('log_from')
const logTo = $('log_to')
const description = $('description')

newLogForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const log = { // create a log object
        log_from: logFrom.value,
        log_to: logTo.value,
        description: description.value
    }

    try { // try to save the log
        await window.electronAPI.logNew(log)
        alert('Log saved!')
        await location.reload() // reload the page to see the new log
    } catch (error) {
        alert('Error saving log')
    }
    
})


// EVENTS ON EDIT BUTTON CLICK 
const edit_newLogForm = $('edit_log_form') // get the edit form
// edit inputs
const edit_logFrom = $('edit_log_from')
const edit_logTo = $('edit_log_to')
const edit_description = $('edit_description')
// edit btn
const btn_save_changes = $('btn_save_changes')

async function editLog(e) {
  const identifier = e.target.dataset.identifier
  console.log(identifier)

  // get the log to edit and fill the inputs
  let log = await window.electronAPI.logGet(identifier)
  edit_logFrom.value = log.log_from
  edit_logTo.value = log.log_to
  edit_description.value = log.description
  //set the identifier to the save changes button
  btn_save_changes.dataset.identifier = identifier
}

btn_save_changes.addEventListener('click', async () => {
  const identifier = btn_save_changes.dataset.identifier
  const log = {
    id: identifier,
    log_from: edit_logFrom.value,
    log_to: edit_logTo.value,
    description: edit_description.value
  }
  try {
    // try to update the log
    await window.electronAPI.logUpdate(log)
    alert('Log saved!')
    await location.reload() // reload the page to see the updated log
  } catch (error) {
    alert('Error saving log')
  }
});


// EVENTS ON DELETE BUTTON CLICK
async function deleteLog(e) {
    const identifier = e.target.dataset.identifier
    try {
        // try to delete the log
        await window.electronAPI.logDelete(identifier)
        alert('Log deleted!')
        await location.reload() // reload the page to see the updated log
    } catch (error) {
        alert('Error deleting log')
    }
}


// EVENTS ON SEARCH FORM SUBMIT
const searchInput = document.getElementById('search_input');
const resultsTableBody = document.getElementById('logs_list');

let searchTimeout;

// Función de búsqueda que retorna una lista de registros coincidentes
async function searchRecords(text) {
  // Lógica de búsqueda y obtención de registros desde la base de datos
  const results = await window.electronAPI.logSearch(text)
  return results;
}

// Función para actualizar la tabla con los resultados de búsqueda
function updateTable(logs) {
  // Limpiar la tabla
  resultsTableBody.innerHTML = '';

  // Iterar sobre los resultados y agregar filas a la tabla
  logs.forEach(log => {
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
                >Edit</button>
            </td>
            <td>
                <button 
                class="btn btn-danger btn-sm" 
                id="btn_delete_log_${log.id}"
                onclick="deleteLog(event)"
                data-identifier="${log.id}"
                >Delete</button>
            </td>
        `
        logs_list.appendChild(tr)
    })
}

// Manejador del evento input en el input de búsqueda
searchInput.addEventListener('input', () => {
  // Limpiar el timeout anterior (si existe) para evitar búsquedas innecesarias
  clearTimeout(searchTimeout);

  // Obtener el texto del input de búsqueda
  const searchText = searchInput.value;

  // Establecer un nuevo timeout para retrasar la búsqueda
  searchTimeout = setTimeout(async () => {
    console.log('input')
    // Realizar la búsqueda y obtener los resultados
    const searchResults = await searchRecords(searchText);

    // Comprobar si el input está vacío
    if (searchText === '') {
        // Ejecutar la función cuando el input esté vacío
        const logs = await window.electronAPI.logGetWithLimit(0, 10)
        resultsTableBody.innerHTML = '';
        renderLogs(logs)
    }else{
        // Actualizar la tabla con los resultados
        updateTable(searchResults);
    }
  }, 500); // Esperar 500 ms antes de realizar la búsqueda (ajusta este valor según tus necesidades)
});

