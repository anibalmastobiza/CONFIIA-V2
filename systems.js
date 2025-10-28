// Definición de atributos y niveles
const attributes = {
  precision: {
    name: "Precisión diagnóstica",
    levels: ["85%", "95%"]
  },
  explainability: {
    name: "Explicabilidad",
    levels: [
      "Sistema tipo 'caja negra' (no explica sus recomendaciones)",
      "Explica de forma comprensible por qué recomienda cada tratamiento"
    ]
  },
  validation: {
    name: "Validación clínica",
    levels: [
      "Sin validación en estudios clínicos publicados",
      "Validado en ensayos clínicos con >1000 pacientes"
    ]
  },
  control: {
    name: "Control profesional",
    levels: [
      "Emite recomendaciones que el fisioterapeuta puede seguir o no",
      "Toma decisiones de tratamiento de forma automática"
    ]
  },
  transparency: {
    name: "Transparencia sobre limitaciones",
    levels: [
      "No informa sobre sus limitaciones o tasas de error",
      "Muestra claramente sus limitaciones y tasa de error"
    ]
  }
};

// Definición de comparaciones (diseño ortogonal parcial)
const comparisons = [
  {
    id: 1,
    systemA: {
      precision: 0,        // 85%
      explainability: 1,   // Explica
      validation: 0,       // Sin validación
      control: 0,          // Recomendación
      transparency: 1      // Muestra limitaciones
    },
    systemB: {
      precision: 1,        // 95%
      explainability: 0,   // Caja negra
      validation: 1,       // Validado
      control: 1,          // Automático
      transparency: 0      // No informa limitaciones
    },
    focus: "Precisión vs Explicabilidad"
  },
  {
    id: 2,
    systemA: {
      precision: 1,        // 95%
      explainability: 0,   // Caja negra
      validation: 0,       // Sin validación
      control: 0,          // Recomendación
      transparency: 0      // No informa limitaciones
    },
    systemB: {
      precision: 0,        // 85%
      explainability: 1,   // Explica
      validation: 1,       // Validado
      control: 0,          // Recomendación
      transparency: 1      // Muestra limitaciones
    },
    focus: "Validación y transparencia vs Precisión"
  },
  {
    id: 3,
    systemA: {
      precision: 0,        // 85%
      explainability: 1,   // Explica
      validation: 1,       // Validado
      control: 1,          // Automático
      transparency: 1      // Muestra limitaciones
    },
    systemB: {
      precision: 1,        // 95%
      explainability: 1,   // Explica
      validation: 0,       // Sin validación
      control: 0,          // Recomendación
      transparency: 0      // No informa limitaciones
    },
    focus: "Control profesional vs Precisión"
  }
];

// Función para obtener descripción de un sistema
function getSystemDescription(system) {
  return {
    precision: attributes.precision.levels[system.precision],
    explainability: attributes.explainability.levels[system.explainability],
    validation: attributes.validation.levels[system.validation],
    control: attributes.control.levels[system.control],
    transparency: attributes.transparency.levels[system.transparency]
  };
}
