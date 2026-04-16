import { GoogleGenAI, Type } from "@google/genai";

export async function categorizeTicketWithAI(
  title: string,
  description: string,
) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
    У нас есть система заявок (HelpDesk).
    Определи ПРИОРИТЕТ и КАТЕГОРИЮ для следующей заявки:
    Заголовок: "${title}"
    Описание: "${description}"

    Приоритет должен быть одним из: "low", "medium", "high".
    - high: срочно, авария, критическая ошибка, система лежит
    - medium: проблема мешает работе, но не блокирует ее полностью
    - low: запрос доступов, консультация, нет срочности

    Категория (Тегирование) должна быть одной из: "hardware", "network", "access_rights", "software", "billing", "consultation", "security", "other".
    - hardware: проблемы с оборудованием (ПК, принтер, монитор сломался)
    - network: нет интернета, недоступна сеть, обрыв связи, vpn
    - access_rights: доступ к папке, забыл пароль, сброс пароля, выдать права
    - software: ошибки в программах, установка ПО, 1С, Office
    - billing: вопросы по оплате, счетам, тарифным планам
    - consultation: общий вопрос, консультация по услугам
    - security: подозрение на вирус, фишинг, утечка данных, инцидент ИБ
    - other: другое (не подходит под остальные категории)

    Создай короткий вежливый ответ от лица саппорта для клиента (заготовленное сообщение об обработке заявки) в зависимости от приоритета и ситуации.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: {
              type: Type.STRING,
              description: "Приоритет: low, medium или high",
              enum: ["low", "medium", "high"],
            },
            category: {
              type: Type.STRING,
              description:
                "Категория: hardware, network, access_rights, software, billing, consultation, security, other",
              enum: [
                "hardware",
                "network",
                "access_rights",
                "software",
                "billing",
                "consultation",
                "security",
                "other",
              ],
            },
            ai_response: {
              type: Type.STRING,
              description: "Ответ службы поддержки пользователю",
            },
          },
          required: ["priority", "category", "ai_response"],
        },
      },
    });

    let rawText = (response.text || "").trim();
    if (rawText.startsWith("\`\`\`")) {
      rawText = rawText
        .replace(/^\`\`\`(?:json)?\n?/i, "")
        .replace(/\n?\`\`\`$/i, "")
        .trim();
    }
    return JSON.parse(rawText);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      priority: "medium",
      category: "other",
      ai_response: `(AI Error: ${errorMessage}) Спасибо за обращение. Мы рассмотрим вашу заявку.`,
    };
  }
}

export async function generateDashboardAnalytics(stats: any) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
    Ты - крутой продуктовый ИИ-аналитик. У нас есть HelpDesk система (система заявок).
    
    Вот текущая статистика по заявкам:
    ${JSON.stringify(stats, null, 2)}
    
    Дай мне:
    1) Краткий инсайт по нагрузке, распределению приоритетов и категориям.
    2) Рекомендацию для поддержки (на что обратить внимание, может быть проблема с какой-то конкретной категорией?).
    3) Краткий комментарий по SLA (если есть просроченные заявки).
    
    Пиши лаконично (не больше 3-4 абзацев), профессионально, но понятно. Избегай Markdown форматирования кроме жирного шрифта (**текст**).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text?.trim() || "Нет данных для генерации аналитики.";
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);
    return `Ошибка AI Аналитики: ${err}`;
  }
}
