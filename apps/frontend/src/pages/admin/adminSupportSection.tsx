import { useEffect, useState } from 'react';
import AccordionSection from '../../components/accordionSection';
import {
  chatService,
  ConversationDTO,
  ChatMessage,
} from '../../services/chat.service';

export default function AdminSupportSection() {
  const [convs, setConvs] = useState<ConversationDTO[]>([]);
  const [active, setActive] = useState<ConversationDTO | null>(null);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');

  const loadConvs = async () => {
    try {
      setConvs(await chatService.listConversations());
    } catch (e) {
      console.error('Erreur loadConvs', e);
    }
  };

  const loadMsgs = async (id: string) => {
    try {
      setMsgs(await chatService.listMessages(id));
    } catch (e) {
      console.error('Erreur loadMsgs', e);
    }
  };

  useEffect(() => {
    loadConvs();
  }, []);

  useEffect(() => {
    if (!active) return;
    loadMsgs(active.id);
    const id = setInterval(() => loadMsgs(active.id), 6000);
    return () => clearInterval(id);
  }, [active]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || !text.trim()) return;
    try {
      const m = await chatService.reply(active.id, text.trim());
      setMsgs((prev) => [...prev, m]);
      setText('');
      await loadConvs();
    } catch {
      alert("Impossible d'envoyer la réponse.");
    }
  };

  const displayName = (c: ConversationDTO) =>
    c.user?.name ||
    c.contactName ||
    c.user?.email ||
    c.contactEmail ||
    'Invité';

  const displayEmail = (c: ConversationDTO) =>
    c.user?.email || c.contactEmail || null;

  return (
    <AccordionSection title="Support (Chat)">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Liste des conversations */}
        <div className="border rounded p-2 bg-white">
          <div className="text-sm font-semibold mb-2">Conversations</div>
          <div className="space-y-1 max-h-[60vh] overflow-auto">
            {convs.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c)}
                className={`w-full text-left p-2 rounded ${
                  active?.id === c.id ? 'bg-sand' : 'hover:bg-gray-50'
                }`}
              >
                <div className="text-sm font-medium">{displayName(c)}</div>
                {displayEmail(c) && (
                  <div className="text-xs text-gray-600">{displayEmail(c)}</div>
                )}
                <div className="text-xs text-gray-500">
                  MAJ {new Date(c.updatedAt).toLocaleString('fr-FR')}
                </div>
              </button>
            ))}
            {!convs.length && (
              <div className="text-gray-500 text-sm">Aucune conversation.</div>
            )}
          </div>
        </div>

        {/* Messages de la conversation */}
        <div className="md:col-span-2 border rounded p-2 bg-white flex flex-col">
          {active ? (
            <>
              <div className="text-sm font-semibold mb-2">
                {displayName(active)}
                {displayEmail(active) && (
                  <span className="ml-2 text-gray-600 font-normal">
                    ({displayEmail(active)})
                  </span>
                )}
              </div>

              <div className="flex-1 border rounded p-3 bg-gray-50 overflow-auto space-y-2">
                {msgs.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[80%] p-2 rounded ${
                      m.direction === 'ADMIN'
                        ? 'bg-sand self-end ml-auto'
                        : 'bg-white'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{m.body}</div>
                    <div className="text-[10px] text-gray-500 mt-1">
                      {new Date(m.createdAt).toLocaleString('fr-FR')}
                    </div>
                  </div>
                ))}
                {!msgs.length && (
                  <div className="text-gray-500 text-sm">
                    Pas encore de messages.
                  </div>
                )}
              </div>

              <form onSubmit={send} className="mt-2 flex gap-2">
                <input
                  className="flex-1 border rounded px-3 py-2"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Répondre…"
                />
                <button
                  className="px-4 py-2 bg-black text-white rounded"
                  disabled={!text.trim()}
                >
                  Envoyer
                </button>
              </form>
            </>
          ) : (
            <div className="text-gray-500 text-sm p-3">
              Sélectionne une conversation à gauche.
            </div>
          )}
        </div>
      </div>
    </AccordionSection>
  );
}
