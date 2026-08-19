// Voz: la misma de la landing de Olibia (tuteo — "Opera como una sola empresa",
// "Conoce más", "tu operación"). Nada de voseo.
export const homeDictEs = {
  eyebrow: 'Para agentes del sector energético',
  title: 'Todo el mercado de energía, en un solo lugar',
  descriptionLead: 'Decide con el mercado a la vista.',
  description:
    'Precio de bolsa, demanda, generación, hidrología y tarifas, construidos sobre la información pública que mueve el mercado colombiano.',
  cta: 'Crear cuenta',
  ctaHint: 'Gratis. Solo necesitas tu correo corporativo.',
  alreadyHaveAccount: '¿Ya tienes cuenta?',
  signIn: 'Ingresar',
  features: [
    {
      title: 'El mercado, al día',
      description:
        'Precio de bolsa, demanda, generación y disponibilidad, con la información pública de XM y SIMEM.'
    },
    {
      title: 'Tu competitividad tarifaria',
      description:
        'Dónde queda tu empresa frente al resto de tu mercado, con el costo unitario abierto por componente.'
    },
    {
      title: 'El contexto que mueve los precios',
      description:
        'Hidrología, ENSO, combustibles, Derivex y despachos: las variables detrás de cada movimiento.'
    }
  ],
  // La honestidad de datos es un principio del producto, no letra chica.
  dataNote:
    'Construido sobre datos públicos de XM y las tarifas publicadas del mercado. Cuando un número es un cálculo nuestro, lo decimos.'
};

export type HomeDictionary = typeof homeDictEs;
