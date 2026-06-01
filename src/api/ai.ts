"use server";
import OpenAI from "openai";
const ai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});
function extractJson(text: string) {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(?:json)?\n?/i, "")
      .replace(/\n?```$/i, "")
      .trim();
  }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
}
export async function categorizeTicketWithAI(
  title: string,
  description: string,
) {
  try {
    const prompt = ` У нас есть система заявок (HelpDesk). Определи ПРИОРИТЕТ и КАТЕГОРИЮ для следующей заявки. Заголовок: "${title}" Описание: "${description}" Приоритет должен быть одним из: - low - medium - high Правила: - high: срочно, авария, критическая ошибка, система лежит - medium: проблема мешает работе, но не блокирует ее полностью - low: запрос доступов, консультация, нет срочности Категория должна быть одной из: - hardware - network - access_rights - software - billing - consultation - security - other Правила категорий: - hardware: проблемы с ПК, принтером, монитором и другим оборудованием - network: интернет, сеть, VPN - access_rights: права доступа, пароли - software: ошибки ПО, установка программ - billing: вопросы оплаты - consultation: консультации - security: вирусы, фишинг, ИБ-инциденты - other: другое Также сформируй короткий вежливый ответ службы поддержки. Верни ТОЛЬКО JSON следующего формата: { "priority": "medium", "category": "software", "ai_response": "Текст ответа" } `;
    const completion = await ai.chat.completions.create({
      model: "openrouter/owl-alpha",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Отвечай только валидным JSON без markdown, комментариев и пояснений.",
        },
        { role: "user", content: prompt },
      ],
    });
    const text = completion.choices[0].message.content ?? "";
    return extractJson(text);
  } catch (error) {
    console.error("AI Error:", error);
    return {
      priority: "medium",
      category: "other",
      ai_response:
        "Служба AI временно недоступна. Ваша заявка принята и будет рассмотрена специалистом.",
    };
  }
}
export async function generateDashboardAnalytics(stats: any) {
  try {
    const prompt = `
          Ты — senior продуктовый аналитик и эксперт по HelpDesk системам.

          Твоя задача — проанализировать статистику заявок и дать управленческие выводы, которые можно сразу использовать в работе команды поддержки.

          Вот данные:
          ${JSON.stringify(stats, null, 2)}

          ---

          Сформируй ответ строго по структуре:

          1) КЛЮЧЕВОЙ ИНСАЙТ
          - Опиши главное, что происходит в системе сейчас (1–2 предложения)
          - Укажи, есть ли перегрузка системы или отдельных направлений
          - Если есть аномалии (например, много high приоритетов) — обязательно укажи

          2) АНАЛИЗ ПРОБЛЕМНЫХ ОБЛАСТЕЙ
          - Какие категории или типы заявок создают больше всего нагрузки
          - Где возможен источник проблем (например: network или software)
          - Есть ли дисбаланс (например, много low заявок, но мало high или наоборот)
          - Если можно — укажи возможные причины (предположения допустимы)

          3) РЕКОМЕНДАЦИИ ДЛЯ КОМАНДЫ ПОДДЕРЖКИ
          Дай конкретные действия:
          - что нужно оптимизировать
          - что стоит автоматизировать
          - где нужно усилить команду или процесс
          - какие категории требуют внимания в первую очередь

          Формат: только список действий

          4) SLA И РИСКИ
          - Есть ли риск нарушения SLA
          - Есть ли просроченные заявки (если видно по данным)
          - Какие последствия это может вызвать
          - Что сделать прямо сейчас для снижения рисков

          ---

          ⚠️ ВАЖНО:
          - Пиши строго по делу
          - Без воды и общих фраз
          - Без Markdown
          - Не используй эмодзи
          - Между названием пункта и описанием не должно быть пустого пространства.
          - Максимум 3–4 абзацев суммарно
          `;

    const completion = await ai.chat.completions.create({
      model: "openrouter/owl-alpha",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "Ты опытный аналитик службы поддержки. Пиши кратко и профессионально.",
        },
        { role: "user", content: prompt },
      ],
    });
    return (
      completion.choices[0].message.content?.trim() ||
      "Нет данных для генерации аналитики."
    );
  } catch (error) {
    console.error("AI Error:", error);
    return "Служба AI временно недоступна. Проверьте API-ключ OpenRouter или повторите попытку позже.";
  }
}
