import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { backendPost } from '@/backend/client';

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

/**
 * POST /api/registro — crea la cuenta en el padrón propio de Utility
 * Intelligence. El backend hashea la contraseña con argon2id y manda el correo
 * de verificación; acá no se guarda nada.
 *
 * No abre sesión: la cuenta queda sin verificar hasta que la persona haga clic
 * en el enlace del correo. Ese clic es lo que prueba que el correo es suyo.
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
    // Se devuelven solo los NOMBRES de los campos inválidos, nunca los valores:
    // uno de ellos es la contraseña y no debe volver reflejada en la respuesta.
    return NextResponse.json(
      { error: 'invalid_registro', fields: Object.keys(parsed.error.flatten().fieldErrors) },
      { status: 400 }
    );
  }

  try {
    const result = await backendPost<{ id: number }>('/registro', parsed.data);

    if (result.status === 409) {
      return NextResponse.json({ error: 'email_in_use' }, { status: 409 });
    }
    if (!result.ok) {
      console.error('[registro] el backend respondió', result.status);
      return NextResponse.json({ error: 'backend_failed' }, { status: 502 });
    }
    return NextResponse.json(result.data ?? {}, { status: 201 });
  } catch (error) {
    console.error('[registro] backend inalcanzable:', error);
    return NextResponse.json({ error: 'backend_unreachable' }, { status: 502 });
  }
};
