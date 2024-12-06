const showTableButton = document.getElementById("showTableButton");
const showGraphButton = document.getElementById("showGraphButton");
const tableContainer = document.getElementById("tableContainer");
const graphContainer = document.getElementById("graphContainer");
const categoryGraph = document.getElementById("categoryGraph").getContext("2d");

let chartInstance;

// Alternar entre tabla y gráfico
showTableButton.addEventListener("click", () => {
    tableContainer.style.display = "block";
    graphContainer.style.display = "none";
});

showGraphButton.addEventListener("click", () => {
    tableContainer.style.display = "none";
    graphContainer.style.display = "block";
    generateGraph();
});

// Función para generar el gráfico
const generateGraph = () => {
    if (chartInstance) {
        chartInstance.destroy(); // Limpiar gráfico previo si existe
    }

    const selectedCategory = categorySelect.value;

    if (selectedCategory === "Todas") {
        // Gráfico de barras con recuento por categoría
        const categoryCounts = categories.reduce((acc, category) => {
            if (category !== "Todas") {
                acc[category] = notes.filter(note => note.category === category).length;
            }
            return acc;
        }, {});

        chartInstance = new Chart(categoryGraph, {
            type: "bar",
            data: {
                labels: Object.keys(categoryCounts),
                datasets: [{
                    label: "Número de Notas por Categoría",
                    data: Object.values(categoryCounts),
                    backgroundColor: "rgba(98, 0, 234, 0.5)",
                    borderColor: "rgba(98, 0, 234, 1)",
                    borderWidth: 1,
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Categorías",
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Cantidad",
                        },
                        beginAtZero: true,
                    },
                },
            },
        });
    } else {
        // Gráfico de líneas con notas de la categoría seleccionada
        const filteredNotes = notes
            .filter(note => note.category === selectedCategory)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const dates = filteredNotes.map(note => note.date.split(", ")[0]);
        const texts = filteredNotes.map(note => note.text);

        chartInstance = new Chart(categoryGraph, {
            type: "line",
            data: {
                labels: dates,
                datasets: [{
                    label: `Notas en ${selectedCategory}`,
                    data: texts.map((_, i) => i + 1), // Índices como valores para representar las entradas
                    fill: false,
                    borderColor: "rgba(98, 0, 234, 1)",
                    tension: 0.1,
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Fecha",
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Conteo",
                        },
                        beginAtZero: true,
                    },
                },
            },
        });
    }
};

categorySelect.addEventListener("change", () => {
    // updateNotesTable(); // Actualiza la tabla

    // Verifica si el gráfico está visible
    if (graphContainer.style.display === "block") {
        generateGraph(); // Actualiza el gráfico si está visible
    }
});
