import { useEffect, useState } from 'react';
import { chatService, ChatMessage } from '../services/chat.service';

export default function ChatPage() {
  const [items, setItems] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => {
    try {
      setItems(await chatService.myMessages());
    } catch {
      /* empty */
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      setSending(true);
      const msg = await chatService.sendMyMessage(text.trim());
      setItems((prev) => [...prev, msg]);
      setText('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Support</h1>
      <div className="border rounded-lg p-3 bg-white h-[60vh] overflow-auto space-y-2">
        {items.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] p-2 rounded ${
              m.direction === 'USER'
                ? 'bg-sand self-end ml-auto'
                : 'bg-gray-100'
            }`}
          >
            <div className="text-sm whitespace-pre-wrap">{m.body}</div>
            <div className="text-[10px] text-gray-500 mt-1">
              {new Date(m.createdAt).toLocaleString('fr-FR')}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-gray-500 text-sm">
            Aucun message pour l’instant.
          </div>
        )}
      </div>

      <form onSubmit={send} className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Écris ton message…"
        />
        <button
          className="px-4 py-2 bg-black text-white rounded"
          disabled={sending || !text.trim()}
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
