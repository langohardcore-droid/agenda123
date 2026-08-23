import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const speechInputSchema = z.object({
  text: z.string(),
  contextDate: z.string().optional(),
});

export const processSpeech = createServerFn({ method: "POST" })
  .inputValidator((data) => speechInputSchema.parse(data))
  .handler(async ({ data }) => {
    const { aiGateway } = await import("@lovable.dev/ai-gateway");
    
    const now = data.contextDate || new Date().toISOString();
    
    const prompt = `
Você é um assistente de agenda inteligente para Jessica e Anderson.
Extraia informações de um comando de voz e retorne um JSON estruturado para criar um compromisso.

Texto do comando: "${data.text}"
Data/Hora de referência (hoje): ${now}

Campos a extrair:
1. title (título curto e objetivo)
2. description (descrição completa)
3. scope ("empresa" ou "pessoal" - padrão "empresa")
4. category (um de: "empresa", "pessoal", "reuniao", "urgente", "tarefa", "cliente", "visita", "evento", "ligacao", "prazo", "consulta", "aniversario", "viagem", "lembrete")
5. date (formato YYYY-MM-DD)
6. startTime (formato HH:mm)
7. endTime (formato HH:mm, padrão 1 hora após início se não especificado)
8. location (local se mencionado)
9. responsible ("Jessica" ou "Anderson", tente identificar pelo texto ou padrão "Jessica")
10. priority ("baixa", "media", "alta", "urgente" - padrão "media")

Regras de negócio:
- Se disser "amanhã", calcule a data correta baseada na referência.
- Identifique o responsável ("eu sou o Anderson", "aqui é a Jessica", etc).
- Se não houver horário, use "09:00" às "10:00" como padrão.

Retorne APENAS o JSON no formato:
{
  "title": string,
  "description": string,
  "scope": "empresa" | "pessoal",
  "category": string,
  "date": string,
  "startTime": string,
  "endTime": string,
  "location": string | null,
  "responsible": "Jessica" | "Anderson",
  "priority": "baixa" | "media" | "alta" | "urgente"
}
`;

    try {
      const response = await aiGateway.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Você é um extrator de dados de agenda. Retorne apenas JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("Falha ao processar áudio");
      
      return JSON.parse(content);
    } catch (error) {
      console.error("Erro no processSpeech:", error);
      throw new Error("Não foi possível entender o comando de voz. Tente novamente.");
    }
  });
