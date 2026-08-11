export const registroDictEs = {
  title: 'Creá tu cuenta',
  subtitle: 'Olibia Utility Intelligence es para agentes del sector energético. Contanos quién sos para darte el ranking de tu mercado.',
  fields: {
    nombre: 'Nombre',
    apellido: 'Apellido',
    email: 'Correo corporativo',
    emailHint: 'Usá el correo de tu empresa — con él validamos que representás al agente.',
    password: 'Contraseña',
    passwordHint: 'Mínimo 8 caracteres.',
    cargo: 'Cargo',
    telefono: 'Teléfono',
    telefonoOptional: 'Opcional',
    empresa: 'Empresa',
    empresaPlaceholder: 'Buscá tu empresa…',
    empresaNoListada: 'Mi empresa no está en la lista',
    empresaOtra: 'Nombre de tu empresa',
    empresaOtraHint: 'No es agente del Mercado de Energía Mayorista — igual podés usar la plataforma.',
    tipoOrganizacion: 'Tipo de organización',
    area: 'Área o equipo'
  },
  representaOrganizacion: {
    label: '¿Te registrás en representación de una organización?',
    hint: 'Si sos periodista, estudiante o consultor independiente, elegí "No".',
    si: 'Sí',
    no: 'No'
  },
  tipoOrganizacion: {
    PRIVADO: 'Privado',
    PUBLICO: 'Público',
    MIXTO: 'Mixto'
  },
  areas: {
    VENTAS_USUARIO_FINAL: 'Ventas a usuario final',
    COMPRAS_MAYORISTAS: 'Compras mayoristas',
    VENTAS_MAYORISTAS: 'Ventas mayoristas',
    PLANEACION_FINANCIERA: 'Planeación financiera',
    REGULACION: 'Regulación',
    OPERACION: 'Operación',
    RIESGOS: 'Riesgos',
    DIRECCION: 'Dirección',
    OTRA: 'Otra'
  },
  actividades: {
    COMERCIALIZACION: 'Comercialización',
    GENERACION: 'Generación',
    DISTRIBUCION: 'Distribución',
    TRANSPORTE: 'Transporte',
    CENTRO_RECOLECCION: 'Centro de recolección'
  },
  habeasData: {
    label: 'Autorizo el tratamiento de mis datos personales',
    linkText: 'Ver política de tratamiento de datos',
    required: 'Necesitamos tu autorización para crear la cuenta.'
  },
  exito: {
    titulo: 'Revisá tu correo',
    detalle: (email: string) =>
      `Te enviamos un enlace a ${email} para confirmar tu cuenta. Apenas la confirmes, entrás al ranking de tu mercado.`
  },
  submit: 'Crear cuenta',
  submitting: 'Creando tu cuenta…',
  alreadyHaveAccount: '¿Ya tenés cuenta?',
  signIn: 'Ingresá',
  errors: {
    required: 'Este campo es obligatorio',
    emailInvalid: 'Escribí un correo válido',
    passwordShort: 'La contraseña debe tener al menos 8 caracteres',
    empresaRequired: 'Elegí tu empresa',
    empresaOtraRequired: 'Escribí el nombre de tu empresa',
    emailInUse: 'Ya existe una cuenta con este correo.',
    generic: 'No pudimos crear tu cuenta. Intentá de nuevo en un momento.'
  },
  combobox: {
    search: 'Buscar',
    noResults: 'Sin resultados',
    resultsCount: (n: number) => `${n} agentes`,
    chooseActivity: '¿Cuál es su actividad?'
  }
};

export type RegistroDictionary = typeof registroDictEs;
