// Definición de atributos y niveles simplificados
const attributes = {
  precision: {
    name: "Precisión diagnóstica de la IA",
    levels: [
      "Moderada (aprox. 85%)",
      "Alta (95% o más)"
    ]
  },
  explainability: {
    name: "Explicabilidad de la IA",
    levels: [
      "No explica el resultado (caja negra)",
      "Explica de manera comprensible el resultado"
    ]
  },
  validation: {
    name: "Validación clínica de la IA",
    levels: [
      "Baja evidencia científica",
      "Alta evidencia científica"
    ]
  },
  control: {
    name: "Control profesional de la IA",
    levels: [
      "Emite recomendaciones",
      "Toma decisiones automáticas"
    ]
  },
  transparency: {
    name: "Transparencia sobre las limitaciones de la IA",
    levels: [
      "No informa sobre sus limitaciones o tasas de error",
      "Informa sobre sus limitaciones y tasas de error"
    ]
  }
};

// Definición de las 5 TAREAS del documento (Comparación entre 3 sistemas)
// Indices: 0 es el primer nivel, 1 es el segundo nivel (ver arriba)
const comparisons = [
  {
    id: 1,
    title: "TAREA 1 DE 5",
    systemA: { precision: 1, explainability: 1, validation: 1, control: 1, transparency: 1 },
    systemB: { precision: 1, explainability: 1, validation: 1, control: 0, transparency: 1 },
    systemC: { precision: 1, explainability: 0, validation: 1, control: 1, transparency: 1 }
  },
  {
    id: 2,
    title: "TAREA 2 DE 5",
    systemA: { precision: 1, explainability: 0, validation: 0, control: 1, transparency: 1 },
    systemB: { precision: 0, explainability: 0, validation: 1, control: 1, transparency: 0 },
    systemC: { precision: 0, explainability: 1, validation: 1, control: 1, transparency: 0 }
  },
  {
    id: 3,
    title: "TAREA 3 DE 5",
    systemA: { precision: 1, explainability: 0, validation: 0, control: 0, transparency: 1 },
    systemB: { precision: 0, explainability: 1, validation: 0, control: 0, transparency: 1 },
    systemC: { precision: 1, explainability: 1, validation: 1, control: 1, transparency: 0 }
  },
  {
    id: 4,
    title: "TAREA 4 DE 5",
    systemA: { precision: 1, explainability: 1, validation: 1, control: 0, transparency: 0 },
    systemB: { precision: 0, explainability: 1, validation: 0, control: 0, transparency: 0 },
    systemC: { precision: 0, explainability: 0, validation: 0, control: 1, transparency: 0 }
  },
  {
    id: 5,
    title: "TAREA 5 DE 5",
    systemA: { precision: 0, explainability: 0, validation: 0, control: 0, transparency: 1 },
    systemB: { precision: 0, explainability: 0, validation: 1, control: 0, transparency: 0 },
    systemC: { precision: 1, explainability: 1, validation: 0, control: 0, transparency: 1 }
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
