// Configuración
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwEgRt4B15wzOsT1t1py02-9vmUFQQcIw1W5oC_SitPyhMF5aNhY6xZ2wrCPqsrzs2Z/exec';

// Estado de la aplicación
let currentSection = 'intro';
let currentComparisonIndex = 0;
let randomizedOrder = []; 
let responses = {
    demographics: {},
    comparisons: {}, // { task1: { choice: 'A', reliability: 4 }, ... }
    comparisonOrder: [],
    timestamp: null,
    duration: null
};
let startTime = null;
let currentSelection = null; // Selección temporal antes de confirmar

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
    // Botón atrás en comparaciones deshabilitado por simplicidad en flujo lógico, o solo visualización previa
    
    updateProgressBar();
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function startStudy() {
    startTime = new Date();
    
    // Aleatorizar el orden de las 5 tareas
    const indices = [0, 1, 2, 3, 4]; 
    randomizedOrder = shuffleArray(indices);
    
    responses.comparisonOrder = randomizedOrder.map(idx => comparisons[idx].id);
    console.log('Orden tareas:', responses.comparisonOrder);
    
    showSection('demographics');
}

function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(section + 'Section').classList.add('active');
    currentSection = section;
    updateProgressBar();
    
    if (section === 'comparisons') {
        renderComparison(currentComparisonIndex);
    }
}

function updateProgressBar() {
    const totalSteps = 7; // intro, demo, 5 tasks
    let currentStep = 0;
    
    if (currentSection === 'intro') currentStep = 0;
    else if (currentSection === 'demographics') currentStep = 1;
    else if (currentSection === 'comparisons') currentStep = 2 + currentComparisonIndex;
    else if (currentSection === 'thankYou') currentStep = 7;
    
    const progress = (currentStep / totalSteps) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
}

function validateDemographics() {
    const status = document.getElementById('professionalStatus').value;
    const exp = document.getElementById('experience').value;
    const spec = document.getElementById('specialty').value;
    const fam = document.getElementById('aiFamiliarity').value;
    const gen = document.getElementById('gender').value;
    const age = document.getElementById('ageGroup').value;
    
    if (!status || !exp || !spec || !fam || !gen || !age) {
        alert('Por favor, completa todos los campos obligatorios (*)');
        return;
    }
    
    responses.demographics = {
        professionalStatus: status,
        experience: exp,
        specialty: spec,
        aiFamiliarity: fam,
        gender: gen,
        ageGroup: age
    };
    
    showSection('comparisons');
}

function renderComparison(index) {
    const actualIndex = randomizedOrder[index];
    const comparison = comparisons[actualIndex];
    const container = document.getElementById('comparisonContainer');
    
    // Resetear selección y Likert
    currentSelection = null;
    document.querySelectorAll('input[name="reliability"]').forEach(r => r.checked = false);
    document.getElementById('postChoiceSection').classList.remove('visible');
    document.getElementById('nextBtn').disabled = true;

    const sysADesc = getSystemDescription(comparison.systemA);
    const sysBDesc = getSystemDescription(comparison.systemB);
    const sysCDesc = getSystemDescription(comparison.systemC);
    
    container.innerHTML = `
        <div class="comparison">
            <div class="comparison-title">
                ${comparison.title}
            </div>
            <p style="text-align: center; margin-bottom: 20px; color: #666;">
                <strong>¿En cuál de estos TRES sistemas confiarías MÁS para usar en su práctica profesional?</strong>
            </p>
            <div class="systems-grid">
                <div class="system-card" data-system="A" onclick="selectSystem('A')">
                    <div class="system-header">SISTEMA A</div>
                    ${renderAttributes(sysADesc)}
                </div>
                <div class="system-card" data-system="B" onclick="selectSystem('B')">
                    <div class="system-header">SISTEMA B</div>
                    ${renderAttributes(sysBDesc)}
                </div>
                <div class="system-card" data-system="C" onclick="selectSystem('C')">
                    <div class="system-header">SISTEMA C</div>
                    ${renderAttributes(sysCDesc)}
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('nextBtn').textContent = index === 4 ? 'Finalizar' : 'Siguiente';
}

function renderAttributes(desc) {
    return `
        <div class="attribute">
            <div class="attribute-name">Precisión diagnóstica de la IA</div>
            <div class="attribute-value">${desc.precision}</div>
        </div>
        <div class="attribute">
            <div class="attribute-name">Explicabilidad de la IA</div>
            <div class="attribute-value">${desc.explainability}</div>
        </div>
        <div class="attribute">
            <div class="attribute-name">Validación clínica de la IA</div>
            <div class="attribute-value">${desc.validation}</div>
        </div>
        <div class="attribute">
            <div class="attribute-name">Control profesional de la IA</div>
            <div class="attribute-value">${desc.control}</div>
        </div>
        <div class="attribute">
            <div class="attribute-name">Transparencia de la IA</div>
            <div class="attribute-value">${desc.transparency}</div>
        </div>
    `;
}

function selectSystem(system) {
    // Marcar visualmente
    document.querySelectorAll('.system-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`[data-system="${system}"]`).classList.add('selected');
    
    currentSelection = system;
    
    // Mostrar pregunta Likert
    document.getElementById('postChoiceSection').classList.add('visible');
    document.getElementById('postChoiceSection').scrollIntoView({ behavior: 'smooth' });
    
    checkStepCompletion();
}

function selectLikert(value) {
    // Seleccionar radio button programáticamente si clic en div
    document.getElementById('likert' + value).checked = true;
    checkStepCompletion();
}

function checkStepCompletion() {
    const likert = document.querySelector('input[name="reliability"]:checked');
    // Habilitar siguiente solo si hay sistema y likert seleccionado
    if (currentSelection && likert) {
        document.getElementById('nextBtn').disabled = false;
    }
}

function nextComparison() {
    const actualIndex = randomizedOrder[currentComparisonIndex];
    const likertVal = document.querySelector('input[name="reliability"]:checked').value;
    
    // Guardar respuesta
    responses.comparisons[`task_${actualIndex + 1}`] = {
        selectedSystem: currentSelection,
        reliabilityScore: likertVal
    };

    if (currentComparisonIndex < 4) {
        currentComparisonIndex++;
        renderComparison(currentComparisonIndex);
        updateProgressBar();
        window.scrollTo(0, 0);
    } else {
        finishStudy();
    }
}

async function finishStudy() {
    responses.timestamp = new Date().toISOString();
    responses.duration = Math.round((new Date() - startTime) / 1000);
    
    console.log("Resultados finales:", responses);

    // 1. CAMBIO: Mostramos la sección de agradecimiento INMEDIATAMENTE
    // para que el usuario no note el retraso del envío.
    showSection('thankYou');

    // 2. Enviamos los datos en segundo plano
    try {
        // Opcional: añadimos keepalive: true para intentar que se envíe 
        // aunque el usuario cierre la pestaña rápido.
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            keepalive: true, 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(responses)
        });
        console.log('Datos enviados');
    } catch (error) {
        console.error('Error envio:', error);
        // Nota: Como ya estamos en la pantalla de gracias, 
        // si falla el envío el usuario no se enterará, pero es preferible 
        // a que la interfaz se quede bloqueada.
    }
}
