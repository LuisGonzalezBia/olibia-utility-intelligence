import type { RegistroDictionary } from "./es";

export const registroDictEn: RegistroDictionary = {
  title: "Create your account",
  subtitle:
    "Olibia Utility Intelligence is built for energy sector agents. Tell us who you are to get your market ranking.",
  fields: {
    nombre: "First name",
    apellido: "Last name",
    email: "Work email",
    emailHint:
      "Use your company email — we use it to verify you represent the agent.",
    password: "Password",
    passwordHint: "At least 8 characters.",
    cargo: "Job title",
    telefono: "Phone",
    telefonoOptional: "Optional",
    empresa: "Company",
    empresaPlaceholder: "Search for your company…",
    empresaNoListada: "My company is not on the list",
    empresaOtra: "Company name",
    empresaOtraHint:
      "Not a wholesale energy market agent — you can still use the platform.",
    tipoOrganizacion: "Organization type",
    area: "Team or area",
  },
  representaOrganizacion: {
    label: "Are you registering on behalf of an organization?",
    hint: 'Journalists, students, and independent consultants can choose "No".',
    si: "Yes",
    no: "No",
  },
  tipoOrganizacion: {
    PRIVADO: "Private",
    PUBLICO: "Public",
    MIXTO: "Mixed",
  },
  areas: {
    VENTAS_USUARIO_FINAL: "End-user sales",
    COMPRAS_MAYORISTAS: "Wholesale purchasing",
    VENTAS_MAYORISTAS: "Wholesale sales",
    PLANEACION_FINANCIERA: "Financial planning",
    REGULACION: "Regulatory affairs",
    OPERACION: "Operations",
    RIESGOS: "Risk",
    DIRECCION: "Executive",
    OTRA: "Other",
  },
  actividades: {
    COMERCIALIZACION: "Retail",
    GENERACION: "Generation",
    DISTRIBUCION: "Distribution",
    TRANSPORTE: "Transmission",
    CENTRO_RECOLECCION: "Collection center",
  },
  habeasData: {
    label: "I authorize the processing of my personal data",
    linkText: "Read the data processing policy",
    required: "We need your authorization to create the account.",
  },
  exito: {
    titulo: "Check your email",
    detalle: (email: string) =>
      `We sent a link to ${email} to confirm your account. Once confirmed, you get access to your market ranking.`,
  },
  submit: "Create account",
  submitting: "Creating your account…",
  alreadyHaveAccount: "Already have an account?",
  signIn: "Sign in",
  errors: {
    required: "This field is required",
    emailInvalid: "Enter a valid email",
    passwordShort: "Password must be at least 8 characters",
    empresaRequired: "Choose your company",
    empresaOtraRequired: "Enter your company name",
    emailInUse: "An account with this email already exists.",
    generic: "We could not create your account. Please try again in a moment.",
  },
  combobox: {
    search: "Search",
    noResults: "No results",
    resultsCount: (n: number) => `${n} agents`,
    chooseActivity: "What is their activity?",
  },
};
