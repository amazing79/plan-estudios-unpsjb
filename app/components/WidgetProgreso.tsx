"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import type { Materia, EstadoMateria, RequisitoComplementario } from "../types";
import { obtenerMateriasVisibles, obtenerMateriasOptativas } from "../lib/diagrama";

export interface WidgetProgresoProps {
    materias: Materia[];
    requisitos?: RequisitoComplementario[];
    getEstado: (codigo: string) => EstadoMateria;
    getOptativaElegida?: (slotCodigo: string) => string | undefined;
}

function useNumeroAnimado(objetivo: number, duracion = 800) {
    const [mostrado, setMostrado] = useState(objetivo);
    const refAnterior = useRef(objetivo);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const from = refAnterior.current;
        const to = objetivo;
        if (from === to) return;

        const startTime = performance.now();

        const animar = (now: number) => {
            const elapsed = now - startTime;
            const progreso = Math.min(elapsed / duracion, 1);
            const eased = 1 - Math.pow(1 - progreso, 3);
            setMostrado(from + (to - from) * eased);

            if (progreso < 1) {
                rafRef.current = requestAnimationFrame(animar);
            } else {
                refAnterior.current = to;
            }
        };

        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(animar);

        return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
    }, [objetivo, duracion]);

    return mostrado;
}

export default function WidgetProgreso({ materias, requisitos = [], getEstado, getOptativaElegida }: WidgetProgresoProps) {
    const { aprobadas, total, pct, finalesPendientes } = useMemo(() => {
        const items = obtenerMateriasVisibles(materias);
        const opcionesPool = obtenerMateriasOptativas(materias);

        const estadoDeItem = (m: Materia): EstadoMateria => {
            if (m.esOptativa && m.grupoOptativa) {
                const elegida = getOptativaElegida?.(m.codigo);
                return elegida ? getEstado(elegida) : "pendiente";
            }
            return getEstado(m.codigo);
        };
        const gruposConSlot = new Set(
            items.map((m) => m.grupoOptativa).filter((g): g is string => Boolean(g))
        );
        const gruposSinSlot = [
            ...new Set(
                opcionesPool
                    .map((m) => m.grupoOptativa)
                    .filter((g): g is string => Boolean(g))
            ),
        ].filter((g) => !gruposConSlot.has(g));

        const grupoTieneEstado = (grupo: string, estado: EstadoMateria) =>
            opcionesPool.some(
                (m) => m.grupoOptativa === grupo && getEstado(m.codigo) === estado
            );

        const totalItems = items.length + gruposSinSlot.length + requisitos.length;

        const aprobMaterias = items.filter(
            (m) => estadoDeItem(m) === "aprobada"
        ).length;

        const aprobGruposSinSlot = gruposSinSlot.filter(
            (g) => grupoTieneEstado(g, "aprobada")
        ).length;

        const aprobRequisitos = requisitos.filter(
            (r) => getEstado(r.codigo) === "aprobada"
        ).length;

        let pendientes = 0;
        items.forEach(m => {
            if (estadoDeItem(m) === "regular") pendientes++;
        });
        gruposSinSlot.forEach(g => {
            if (!grupoTieneEstado(g, "aprobada") && grupoTieneEstado(g, "regular")) pendientes++;
        });
        requisitos.forEach(r => {
            if (getEstado(r.codigo) === "regular") pendientes++;
        });

        const cursadasAprobadas = aprobMaterias + aprobGruposSinSlot + aprobRequisitos;
        const porcentaje = totalItems === 0 ? 0 : (cursadasAprobadas / totalItems) * 100;
        return { aprobadas: cursadasAprobadas, total: totalItems, pct: porcentaje, finalesPendientes: pendientes };
    }, [materias, requisitos, getEstado, getOptativaElegida]);

    const pctAnimado = useNumeroAnimado(pct);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-300 bg-white/95 px-4 py-4 backdrop-blur-md dark:border-slate-700/60 dark:bg-black/95
            md:flex md:h-[80px] md:items-center md:justify-between md:px-8">
            <div className="flex items-center gap-3 md:hidden">
                <div className="flex items-baseline gap-0.5">
                    <span className="text-4xl font-bold tabular-nums leading-none text-emerald-600 dark:text-emerald-400">
                        {pctAnimado.toFixed(2)}
                    </span>
                    <span className="text-lg font-semibold text-emerald-600/70 dark:text-emerald-500/70">%</span>
                </div>
                <div className="flex flex-1 flex-col gap-1">
                    <p className="text-xs text-slate-600 dark:text-slate-500">
                        {aprobadas}/{total} aprobadas
                    </p>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-700 ease-out"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    {(aprobadas > 0 || finalesPendientes > 0) && (
                        <p className="mt-0.5 text-[10px] sm:text-xs">
                            {finalesPendientes > 0 ? (
                                <span className="font-medium text-amber-500">
                                    ¡Tenés {finalesPendientes} {finalesPendientes === 1 ? 'final pendiente' : 'finales pendientes'}!
                                </span>
                            ) : (
                                <span className="font-medium text-emerald-500">
                                    ¡Estas al dia con tus finales!
                                </span>
                            )}
                        </p>
                    )}
                </div>
            </div>

            <div className="hidden md:flex md:w-full md:items-center md:gap-8">
                <div className="flex shrink-0 items-center gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                        Avance
                    </p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold tabular-nums leading-none text-emerald-600 dark:text-emerald-400">
                            {pctAnimado.toFixed(2)}
                        </span>
                        <span className="text-lg font-semibold text-emerald-600/70 dark:text-emerald-500/70">%</span>
                    </div>
                </div>

                <div className="flex flex-1 flex-col justify-center gap-1.5">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-700 ease-out"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    {(aprobadas > 0 || finalesPendientes > 0) && (
                        <p className="text-[11px] md:text-xs">
                            {finalesPendientes > 0 ? (
                                <span className="font-medium text-amber-600 dark:text-amber-500">
                                    ¡Tenés {finalesPendientes} {finalesPendientes === 1 ? 'final pendiente' : 'finales pendientes'}!
                                </span>
                            ) : (
                                <span className="font-medium text-emerald-600 dark:text-emerald-500">
                                    ¡Estas al dia con tus finales!
                                </span>
                            )}
                        </p>
                    )}
                </div>

                <div className="shrink-0 text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-slate-200">{aprobadas}</span> de {total} materias aprobadas
                </div>
            </div>
        </div>
    );
}
