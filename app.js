const recordButton = document.getElementById("recordButton");
const status = document.getElementById("status");
const notesTableBody = document.getElementById("notesTableBody");
const exportCSV = document.getElementById("exportCSV");
const exportJSON = document.getElementById("exportJSON");
const categoryInput = document.getElementById("categoryInput");
const addCategoryButton = document.getElementById("addCategoryButton");
const categorySelect = document.getElementById("categorySelect");
const clearButton = document.getElementById("clearButton");
const paginationControls = document.getElementById("paginationControls");
const deleteCategoryButton = document.getElementById("deleteCategoryButton");

let notes = JSON.parse(localStorage.getItem("notes")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || ["Todas"];
let currentPage = 1;
const notesPerPage = 5; // Número de notas por página
let sortColumn = "date";
let sortOrder = "asc";

// Actualiza el selector de categorías
const updateCategorySelect = () => {
    categorySelect.innerHTML = categories
        .map(category => `<option value="${category}">${category}</option>`)
        .join("");
};

alert(JSON.stringify(notes));
// Actualiza la tabla con las notas, aplicando paginación y ordenamiento
const updateNotesTable = () => {
    const filteredNotes = categorySelect.value === "Todas"
        ? notes
        : notes.filter(note => note.category === categorySelect.value);

    const sortedNotes = filteredNotes.sort((a, b) => {
        const valA = a[sortColumn]?.toLowerCase ? a[sortColumn].toLowerCase() : a[sortColumn];
        const valB = b[sortColumn]?.toLowerCase ? b[sortColumn].toLowerCase() : b[sortColumn];
        return sortOrder === "asc" ? valA?.localeCompare(valB) : valB?.localeCompare(valA);
    });

    const startIndex = (currentPage - 1) * notesPerPage;
    const paginatedNotes = sortedNotes.slice(startIndex, startIndex + notesPerPage);
    // alert(JSON.stringify(paginatedNotes));
    notesTableBody.innerHTML = paginatedNotes.length === 0
        ? ` <tr>
                <td colspan="5">Sin registros</td>
            </tr>`
        : paginatedNotes.map((note, index) => {      
            let date, time;
            if(note["date"].includes(",")){ 
                [date, time] = note.date.split(", ");
            } else if(note["date"].includes(" ")){ 
                [date, time] = note.date.split(" ");
            } else {
                date = note.date;
                time = note.time;
            }
            return `
                <tr>
                    <td>${note.category}</td>
                    <td>${date}</td>
                <td>${time}</td>
                <td>${note.text}</td>
                <td>
                    <button onclick="editNote(${notes.indexOf(note)})">Editar</button>
                </td>
            </tr>`;
    }).join("");

    const totalPages = Math.ceil(filteredNotes.length / notesPerPage);
    paginationControls.innerHTML = Array.from({ length: totalPages }, (_, i) => {
        return `<button ${i + 1 === currentPage ? "disabled" : ""} onclick="changePage(${i + 1})">${i + 1}</button>`;
    }).join(" ");
};

// Cambiar de página
const changePage = (page) => {
    currentPage = page;
    updateNotesTable();
};

// Editar nota
const editNote = (index) => {
    const note = notes[index];
    const newCategory = prompt("Edita la categoría:", note.category);
    const newText = prompt("Edita el texto:", note.text);

    if (newCategory) note.category = newCategory;
    if (newText) note.text = newText;

    localStorage.setItem("notes", JSON.stringify(notes));
    updateNotesTable();
};

const addCategory = (newCategory) => {
    if (newCategory && !categories.includes(newCategory)) {
        categories.push(newCategory);
        localStorage.setItem("categories", JSON.stringify(categories));
        updateCategorySelect();
        categoryInput.value = "";
        return true;
    } else {
        return false;
    }
};

// Añadir nueva categoría
addCategoryButton.addEventListener("click", () => {
    const newCategory = categoryInput.value.trim();
    if (addCategory(newCategory)) {
        alert("Categoría añadida.");
    } else {
        alert("Categoría inválida o ya existe.");
    }
});

// Eliminar categoría
deleteCategoryButton.addEventListener("click", () => {
    const selectedCategory = categorySelect.value;
    if (selectedCategory === "Todas") {
        alert("No puedes eliminar la categoría 'Todas'.");
        return;
    }
    if (confirm(`¿Eliminar la categoría "${selectedCategory}" y sus notas?`)) {
        notes = notes.filter(note => note.category !== selectedCategory);
        categories = categories.filter(category => category !== selectedCategory);
        localStorage.setItem("notes", JSON.stringify(notes));
        localStorage.setItem("categories", JSON.stringify(categories));
        updateCategorySelect();
        updateNotesTable();
        alert(`Categoría "${selectedCategory}" eliminada.`);
    }
});

// Grabar y transcribir voz
recordButton.addEventListener("click", () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "es-ES";
    recognition.start();
    status.textContent = "Escuchando...";
    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        const date = new Date().toLocaleString();
        const category = categorySelect.value !== "Todas" ? categorySelect.value : "Sin categoría";
        notes.push({ date, text, category });
        localStorage.setItem("notes", JSON.stringify(notes));
        updateNotesTable();
        alert("Nota guardada.");
        status.textContent = "Presiona \"Grabar\" para comenzar."
    };
    recognition.onerror = () => alert("Error al grabar. Intenta de nuevo.");
});

// Limpiar notas
clearButton.addEventListener("click", () => {
    if (confirm("¿Borrar todas las notas?")) {
        notes = [];
        localStorage.removeItem("notes");
        updateNotesTable();
        alert("Notas eliminadas.");
    }
});

// Exportar a CSV con codificación UTF-8
exportCSV.addEventListener("click", () => {
    const csvContent = notes.map(note => `"${note.date}","${note.time}","${note.text}","${note.category}"`).join("\n");
    const blob = new Blob(["\uFEFF" + `Fecha,Hora,Texto,Categoría\n${csvContent}`], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "notas.csv";
    link.click();
});

// Exportar a JSON con codificación UTF-8
exportJSON.addEventListener("click", () => {
    const blob = new Blob(["\uFEFF" + JSON.stringify(notes, null, 2)], { type: "application/json;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "notas.json";
    link.click();
});

// Detectar cambio en el combo box de categoría y actualizar la tabla
categorySelect.addEventListener("change", () => {
    updateNotesTable();
});

// Inicializar
updateCategorySelect();
updateNotesTable();


// Elementos para importar
const importCSV = document.getElementById("importCSV");
const importJSON = document.getElementById("importJSON");
const fileInput = document.getElementById("fileInput");
// Función para manejar la selección de archivo
// Función para manejar la selección de archivo
fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    const isCSV = file.type === "text/csv" || file.name.endsWith(".csv");
    const isJSON = file.type === "application/json" || file.name.endsWith(".json");

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;

        if (isJSON) {
            try {
                const importedNotes = JSON.parse(content);
                if (Array.isArray(importedNotes)) {
                    confirmAndReplaceNotes(importedNotes);
                } else {
                    alert("El archivo JSON no tiene el formato correcto.");
                }
            } catch {
                alert("Error al procesar el archivo JSON.");
            }
        } else if (isCSV) {
            const lines = content.split("\n").map(line => line.trim()).filter(line => line);
            // const keys = lines[0].split(",").map(value => value.replace(/"/g, "").trim());
            // alert(keys);
            const importedNotes = lines.slice(1).map(line => {
                const [date, time, text, category] = line.split(",").map(value => value.replace(/"/g, "").trim());                
                return  {date, time, text, category};
            });            
            confirmAndReplaceNotes(importedNotes);
        } else {
            alert("El archivo seleccionado no es válido.");
        }
    };
    reader.readAsText(file, "UTF-8");
});
// Confirmar y reemplazar notas
const confirmAndReplaceNotes = (newNotes) => {
    if (confirm("Esto reemplazará todas las notas actuales. ¿Estás seguro?")) {
        notes = newNotes;
        notes.forEach(note => addCategory(note.category));
        localStorage.setItem("notes", JSON.stringify(notes));
        updateNotesTable();        
        alert("Notas importadas con éxito.");
    }
};

// Importar desde JSON
importJSON.addEventListener("click", () => {
    fileInput.accept = ".json";
    fileInput.click();
});

// Importar desde CSV
importCSV.addEventListener("click", () => {
    fileInput.accept = ".csv";
    fileInput.click();
});

