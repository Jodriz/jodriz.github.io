const recordButton = document.getElementById("recordButton");
const status = document.getElementById("status");
const notesList = document.getElementById("notesList");
const exportCSV = document.getElementById("exportCSV");
const exportJSON = document.getElementById("exportJSON");
const categoryInput = document.getElementById("categoryInput");
const addCategoryButton = document.getElementById("addCategoryButton");
const categorySelect = document.getElementById("categorySelect");
const clearButton = document.getElementById("clearButton");

let notes = JSON.parse(localStorage.getItem("notes")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || ["Todas"];

// Actualiza el selector de categorías
const updateCategorySelect = () => {
    categorySelect.innerHTML = categories
        .map(category => `<option value="${category}">${category}</option>`)
        .join("");
};

// Actualiza la lista de notas según la categoría seleccionada
const updateNotesList = () => {
    const selectedCategory = categorySelect.value;
    notesList.innerHTML = "";
    const filteredNotes = selectedCategory === "Todas"
        ? notes
        : notes.filter(note => note.category === selectedCategory);

    filteredNotes.forEach(note => {
        const li = document.createElement("li");
        li.textContent = `[${note.category}] ${note.date}: ${note.text}`;
        notesList.appendChild(li);
    });
};

// Añade una nueva categoría
const addCategory = () => {
    const newCategory = categoryInput.value.trim();
    if (newCategory && !categories.includes(newCategory)) {
        categories.push(newCategory);
        localStorage.setItem("categories", JSON.stringify(categories));
        updateCategorySelect();
        categoryInput.value = "";
        alert( "Categoría añadida.");
    } else {
        alert( "Categoría inválida o ya existe.");
    }
};

// Grabar y transcribir voz
const startRecording = () => {
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
        updateNotesList();
        alert("Nota guardada.");
    };

    recognition.onerror = () => {
        alert("Error al grabar. Intenta de nuevo.");
    };
};

// Exportar a CSV
const exportToCSV = () => {
    const csvContent = notes.map(note => `"${note.date}","${note.text}","${note.category}"`).join("\n");
    const blob = new Blob([`Fecha,Texto,Categoría\n${csvContent}`], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "notas.csv";
    link.click();
};

// Exportar a JSON
const exportToJSON = () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "notas.json";
    link.click();
};

// Limpiar el localStorage y reiniciar notas
const clearNotes = () => {
    if (confirm("¿Estás seguro de que quieres borrar todas las notas? Esta acción no se puede deshacer.")) {
        notes = [];
        localStorage.removeItem("notes");
        updateNotesList();
        alert("Notas eliminadas.");
    }
};

const deleteCategoryButton = document.getElementById("deleteCategoryButton");

// Elimina la categoría seleccionada
const deleteCategory = () => {
    const selectedCategory = categorySelect.value;

    // No se puede eliminar la categoría "Todas"
    if (selectedCategory === "Todas") {
        alert("No puedes eliminar la categoría 'Todas'.");
        return;
    }

    // Confirmar eliminación
    if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${selectedCategory}"? Esto también eliminará todas las notas asociadas.`)) {
        // Filtrar notas para eliminar las de la categoría seleccionada
        notes = notes.filter(note => note.category !== selectedCategory);
        localStorage.setItem("notes", JSON.stringify(notes));

        // Eliminar la categoría del listado
        categories = categories.filter(category => category !== selectedCategory);
        localStorage.setItem("categories", JSON.stringify(categories));

        // Actualizar la interfaz
        updateCategorySelect();
        updateNotesList();
        alert(`La categoría "${selectedCategory}" ha sido eliminada.`);
    }
};

// Event listener para eliminar categoría
deleteCategoryButton.addEventListener("click", deleteCategory);


// Event listeners
addCategoryButton.addEventListener("click", addCategory);
categorySelect.addEventListener("change", updateNotesList);
recordButton.addEventListener("click", startRecording);
exportCSV.addEventListener("click", exportToCSV);
exportJSON.addEventListener("click", exportToJSON);
clearButton.addEventListener("click", clearNotes);

// Inicializar
updateCategorySelect();
updateNotesList();
