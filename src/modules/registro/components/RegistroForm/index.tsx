"use client";

import { useState, type FormEvent } from "react";
import {
  Alert,
  Checkbox,
  FancyButton,
  Hint,
  Input,
  Label,
  Radio,
  Select,
} from "@biaenergy/ui";
import { RiErrorWarningFill } from "@biaenergy/ui/icons";
import { FormField } from "@/components/FormField";
import type { Locale } from "@/i18n/config";
import { getRegistroDict } from "../../dictionaries";
import { EMPRESA_NO_LISTADA, getEmpresaById } from "../../models/empresas";
import { ACTIVIDADES } from "../../models/actividades";
import type {
  AreaEquipo,
  RegistroFormValues,
  RegistroPayload,
  TipoOrganizacion,
} from "../../models/registro.interface";
import { EmpresaCombobox } from "../EmpresaCombobox";

/** Versión de la política de tratamiento de datos que el usuario acepta. Sin
 *  versionar, el consentimiento no sirve como evidencia si la política cambia. */
const POLITICA_VERSION = "2026-08";

const MIN_PASSWORD = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AREAS: readonly AreaEquipo[] = [
  "VENTAS_USUARIO_FINAL",
  "COMPRAS_MAYORISTAS",
  "VENTAS_MAYORISTAS",
  "PLANEACION_FINANCIERA",
  "REGULACION",
  "OPERACION",
  "RIESGOS",
  "DIRECCION",
  "OTRA",
];

const TIPOS: readonly TipoOrganizacion[] = ["PRIVADO", "PUBLICO", "MIXTO"];

// La mayoría de quienes se registran representan un agente del sector — por
// eso el toggle arranca en `true` y no en un estado sin elegir: obliga a
// periodistas/estudiantes/consultores a un clic extra, en vez de obligar a la
// mayoría a decidir algo que ya sabemos que responderán "sí".
const EMPTY: RegistroFormValues = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  cargo: "",
  telefono: "",
  representaOrganizacion: true,
  empresaId: "",
  empresaOtra: "",
  actividad: null,
  tipoOrganizacion: null,
  area: null,
  autorizaDatos: false,
};

type FieldErrors = Partial<Record<keyof RegistroFormValues, string>>;

interface RegistroFormProps {
  locale: Locale;
}

export const RegistroForm = ({ locale }: RegistroFormProps) => {
  const dict = getRegistroDict(locale);
  const [values, setValues] = useState<RegistroFormValues>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const set = <K extends keyof RegistroFormValues>(
    key: K,
    value: RegistroFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Limpiar el error del campo apenas lo corrigen — mantenerlo mientras el
    // usuario escribe la corrección se lee como que la corrección no sirvió.
    setErrors((prev) =>
      prev[key] === undefined ? prev : { ...prev, [key]: undefined },
    );
  };

  const setRepresentaOrganizacion = (representa: boolean) => {
    // Al pasar a "No" se descarta lo ya elegido de empresa/tipo/área: son
    // datos que dejaron de aplicar, no queremos mandarlos a medio llenar.
    setValues((prev) => ({
      ...prev,
      representaOrganizacion: representa,
      ...(representa
        ? {}
        : {
            empresaId: "",
            empresaOtra: "",
            tipoOrganizacion: null,
            area: null,
          }),
    }));
    setErrors((prev) => ({
      ...prev,
      empresaId: undefined,
      empresaOtra: undefined,
      tipoOrganizacion: undefined,
      area: undefined,
    }));
  };

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (values.nombre.trim() === "") e.nombre = dict.errors.required;
    if (values.apellido.trim() === "") e.apellido = dict.errors.required;
    if (!EMAIL_RE.test(values.email.trim())) e.email = dict.errors.emailInvalid;
    if (values.password.length < MIN_PASSWORD)
      e.password = dict.errors.passwordShort;
    if (values.cargo.trim() === "") e.cargo = dict.errors.required;
    if (values.representaOrganizacion) {
      if (values.empresaId === "") e.empresaId = dict.errors.empresaRequired;
      if (
        values.empresaId === EMPRESA_NO_LISTADA &&
        (values.empresaOtra ?? "").trim() === ""
      ) {
        e.empresaOtra = dict.errors.empresaOtraRequired;
      }
      if (
        values.empresaId === EMPRESA_NO_LISTADA &&
        (values.actividad ?? null) === null
      ) {
        // Sin actividad no se sabe si le aplican las métricas, y quedaría
        // fuera del intercambio sin entender por qué.
        e.actividad = "Selecciona la actividad de tu organización.";
      }
    }
    if (!values.autorizaDatos) e.autorizaDatos = dict.habeasData.required;
    return e;
  };

  const buildPayload = (): RegistroPayload => {
    const base = {
      nombre: values.nombre.trim(),
      apellido: values.apellido.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
      cargo: values.cargo.trim(),
      telefono:
        (values.telefono ?? "").trim() === ""
          ? undefined
          : values.telefono?.trim(),
      politicaVersion: POLITICA_VERSION,
    };

    if (!values.representaOrganizacion) {
      return {
        ...base,
        representaOrganizacion: false,
        sic: null,
        goldProvider: null,
        empresaNombre: "",
        actividad: null,
        enCatalogo: false,
        tipoOrganizacion: null,
        area: null,
      };
    }

    const empresa =
      values.empresaId === EMPRESA_NO_LISTADA
        ? undefined
        : getEmpresaById(values.empresaId);
    return {
      ...base,
      representaOrganizacion: true,
      sic: empresa?.sic ?? null,
      // Es lo que permite resaltar su fila en el ranking; null si no tiene tarifa.
      goldProvider: empresa?.goldProvider ?? null,
      empresaNombre: empresa?.name ?? (values.empresaOtra ?? "").trim(),
      // Del catálogo si está; si no, la que declaró en el formulario.
      actividad: empresa?.activity ?? values.actividad ?? null,
      enCatalogo: empresa !== undefined,
      tipoOrganizacion: values.tipoOrganizacion,
      area: values.area,
    };
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGlobalError(null);
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (response.status === 409) {
        setErrors({ email: dict.errors.emailInUse });
        return;
      }
      if (!response.ok) {
        setGlobalError(dict.errors.generic);
        return;
      }
      setIsDone(true);
    } catch {
      setGlobalError(dict.errors.generic);
    } finally {
      setIsSubmitting(false);
    }
  };

  const esNoListado = values.empresaId === EMPRESA_NO_LISTADA;

  if (isDone) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-title-h6 text-text-strong-950">
          {dict.exito.titulo}
        </h2>
        <p className="text-paragraph-sm text-text-sub-600">
          {dict.exito.detalle(values.email.trim().toLowerCase())}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {globalError !== null && (
        <Alert.Root status="error" size="small">
          <Alert.Icon as={RiErrorWarningFill} />
          <span>{globalError}</span>
        </Alert.Root>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          id="nombre"
          label={dict.fields.nombre}
          required
          error={errors.nombre}
        >
          <Input.Root hasError={errors.nombre !== undefined}>
            <Input.Wrapper>
              <Input.Input
                id="nombre"
                value={values.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                autoComplete="given-name"
              />
            </Input.Wrapper>
          </Input.Root>
        </FormField>

        <FormField
          id="apellido"
          label={dict.fields.apellido}
          required
          error={errors.apellido}
        >
          <Input.Root hasError={errors.apellido !== undefined}>
            <Input.Wrapper>
              <Input.Input
                id="apellido"
                value={values.apellido}
                onChange={(e) => set("apellido", e.target.value)}
                autoComplete="family-name"
              />
            </Input.Wrapper>
          </Input.Root>
        </FormField>
      </div>

      <FormField
        id="email"
        label={dict.fields.email}
        required
        error={errors.email}
        hint={dict.fields.emailHint}
      >
        <Input.Root hasError={errors.email !== undefined}>
          <Input.Wrapper>
            <Input.Input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              autoComplete="email"
            />
          </Input.Wrapper>
        </Input.Root>
      </FormField>

      <FormField
        id="password"
        label={dict.fields.password}
        required
        error={errors.password}
        hint={dict.fields.passwordHint}
      >
        <Input.Root hasError={errors.password !== undefined}>
          <Input.Wrapper>
            <Input.Input
              id="password"
              type="password"
              value={values.password}
              onChange={(e) => set("password", e.target.value)}
              autoComplete="new-password"
            />
          </Input.Wrapper>
        </Input.Root>
      </FormField>

      {/* Representa organización: 2 opciones → Radio (set chico, evita Select).
          Decide si el resto del bloque (tipo, empresa, área) tiene sentido. */}
      <fieldset className="flex flex-col gap-1.5">
        <Label.Root>{dict.representaOrganizacion.label}</Label.Root>
        <Radio.Group
          value={values.representaOrganizacion ? "si" : "no"}
          onValueChange={(value) => setRepresentaOrganizacion(value === "si")}
          className="flex flex-wrap gap-4"
        >
          <div className="flex items-center gap-2">
            <Radio.Item id="representa-si" value="si" />
            <Label.Root htmlFor="representa-si" className="cursor-pointer">
              {dict.representaOrganizacion.si}
            </Label.Root>
          </div>
          <div className="flex items-center gap-2">
            <Radio.Item id="representa-no" value="no" />
            <Label.Root htmlFor="representa-no" className="cursor-pointer">
              {dict.representaOrganizacion.no}
            </Label.Root>
          </div>
        </Radio.Group>
        <p className="text-paragraph-xs text-text-soft-400">
          {dict.representaOrganizacion.hint}
        </p>
      </fieldset>

      {values.representaOrganizacion && (
        <>
          {/* Tipo de organización antes de empresa: decide si tiene sentido
              pedir un agente del MEM o si es sector público/mixto sin agente. */}
          <fieldset className="flex flex-col gap-1.5">
            <Label.Root>
              {dict.fields.tipoOrganizacion}
              <Label.Asterisk />
            </Label.Root>
            <Radio.Group
              value={values.tipoOrganizacion ?? undefined}
              onValueChange={(value) =>
                set("tipoOrganizacion", value as TipoOrganizacion)
              }
              className="flex flex-wrap gap-4"
            >
              {TIPOS.map((tipo) => (
                <div key={tipo} className="flex items-center gap-2">
                  <Radio.Item id={`tipo-${tipo}`} value={tipo} />
                  <Label.Root
                    htmlFor={`tipo-${tipo}`}
                    className="cursor-pointer"
                  >
                    {dict.tipoOrganizacion[tipo]}
                  </Label.Root>
                </div>
              ))}
            </Radio.Group>
          </fieldset>

          <FormField
            id="empresa"
            label={dict.fields.empresa}
            required
            error={errors.empresaId}
          >
            <EmpresaCombobox
              id="empresa"
              value={values.empresaId}
              onSelect={(id) => set("empresaId", id)}
              dict={dict}
              hasError={errors.empresaId !== undefined}
            />
          </FormField>

          {esNoListado && (
            <FormField
              id="empresaOtra"
              label={dict.fields.empresaOtra}
              required
              error={errors.empresaOtra}
              hint={dict.fields.empresaOtraHint}
            >
              <Input.Root hasError={errors.empresaOtra !== undefined}>
                <Input.Wrapper>
                  <Input.Input
                    id="empresaOtra"
                    value={values.empresaOtra ?? ""}
                    onChange={(e) => set("empresaOtra", e.target.value)}
                    autoComplete="organization"
                  />
                </Input.Wrapper>
              </Input.Root>
            </FormField>
          )}

          {/* La actividad solo se pregunta cuando NO sale del catálogo.
              No es un campo más: decide si a esta persona le aplicará el
              intercambio de métricas. Un comercializador o un operador de red
              tienen clientes finales; un generador, un transportador o un
              regulador no, y ofrecerles después un formulario de NPS sería
              pedirles algo que no existe. */}
          {esNoListado && (
            <FormField
              id="actividad"
              label="Actividad principal"
              required
              error={errors.actividad}
              hint="Nos dice qué comparaciones tienen sentido para tu organización."
            >
              <Select.Root
                value={values.actividad ?? ""}
                onValueChange={(v) => set("actividad", v as never)}
              >
                <Select.Trigger id="actividad">
                  <Select.Value placeholder="Selecciona una" />
                </Select.Trigger>
                <Select.Content>
                  {ACTIVIDADES.map((a) => (
                    <Select.Item key={a.valor} value={a.valor}>
                      {a.etiqueta}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </FormField>
          )}
        </>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          id="cargo"
          label={dict.fields.cargo}
          required
          error={errors.cargo}
        >
          <Input.Root hasError={errors.cargo !== undefined}>
            <Input.Wrapper>
              <Input.Input
                id="cargo"
                value={values.cargo}
                onChange={(e) => set("cargo", e.target.value)}
                autoComplete="organization-title"
              />
            </Input.Wrapper>
          </Input.Root>
        </FormField>

        <FormField
          id="telefono"
          label={dict.fields.telefono}
          hint={dict.fields.telefonoOptional}
        >
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                id="telefono"
                type="tel"
                value={values.telefono ?? ""}
                onChange={(e) => set("telefono", e.target.value)}
                autoComplete="tel"
              />
            </Input.Wrapper>
          </Input.Root>
        </FormField>
      </div>

      {/* Área: 9 opciones → Select. Solo tiene sentido con una organización detrás. */}
      {values.representaOrganizacion && (
        <FormField id="area" label={dict.fields.area} required>
          <Select.Root
            value={values.area ?? undefined}
            onValueChange={(value) => set("area", value as AreaEquipo)}
          >
            <Select.Trigger id="area">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {AREAS.map((area) => (
                <Select.Item key={area} value={area}>
                  {dict.areas[area]}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </FormField>
      )}

      {/* Habeas data (Ley 1581 de 2012): obligatorio, con versión de política. */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-2">
          <Checkbox.Root
            id="autorizaDatos"
            checked={values.autorizaDatos}
            onCheckedChange={(checked) =>
              set("autorizaDatos", checked === true)
            }
            className="mt-0.5"
          />
          <Label.Root htmlFor="autorizaDatos" className="cursor-pointer">
            {dict.habeasData.label}
            <Label.Asterisk />
          </Label.Root>
        </div>
        {errors.autorizaDatos !== undefined && (
          <Hint.Root hasError>
            <Hint.Icon as={RiErrorWarningFill} />
            {errors.autorizaDatos}
          </Hint.Root>
        )}
      </div>

      {/* Una sola FancyButton por pantalla: es la acción primaria. */}
      <FancyButton.Root variant="primary" type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? dict.submitting : dict.submit}
      </FancyButton.Root>
    </form>
  );
};
