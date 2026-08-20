import { categoryToken } from "./types";

interface Palette {
  chip: string;
  dot: string;
  bar: string;
}

const MAP: Record<string, Palette> = {
  empresa: {
    chip: "bg-empresa-soft text-empresa border-empresa/25",
    dot: "bg-empresa",
    bar: "border-l-4 border-l-empresa bg-empresa-soft text-empresa",
  },
  pessoal: {
    chip: "bg-pessoal-soft text-pessoal border-pessoal/25",
    dot: "bg-pessoal",
    bar: "border-l-4 border-l-pessoal bg-pessoal-soft text-pessoal",
  },
  reuniao: {
    chip: "bg-reuniao-soft text-reuniao border-reuniao/25",
    dot: "bg-reuniao",
    bar: "border-l-4 border-l-reuniao bg-reuniao-soft text-reuniao",
  },
  urgente: {
    chip: "bg-urgente-soft text-urgente border-urgente/25",
    dot: "bg-urgente",
    bar: "border-l-4 border-l-urgente bg-urgente-soft text-urgente",
  },
  tarefa: {
    chip: "bg-tarefa-soft text-tarefa border-tarefa/25",
    dot: "bg-tarefa",
    bar: "border-l-4 border-l-tarefa bg-tarefa-soft text-tarefa",
  },
};

export function palette(category: string): Palette {
  return MAP[categoryToken(category)] ?? MAP["empresa"]!;
}
