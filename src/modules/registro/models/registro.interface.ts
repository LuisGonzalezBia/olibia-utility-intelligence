import type { ActividadEmpresa } from "./empresas";

/**
 * Registro corporativo de Olibia Utility Intelligence.
 *
 * Esta plataforma NO es para usuarios de Olibia: es para agentes del sector
 * energético colombiano, con su propio padrón de usuarios. La cuenta se crea
 * en nuestro backend (contraseña hasheada ahí), no en el Firebase de Bia —
 * son personas de otra naturaleza, que tampoco pasan por los roles internos.
 *
 * El agente que la persona elige acá es el que después se resalta en el
 * ranking de competitividad.
 */

/** Naturaleza jurídica de la organización. */
export type TipoOrganizacion = "PRIVADO" | "PUBLICO" | "MIXTO";

/**
 * Área funcional dentro del agente. Determina qué vistas tienen sentido por
 * defecto y, cuando la empresa tiene varios códigos SIC (comercialización vs.
 * generación), ayuda a desambiguar cuál es "su" agente en el ranking.
 */
export type AreaEquipo =
  | "VENTAS_USUARIO_FINAL"
  | "COMPRAS_MAYORISTAS"
  | "VENTAS_MAYORISTAS"
  | "PLANEACION_FINANCIERA"
  | "REGULACION"
  | "OPERACION"
  | "RIESGOS"
  | "DIRECCION"
  | "OTRA";

export interface RegistroFormValues {
  nombre: string;
  apellido: string;
  /** Correo corporativo. Es también el usuario de la cuenta. */
  email: string;
  password: string;
  cargo: string;
  /** Opcional — no se pide como requisito para no agregar fricción al gate. */
  telefono?: string;
  /**
   * Periodistas, estudiantes y consultores independientes no representan un
   * agente del sector. Cuando es `false`, se salta todo el bloque
   * empresa/tipo de organización/área — no aplica, y preguntarlo es fricción
   * sin sentido para esa audiencia.
   */
  representaOrganizacion: boolean;
  /**
   * `id` de la empresa elegida (ver `EmpresaOption`), o `EMPRESA_NO_LISTADA`
   * cuando no está en el catálogo (consultoras, gremios, banca, reguladores,
   * grandes consumidores: audiencia contemplada por el producto).
   */
  empresaId: string;
  /** Nombre escrito a mano. Solo cuando `empresaId === EMPRESA_NO_LISTADA`. */
  empresaOtra?: string;
  /**
   * Actividad declarada a mano. Solo aplica cuando la empresa NO está en el
   * catálogo — si está, la actividad sale de ahí y este campo se ignora.
   */
  actividad?: ActividadEmpresa | null;
  /** `null` mientras `representaOrganizacion` sea `false` o no se haya elegido. */
  tipoOrganizacion: TipoOrganizacion | null;
  area: AreaEquipo | null;
  /**
   * Autorización de tratamiento de datos personales. Obligatoria por Ley 1581
   * de 2012 (habeas data): se capturan datos de personas que no son usuarios
   * de Bia, así que el consentimiento es un requisito legal, no una cortesía.
   */
  autorizaDatos: boolean;
}

/**
 * Payload que viaja al backend. Deriva de los valores del formulario.
 *
 * La contraseña viaja acá (sobre TLS) y el backend la hashea con argon2id —
 * nunca se guarda ni se loguea en claro, ni se hashea en el cliente (hacerlo
 * en el browser no agrega seguridad: el hash pasaría a ser la credencial).
 */
export interface RegistroPayload {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  cargo: string;
  telefono?: string;
  representaOrganizacion: boolean;
  /** Código SIC de XM. `null` si la empresa no está en el catálogo de XM. */
  sic: string | null;
  /**
   * `provider` de `energy.comp_ranking_market_monthly`. Es lo que permite
   * resaltar la fila de esta empresa en el ranking. `null` si no tiene tarifa
   * publicada (o si la escribió a mano).
   */
  goldProvider: string | null;
  /** Nombre común — el que ve el usuario. Vacío si no representa organización. */
  empresaNombre: string;
  /** `null` cuando la empresa no está en el catálogo o no aplica. */
  actividad: ActividadEmpresa | null;
  /** Falso para empresas escritas a mano, o cuando no aplica. */
  enCatalogo: boolean;
  tipoOrganizacion: TipoOrganizacion | null;
  area: AreaEquipo | null;
  /** Versión de la política aceptada — el consentimiento sin versión no sirve
   *  como evidencia si la política cambia. */
  politicaVersion: string;
}

export interface RegistroResponse {
  id: string;
}
