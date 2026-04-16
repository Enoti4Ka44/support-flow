import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketApi } from '../api/tickets';
import { categorizeTicketWithAI } from '../api/ai';

export function CreateTicketForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    
    setLoading(true);
    setError(null);

    try {
      const aiResult = await categorizeTicketWithAI(title, description);

      await ticketApi.create({ 
        title, 
        description,
        priority: aiResult.priority,
        category: aiResult.category,
        ai_response: aiResult.ai_response 
      });
      navigate('/tickets');
    } catch {
      setError('Не удалось создать заявку. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  const templates = [
    { title: 'Не работает интернет', desc: 'Пропал интернет, не могу подключиться к сети' },
    { title: 'Забыл пароль', desc: 'Забыл пароль от рабочей почты, прошу сбросить' },
    { title: 'Нужен новый ПК', desc: 'Мой компьютер сильно тормозит, прошу заменить' },
    { title: 'Ошибка доступа к 1С', desc: 'При входе в 1С выдает ошибку "нет прав доступа"' },
    { title: 'Ошибка при оплате', desc: 'Клиент не может оплатить счет, выдает сбой шлюза' },
    { title: 'Подозрение на вирус', desc: 'На рабочем столе появились странные файлы и компьютер зависает' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <p className="text-[13px] text-text-secondary mb-3">Быстрые шаблоны:</p>
        <div className="flex flex-wrap gap-2">
          {templates.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setTitle(t.title); setDescription(t.desc); }}
              className="px-3 py-1.5 bg-black/20 hover:bg-white/5 border border-border-dark rounded-lg text-[13px] text-text-secondary transition-colors"
            >
              {t.title}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[13px] font-medium text-text-secondary mb-2">Заголовок</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 bg-black/20 border border-border-dark outline-none rounded-lg focus:border-accent transition-all text-[14px]"
            placeholder="Кратко опишите проблему"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-text-secondary mb-2">Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            className="w-full px-4 py-3 bg-black/20 border border-border-dark outline-none rounded-lg focus:border-accent transition-all resize-none text-[14px]"
            placeholder="Подробно опишите что случилось"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !title.trim() || !description.trim()}
          className="w-full btn-primary py-3 text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Создаём заявку и анализируем...' : '🚀 Отправить'}
        </button>
      </form>
    </div>
  );
}
