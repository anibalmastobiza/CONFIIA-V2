// Configuración
const GOOGLE_SCRIPT_URL = 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI'; // Reemplazar con la URL del script

// Estado de la aplicación
let currentSection = 'intro';
let currentComparisonIndex = 0;
let responses = {
    demographics: {},
    comparisons: {},
    timestamp: null,
    duration: null
};
let startTime = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Consentimiento
    document.getElementById('consentCheckbox').addEventListener('change', function(e) {
        document.getElementById('startBtn').disabled = !e.target.checked;
    });

    // Botones de navegación
    document.getElementById('startBtn').addEventListener('click', startStudy);
    document.getElementById('nextToDemographics').addEventListener('click', validateDemographics);
    document.getElementById('backToDemographics').addEventListener('click', () => showSection('intro'));
    document.getElementById('nextBtn').addEventListener('click', nextComparison);
    document.getElementById('backBtn').addEventListener('click', previousComparison);

    updateProgressBar();
}

function startStudy() {
    startTime = new Date();
    showSection('demographics');
}

function showSection(section) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    // Mostrar sección actual
    document.getElementById(section + 'Section').classList.add('active');
    currentSection = section;
    
    updateProgressBar();
    
    // Si es la sección de comparaciones, renderizar la primera comparación
    if (section === 'comparisons') {
        renderComparison(currentComparisonIndex);
    }
}

function updateProgressBar() {
    const totalSteps = 5; // intro, demographics, 3 comparisons
    let currentStep = 0;
    
    if (currentSection === 'intro') currentStep = 0;
    else if (currentSection === 'demographics') currentStep = 1;
    else if (currentSection === 'comparisons') currentStep = 2 + currentComparisonIndex;
    else if (currentSection === 'thankYou') currentStep = 5;
    
    const progress = (currentStep / totalSteps) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
}

function validateDemographics() {
    const professionalStatus = document.getElementById('professionalStatus').value;
    const experience = document.getElementById('experience').value;
    const aiFamiliarity = document.getElementById('aiFamiliarity').value;
    
    if (!professionalStatus || !experience || !aiFamiliarity) {
        alert('Por favor, completa todos los campos obligatorios (*)');
        return;
    }
    
    // Guardar datos demográficos
    responses.demographics = {
        professionalStatus: professionalStatus,
        experience: experience,
        specialty: document.getElementById('specialty').value || 'No especificado',
        aiFamiliarity: aiFamiliarity,
        gender: document.getElementById('gender').value || 'No especificado',
        ageGroup: document.getElementById('ageGroup').value || 'No especificado'
    };
    
    showSection('comparisons');
}

function renderComparison(index) {
    const comparison = comparisons[index];
    const container = document.getElementById('comparisonContainer');
    
    const systemADesc = getSystemDescription(comparison.systemA);
    const systemBDesc = getSystemDescription(comparison.systemB);
    
    container.innerHTML = `
        <div class="comparison">
            <div class="comparison-title">
                Comparación ${index + 1} de ${comparisons.length}
            </div>
            <p style="text-align: center; margin-bottom: 30px; color: #666; font-size: 16px;">
                <strong>¿En cuál de estos dos sistemas de IA confiarías más para usar en tu práctica de fisioterapia?</strong>
            </p>
            <div class="systems-grid">
                <div class="system-card" data-system="A" onclick="selectSystem(${index}, 'A')">
                    <div class="system-header">Sistema A</div>
                    ${renderAttributes(systemADesc)}
                </div>
                <div class="system-card" data-system="B" onclick="selectSystem(${index}, 'B')">
                    <div class="system-header">Sistema B</div>
                    ${renderAttributes(systemBDesc)}
                </div>
            </div>
        </div>
    `;
    
    // Actualizar botones
    document.getElementById('backBtn').style.display = currentComparisonIndex > 0 ? 'block' : 'none';
    document.getElementById('nextBtn').disabled = !responses.comparisons[`comparison${index + 1}`];
    document.getElementById('nextBtn').textContent = 
        index === comparisons.length - 1 ? 'Finalizar' : 'Siguiente';
        
    // Si ya había una respuesta, marcarla
    if (responses.comparisons[`comparison${index + 1}`]) {
        const selectedSystem = responses.comparisons[`comparison${index + 1}`];
        document.querySelector(`[data-system="${selectedSystem}"]`).classList.add('selected');
    }
}

function renderAttributes(systemDesc) {
    return `
        <div class="attribute">
            <div class="attribute-name">Precisión diagnóstica</div>
            <div class="attribute-value">${systemDesc.precision}</div>
        </div>
        <div class="attribute">
            <div class="attribute-name">Explicabilidad</div>
            <div class="attribute-value">${systemDesc.explainability}</div>
        </div>
        <div class="attribute">
            <div class="attribute-name">Validación clínica</div>
            <div class="attribute-value">${systemDesc.validation}</div>
        </div>
        <div class="attribute">
            <div class="attribute-name">Control profesional</div>
            <div class="attribute-value">${systemDesc.control}</div>
        </div>
        <div class="attribute">
            <div class="attribute-name">Transparencia sobre limitaciones</div>
            <div class="attribute-value">${systemDesc.transparency}</div>
        </div>
    `;
}

function selectSystem(comparisonIndex, system) {
    // Remover selección previa
    document.querySelectorAll('.system-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Marcar nueva selección
    document.querySelector(`[data-system="${system}"]`).classList.add('selected');
    
    // Guardar respuesta
    responses.comparisons[`comparison${comparisonIndex + 1}`] = system;
    
    // Habilitar botón siguiente
    document.getElementById('nextBtn').disabled = false;
}

function nextComparison() {
    if (currentComparisonIndex < comparisons.length - 1) {
        currentComparisonIndex++;
        renderComparison(currentComparisonIndex);
        updateProgressBar();
    } else {
        // Finalizar estudio
        finishStudy();
    }
}

function previousComparison() {
    if (currentComparisonIndex > 0) {
        currentComparisonIndex--;
        renderComparison(currentComparisonIndex);
        updateProgressBar();
    }
}

async function finishStudy() {
    responses.timestamp = new Date().toISOString();
    responses.duration = Math.round((new Date() - startTime) / 1000); // segundos
    
    // Enviar datos a Google Sheets
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(responses)
        });
        
        console.log('Datos enviados correctamente');
    } catch (error) {
        console.error('Error al enviar datos:', error);
    }
    
    // Mostrar página de agradecimiento
    showSection('thankYou');
}
