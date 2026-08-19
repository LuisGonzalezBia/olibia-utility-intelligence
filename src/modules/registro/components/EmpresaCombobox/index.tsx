"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Input } from "@biaenergy/ui";
import {
  RiArrowDownSLine,
  RiArrowLeftLine,
  RiBuilding2Line,
  RiCheckLine,
  RiSearchLine,
} from "@biaenergy/ui/icons";
import { cn } from "@/utils/cn";
import {
  EMPRESA_GROUPS,
  EMPRESA_NO_LISTADA,
  getEmpresaById,
  type EmpresaGroup,
} from "../../models/empresas";
import { searchEmpresaGroups } from "../../utils/searchEmpresas";
import type { RegistroDictionary } from "../../dictionaries";

interface EmpresaComboboxProps {
  /** `id` de la empresa (ya con actividad resuelta), `EMPRESA_NO_LISTADA`, o `''` si no eligió nada. */
  value: string;
  onSelect: (id: string) => void;
  dict: RegistroDictionary;
  hasError?: boolean;
  id: string;
}

interface PanelPos {
  top: number;
  left: number;
  width: number;
}

/** Cuántos grupos se pintan sin filtrar. Al escribir, el filtro reduce la
 *  lista y el corte deja de importar. */
const MAX_VISIBLE = 60;

/**
 * Selector de empresa con búsqueda. El DS no expone un combobox (DESIGN.md
 * §6.2: "50+ opciones donde necesitas búsqueda — baja a Radix Combobox, no
 * incluido en el DS"), así que se compone con primitivas, igual que
 * `CountryCombobox` del landing.
 *
 * Una empresa puede tener varias actividades (AIR-E: comercialización,
 * distribución, generación) — cada una con su propio código SIC o `provider`.
 * El buscador la muestra UNA sola vez (agrupada por nombre) y, si esa empresa
 * tiene más de una actividad en el catálogo, pregunta cuál en un segundo paso
 * dentro del mismo panel, en vez de listar la empresa repetida.
 *
 * El panel va en un portal con `position: fixed` calculado contra el trigger:
 * el layout de `(public)` tiene `overflow-hidden` en el `<main>`, así que un
 * panel en flujo normal quedaría recortado (R10).
 */
export const EmpresaCombobox = ({
  value,
  onSelect,
  dict,
  hasError,
  id,
}: EmpresaComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<PanelPos | null>(null);
  // Grupo cuya actividad todavía falta desambiguar. Distinto de `null` = el
  // panel muestra el paso 2 (actividad) en vez de la lista de búsqueda.
  const [pendingGroup, setPendingGroup] = useState<EmpresaGroup | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchEmpresaGroups(query), [query]);
  const visible = useMemo(() => results.slice(0, MAX_VISIBLE), [results]);

  const selected = useMemo(
    () => (value === "" ? undefined : getEmpresaById(value)),
    [value],
  );
  const selectedGroup = useMemo(
    () =>
      selected === undefined
        ? undefined
        : EMPRESA_GROUPS.find((g) => g.name === selected.name),
    [selected],
  );

  const selectedLabel = useMemo(() => {
    if (value === EMPRESA_NO_LISTADA) return dict.fields.empresaNoListada;
    if (selected === undefined) return "";
    // Si la empresa tiene una sola actividad en el catálogo, mostrarla es
    // ruido. Si tiene varias, mostrarla confirma cuál quedó elegida.
    if (selectedGroup !== undefined && selectedGroup.options.length > 1) {
      return `${selected.name} — ${dict.actividades[selected.activity]}`;
    }
    return selected.name;
  }, [
    value,
    selected,
    selectedGroup,
    dict.fields.empresaNoListada,
    dict.actividades,
  ]);

  const closeMenu = () => {
    setOpen(false);
    setQuery("");
    setPendingGroup(null);
  };

  const updatePos = () => {
    const el = triggerRef.current;
    if (el === null) return;
    const rect = el.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  };

  useEffect(() => {
    if (!open) return undefined;
    updatePos();
    const onScrollOrResize = () => updatePos();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) === true) return;
      if (triggerRef.current?.contains(target) === true) return;
      closeMenu();
    };
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  const pick = (optionId: string) => {
    onSelect(optionId);
    closeMenu();
  };

  const pickGroup = (group: EmpresaGroup) => {
    const unica = group.options.length === 1 ? group.options[0] : undefined;
    if (unica !== undefined) {
      pick(unica.id);
      return;
    }
    // Más de una actividad para el mismo nombre (AIR-E, VOLTAJE EMPRESARIAL):
    // preguntar cuál en vez de listar la empresa una vez por actividad.
    setPendingGroup(group);
  };

  const renderGroupRow = (group: EmpresaGroup) => (
    <button
      key={group.name}
      type="button"
      onClick={() => pickGroup(group)}
      className="hover:bg-bg-weak-50 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left"
    >
      <span className="text-label-sm text-text-strong-950 flex-1 truncate">
        {group.name}
      </span>
      {selectedGroup?.name === group.name && (
        <RiCheckLine className="text-primary-base size-4 shrink-0" />
      )}
    </button>
  );

  const renderActivityRow = (group: EmpresaGroup) =>
    group.options.map((option) => (
      <button
        key={option.id}
        type="button"
        onClick={() => pick(option.id)}
        className="hover:bg-bg-weak-50 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left"
      >
        <span className="text-label-sm text-text-strong-950 flex-1 truncate">
          {dict.actividades[option.activity]}
        </span>
        {value === option.id && (
          <RiCheckLine className="text-primary-base size-4 shrink-0" />
        )}
      </button>
    ));

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "ring-stroke-soft-200 bg-bg-white-0 flex h-10 w-full items-center gap-2 rounded-lg px-3 text-left ring-1 transition",
          hasError === true && "ring-error-base",
        )}
      >
        <RiBuilding2Line className="text-text-soft-400 size-5 shrink-0" />
        <span
          className={cn(
            "text-paragraph-sm flex-1 truncate",
            selectedLabel === ""
              ? "text-text-soft-400"
              : "text-text-strong-950",
          )}
        >
          {selectedLabel === ""
            ? dict.fields.empresaPlaceholder
            : selectedLabel}
        </span>
        <RiArrowDownSLine className="text-text-soft-400 size-5 shrink-0" />
      </button>

      {open &&
        pos !== null &&
        createPortal(
          <div
            ref={panelRef}
            role="listbox"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              zIndex: 60,
            }}
            className="ring-stroke-soft-200 bg-bg-white-0 max-h-80 overflow-y-auto rounded-xl p-2 shadow-lg ring-1"
          >
            {pendingGroup === null ? (
              <>
                <Input.Root size="xsmall" className="mb-2">
                  <Input.Wrapper>
                    <Input.Icon as={RiSearchLine} />
                    <Input.Input
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={dict.combobox.search}
                    />
                  </Input.Wrapper>
                </Input.Root>

                {visible.map(renderGroupRow)}

                {results.length > MAX_VISIBLE && (
                  <p className="text-subheading-2xs text-text-soft-400 px-2 py-1.5">
                    {dict.combobox.resultsCount(results.length)}
                  </p>
                )}
                {results.length === 0 && (
                  <p className="text-paragraph-sm text-text-soft-400 px-2 py-3 text-center">
                    {dict.combobox.noResults}
                  </p>
                )}

                {/* Sentinel: siempre visible al final, aunque el filtro no traiga
                    nada — es la salida para consultoras, banca y reguladores. */}
                <button
                  type="button"
                  onClick={() => pick(EMPRESA_NO_LISTADA)}
                  className="hover:bg-bg-weak-50 border-stroke-soft-200 mt-1 flex w-full items-center gap-2 rounded-md border-t px-2 py-2 text-left"
                >
                  <span className="text-label-sm text-text-sub-600 flex-1">
                    {dict.fields.empresaNoListada}
                  </span>
                  {value === EMPRESA_NO_LISTADA && (
                    <RiCheckLine className="text-primary-base size-4 shrink-0" />
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setPendingGroup(null)}
                  className="text-label-sm text-text-sub-600 hover:bg-bg-weak-50 mb-1 flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left"
                >
                  <RiArrowLeftLine className="size-4 shrink-0" />
                  {pendingGroup.name}
                </button>
                <p className="text-subheading-2xs text-text-soft-400 px-2 pb-1">
                  {dict.combobox.chooseActivity}
                </p>
                {renderActivityRow(pendingGroup)}
              </>
            )}
          </div>,
          document.body,
        )}
    </>
  );
};
