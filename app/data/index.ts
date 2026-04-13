import { Carrera } from "../types";
import carrerasIngenieria from "./facultad-ingenieria";

const carreras: Record<string, Carrera[]> = {
    ingenieria: carrerasIngenieria,
};

export const FACULTAD_NOMBRES: Record<string, string> = {
    "Facultad de Ingeniería": "Facultad de Ingeniería",
};

export default carreras;
