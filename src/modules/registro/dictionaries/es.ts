export const registroDictEs = {
  title: "Crea tu cuenta",
  subtitle:
    "Olibia Utility Intelligence es para agentes del sector energético. Cuéntanos quién eres para darte la información de tu mercado.",
  fields: {
    nombre: "Nombre",
    apellido: "Apellido",
    email: "Correo corporativo",
    emailHint:
      "Usa el correo de tu empresa — con él validamos que representas al agente.",
    password: "Contraseña",
    passwordHint: "Mínimo 8 caracteres.",
    cargo: "Cargo",
    telefono: "Teléfono",
    telefonoOptional: "Opcional",
    empresa: "Empresa",
    empresaPlaceholder: "Busca tu empresa…",
    empresaNoListada: "Mi empresa no está en la lista",
    empresaOtra: "Nombre de tu empresa",
    empresaOtraHint:
      "No es agente del Mercado de Energía Mayorista — igual puedes usar la plataforma.",
    tipoOrganizacion: "Tipo de organización",
    area: "Área o equipo",
  },
  representaOrganizacion: {
    label: "¿Te registras en representación de una organización?",
    hint: 'Si eres periodista, estudiante o consultor independiente, elige "No".',
    si: "Sí",
    no: "No",
  },
  tipoOrganizacion: {
    PRIVADO: "Privado",
    PUBLICO: "Público",
    MIXTO: "Mixto",
  },
  areas: {
    VENTAS_USUARIO_FINAL: "Ventas a usuario final",
    COMPRAS_MAYORISTAS: "Compras mayoristas",
    VENTAS_MAYORISTAS: "Ventas mayoristas",
    PLANEACION_FINANCIERA: "Planeación financiera",
    REGULACION: "Regulación",
    OPERACION: "Operación",
    RIESGOS: "Riesgos",
    DIRECCION: "Dirección",
    OTRA: "Otra",
  },
  actividades: {
    COMERCIALIZACION: "Comercialización",
    GENERACION: "Generación",
    DISTRIBUCION: "Distribución",
    TRANSPORTE: "Transporte",
    CENTRO_RECOLECCION: "Centro de recolección",
  },
  habeasData: {
    label: "Autorizo el tratamiento de mis datos personales",
    linkText: "Ver política de tratamiento de datos",
    required: "Necesitamos tu autorización para crear la cuenta.",
  },
  exito: {
    titulo: "Revisa tu correo",
    detalle: (email: string) =>
      `Te enviamos un enlace a ${email} para confirmar tu cuenta. Apenas la confirmes, entras a la información de tu mercado.`,
  },
  submit: "Crear cuenta",
  submitting: "Creando tu cuenta…",
  alreadyHaveAccount: "¿Ya tienes cuenta?",
  signIn: "Ingresar",
  errors: {
    required: "Este campo es obligatorio",
    emailInvalid: "Escribe un correo válido",
    passwordShort: "La contraseña debe tener al menos 8 caracteres",
    empresaRequired: "Elige tu empresa",
    empresaOtraRequired: "Escribe el nombre de tu empresa",
    emailInUse: "Ya existe una cuenta con este correo.",
    generic: "No pudimos crear tu cuenta. Intentá de nuevo en un momento.",
  },
  combobox: {
    search: "Buscar",
    noResults: "Sin resultados",
    resultsCount: (n: number) => `${n} agentes`,
    chooseActivity: "¿Cuál es su actividad?",
  },
};

export type RegistroDictionary = typeof registroDictEs;
