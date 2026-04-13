import { Carrera } from "../types";
import carrerasIngenieria from "./facultad-ingenieria";
/*
import carrerasJuridicas from "./facultad-juridicas";
import carrerasEconomicas from "./facultad-economicas";
import carrerasHumanidades from "./facultad-humanidades";
import carrerasNaturales from "./facultad-naturales";

const carreras: Record<string, Carrera[]> = {
    ingenieria: carrerasIngenieria,
    juridicas: carrerasJuridicas,
     economicas: carrerasEconomicas,
     humanidades: carrerasHumanidades,
    naturales: carrerasNaturales,
};

export const FACULTAD_NOMBRES: Record<string, string> = {
    "Facultad de Ciencias Jurídicas y Sociales": "Facultad de Ciencias Jurídicas",
    "Facultad de Ingeniería": "Facultad de Ingeniería",
    "Facultad de Ciencias Naturales y Ciencias de la Salud": "Facultad de Ciencias Naturales y Ciencias de la Salud",
    "Facultad de Ciencias Económicas": "Facultad de Ciencias Económicas",
    "Facultad de Humanidades": "Facultad de Humanidades y Ciencias Sociales",
};

*/
const carreras: Record<string, Carrera[]> = {
    ingenieria: carrerasIngenieria,
};

export const FACULTAD_NOMBRES: Record<string, string> = {
    "Facultad de Ingeniería": "Facultad de Ingeniería",
};

export default carreras;
