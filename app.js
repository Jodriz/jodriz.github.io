const recordButton = document.getElementById("recordButton");
const status = document.getElementById("status");
const notesList = document.getElementById("notesList");
const exportCSV = document.getElementById("exportCSV");
const exportJSON = document.getElementById("exportJSON");

let notes = JSON.parse(localStorage.getItem("notes")) || [];

// Actualiza la lista de notas
const updateNotesList = () => {
    notesList.innerHTML = "";
    notes.forEach((note, index) => {
        const li = document.createElement("li");
        li.textContent = `${note.date}: ${note.text}`;
        notesList.appendChild(li);
    });
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
        notes.push({ date, text });
        localStorage.setItem("notes", JSON.stringify(notes));
        updateNotesList();
        status.textContent = "Nota guardada.";
    };

    recognition.onerror = () => {
        status.textContent = "Error al grabar. Intenta de nuevo.";
    };
};

// Exportar a CSV
const exportToCSV = () => {
    const csvContent = notes.map(note => `"${note.date}","${note.text}"`).join("\n");
    const blob = new Blob([`Fecha,Texto\n${csvContent}`], { type: "text/csv" });
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

// Event listeners
recordButton.addEventListener("click", startRecording);
exportCSV.addEventListener("click", exportToCSV);
exportJSON.addEventListener("click", exportToJSON);

// Inicializar
updateNotesList();
