import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

const ACTIVIDADES = [
  'COMERCIALIZACION',
  'GENERACION',
  'DISTRIBUCION',
  'TRANSPORTE',
  'CENTRO_RECOLECCION'
] as const;
const TIPOS_ORGANIZACION = ['PRIVADO', 'PUBLICO', 'MIXTO'] as const;
const AREAS = [
  'VENTAS_USUARIO_FINAL',
  'COMPRAS_MAYORISTAS',
  'VENTAS_MAYORISTAS',
  'PLANEACION_FINANCIERA',
  'REGULACION',
  'OPERACION',
  'RIESGOS',
  'DIRECCION',
  'OTRA'
] as const;

// Espeja RegistroPayload. Se valida de nuevo acá aunque el cliente ya validó:
// lo que llega por HTTP no respeta el contrato solo porque el cliente lo tipó.
const registroSchema = z.object({
  nombre: z.string().min(1).max(255),
  apellido: z.string().min(1).max(255),
  email: z.string().email().max(255),
  // El máximo evita que alguien mande megabytes a hashear: argon2id sobre una
  // entrada gigante es un DoS barato.
  password: z.string().min(8).max(200),
  cargo: z.string().min(1).max(255),
  telefono: z.string().max(50).optional(),
  representaOrganizacion: z.boolean(),
  sic: z.string().max(16).nullable(),
  goldProvider: z.string().max(255).nullable(),
  empresaNombre: z.string().max(255),
  actividad: z.enum(ACTIVIDADES).nullable(),
  enCatalogo: z.boolean(),
  tipoOrganizacion: z.enum(TIPOS_ORGANIZACION).nullable(),
  area: z.enum(AREAS).nullable(),
  politicaVersion: z.string().min(1).max(16)
});

const BACKEND_PATH = '/ms-bia-growth-status/public-ms/utility-intelligence/registro';

/**
 * POST /api/registro — crea la cuenta del padrón propio de Utility Intelligence.
 *
 * El browser nunca habla directo con el backend: pasa por acá para que la URL
 * interna del gateway no quede expuesta en el cliente y para poder centralizar
 * el manejo de errores. La contraseña viaja en el body sobre TLS y la hashea el
 * backend con argon2id — nunca se loguea, ni acá ni allá.
 */
export const POST = async (request: NextRequest) => {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = registroSchema.safeParse(payload);
  if (!parsed.success) {
    // Los detalles NO incluyen los valores enviados: uno de ellos es la
    // contraseña y no queremos que aparezca reflejada en una respuesta.
    return NextResponse.json(
      { error: 'invalid_registro', fields: Object.keys(parsed.error.flatten().fieldErrors) },
      { status: 400 }
    );
  }

  const backendUrl = process.env.BACKEND_URL;
  if (backendUrl === undefined || backendUrl === '') {
    console.error('[registro] falta BACKEND_URL');
    return NextResponse.json({ error: 'backend_not_configured' }, { status: 500 });
  }

  try {
    const upstream = await fetch(`${backendUrl.replace(/\/+$/, '')}${BACKEND_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
      cache: 'no-store'
    });

    // 409 = correo ya registrado. Se propaga tal cual para que el formulario lo
    // muestre sobre el campo de correo en vez del error genérico.
    if (upstream.status === 409) {
      return NextResponse.json({ error: 'email_in_use' }, { status: 409 });
    }
    if (!upstream.ok) {
      console.error('[registro] backend respondió', upstream.status);
      return NextResponse.json({ error: 'backend_failed' }, { status: 502 });
    }
    const body: unknown = await upstream.json().catch(() => ({}));
    return NextResponse.json(body);
  } catch (error) {
    console.error('[registro] backend inalcanzable:', error);
    return NextResponse.json({ error: 'backend_unreachable' }, { status: 502 });
  }
};
