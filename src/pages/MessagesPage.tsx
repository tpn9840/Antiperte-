import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  MessageSquare,
  Plus,
  Reply,
  Search,
  Send,
} from 'lucide-react';
import {
  ADMIN_PARTICIPANT,
  FRANCHISE_PARTICIPANT,
  VISITOR_PARTICIPANT,
  appendReplyToConversation,
  filterVisibleConversations,
  getAvailableRecipients,
  getSubscriberParticipants,
  sendNewConversation,
} from '../services/storage';
import type {
  ConversationThread,
  MessageParticipant,
  MessageRole,
  StickerTag,
} from '../types/antiperte';

interface MessagesPageProps {
  tags: StickerTag[];
  conversations: ConversationThread[];
  onUpdateConversations: (next: ConversationThread[]) => void;
}

const ROLE_OPTIONS: { id: MessageRole; label: string }[] = [
  { id: 'visiteur', label: 'Visiteur' },
  { id: 'abonne', label: 'Abonné' },
  { id: 'franchise', label: 'Franchisé' },
  { id: 'admin', label: 'Admin' },
];

export const MessagesPage: React.FC<MessagesPageProps> = ({
  tags,
  conversations,
  onUpdateConversations,
}) => {
  const [role, setRole] = useState<MessageRole>('visiteur');
  const subscriberOptions = useMemo(
    () => getSubscriberParticipants(tags),
    [tags]
  );
  const [selectedSubscriberId, setSelectedSubscriberId] = useState<string>(
    subscriberOptions[0]?.id || 'abonne-AP-000001'
  );

  const currentActor: MessageParticipant = useMemo(() => {
    if (role === 'visiteur') return VISITOR_PARTICIPANT;
    if (role === 'franchise') return FRANCHISE_PARTICIPANT;
    if (role === 'admin') return ADMIN_PARTICIPANT;
    return (
      subscriberOptions.find((s) => s.id === selectedSubscriberId) ||
      subscriberOptions[0] || {
        id: 'abonne-local',
        name: 'Abonné',
        role: 'abonne',
        franchiseCode: 'BAF-001',
      }
    );
  }, [role, subscriberOptions, selectedSubscriberId]);

  const availableRecipients = useMemo(
    () => getAvailableRecipients(role, currentActor, tags),
    [role, currentActor, tags]
  );

  const visibleConversations = useMemo(
    () => filterVisibleConversations(conversations, role, currentActor.id),
    [conversations, role, currentActor.id]
  );

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [threadSearch, setThreadSearch] = useState('');
  const [sentNotice, setSentNotice] = useState<string | null>(null);
  const [recipientId, setRecipientId] = useState<string>(
    availableRecipients[0]?.id || ADMIN_PARTICIPANT.id
  );
  const [newMessageText, setNewMessageText] = useState('');
  const [replyText, setReplyText] = useState('');

  const filteredConversations = useMemo(() => {
    const q = threadSearch.trim().toLowerCase();
    if (!q) return visibleConversations;
    return visibleConversations.filter(
      (t) =>
        t.participants.some((p) => p.name.toLowerCase().includes(q)) ||
        t.messages.some((m) => m.text.toLowerCase().includes(q))
    );
  }, [visibleConversations, threadSearch]);

  const selectedThread = useMemo(
    () => visibleConversations.find((t) => t.id === selectedThreadId) || null,
    [visibleConversations, selectedThreadId]
  );

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedThread?.id, selectedThread?.messages.length]);

  const handleRoleChange = (nextRole: MessageRole) => {
    setRole(nextRole);
    setSelectedThreadId(null);
    setIsComposing(false);
    const nextActor =
      nextRole === 'visiteur'
        ? VISITOR_PARTICIPANT
        : nextRole === 'franchise'
          ? FRANCHISE_PARTICIPANT
          : nextRole === 'admin'
            ? ADMIN_PARTICIPANT
            : subscriberOptions[0] || VISITOR_PARTICIPANT;
    const nextRecipients = getAvailableRecipients(nextRole, nextActor, tags);
    setRecipientId(nextRecipients[0]?.id || ADMIN_PARTICIPANT.id);
  };

  const handleOpenNewMessage = () => {
    setIsComposing(true);
    setSelectedThreadId(null);
    if (!availableRecipients.some((r) => r.id === recipientId)) {
      setRecipientId(availableRecipients[0]?.id || '');
    }
  };

  const handleSendNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;
    const recipient =
      availableRecipients.find((r) => r.id === recipientId) ||
      availableRecipients[0];
    if (!recipient) return;

    const { nextThreads, createdThread } = sendNewConversation(
      conversations,
      currentActor,
      recipient,
      newMessageText
    );
    onUpdateConversations(nextThreads);
    setNewMessageText('');
    setIsComposing(false);
    setSelectedThreadId(createdThread.id);
    setSentNotice('Message envoyé.');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !replyText.trim()) return;
    const nextThreads = appendReplyToConversation(
      conversations,
      selectedThread.id,
      currentActor,
      replyText
    );
    onUpdateConversations(nextThreads);
    setReplyText('');
    setSentNotice('Réponse envoyée.');
  };

  const getRoleRuleHint = () => {
    if (role === 'visiteur') {
      return 'En tant que Visiteur, vous pouvez écrire à Admin.';
    }
    if (role === 'abonne') {
      return 'En tant qu’Abonné, vous pouvez écrire à Admin et à votre Franchisé.';
    }
    if (role === 'franchise') {
      return 'En tant que Franchisé, vous pouvez écrire à Admin et à vos Abonnés.';
    }
    return 'En tant qu’Admin, vous voyez toutes les conversations et pouvez écrire à tout le monde.';
  };

  return (
    <div className="space-y-5">
      {/* En-tête Messagerie + Sélecteur de profil */}
      <section className="rounded-3xl bg-white p-5 sm:p-6 border border-neutral-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D32F2F] text-white">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold text-neutral-950">
                Messagerie interne
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600">
                {getRoleRuleHint()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenNewMessage}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-[#D32F2F] px-5 py-2.5 text-sm sm:text-base font-extrabold text-white transition-colors hover:bg-[#B71C1C] cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="h-5 w-5 shrink-0" />
            <span>Nouveau message</span>
          </button>
        </div>

        {/* Sélecteur de rôle */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-neutral-200">
          <div className="grid grid-cols-4 gap-1.5 bg-neutral-100 p-1 rounded-xl flex-1 max-w-lg">
            {ROLE_OPTIONS.map((opt) => {
              const active = role === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleRoleChange(opt.id)}
                  className={`min-h-[40px] rounded-lg px-2 py-1.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-neutral-950 text-white shadow-sm'
                      : 'text-neutral-700 hover:text-neutral-950'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {role === 'abonne' && subscriberOptions.length > 0 && (
            <select
              aria-label="Choisir mon profil abonné"
              value={currentActor.id}
              onChange={(e) => {
                setSelectedSubscriberId(e.target.value);
                setSelectedThreadId(null);
              }}
              className="min-h-[42px] rounded-xl border border-neutral-300 bg-white px-3 text-xs sm:text-sm font-bold text-neutral-950 focus:border-[#D32F2F] focus:outline-none"
            >
              {subscriberOptions.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {sentNotice && (
          <div
            role="status"
            className="flex items-center justify-between gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs sm:text-sm font-bold text-emerald-900"
          >
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              {sentNotice}
            </span>
            <button
              type="button"
              onClick={() => setSentNotice(null)}
              className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
            >
              Fermer
            </button>
          </div>
        )}
      </section>

      {/* Corps : Liste des conversations + Fil ou Nouveau message */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:items-start">
        {/* Liste des conversations */}
        <section
          className={`lg:col-span-5 rounded-3xl bg-white border border-neutral-200 shadow-sm overflow-hidden ${
            selectedThread || isComposing ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="px-5 py-4 border-b border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-neutral-950">
                Liste des conversations
              </h2>
              <span className="text-xs font-mono-code font-bold text-neutral-600">
                {filteredConversations.length}
              </span>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                aria-label="Rechercher une conversation"
                value={threadSearch}
                onChange={(e) => setThreadSearch(e.target.value)}
                placeholder="Rechercher une conversation..."
                className="w-full min-h-[40px] rounded-xl border border-neutral-300 bg-white pl-9 pr-3 text-xs sm:text-sm text-neutral-950 placeholder:text-neutral-400 focus:border-[#D32F2F] focus:outline-none"
              />
            </div>
          </div>

          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm font-bold text-neutral-700">
                Aucune conversation trouvée pour ce profil.
              </p>
              <button
                type="button"
                onClick={handleOpenNewMessage}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-neutral-200 px-4 py-2 text-sm font-bold text-neutral-950 hover:bg-neutral-300 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Nouveau message</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {filteredConversations.map((thread) => {
                const lastMsg = thread.messages[thread.messages.length - 1];
                const isSelected = selectedThreadId === thread.id && !isComposing;
                const otherParty =
                  thread.participants.find((p) => p.id !== currentActor.id) ||
                  thread.participants[0];

                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => {
                      setIsComposing(false);
                      setSelectedThreadId(thread.id);
                    }}
                    className={`w-full text-left p-4 transition-colors cursor-pointer ${
                      isSelected ? 'bg-red-50/70' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-extrabold text-neutral-950 truncate">
                        {role === 'admin'
                          ? thread.participants.map((p) => p.name).join(' ↔ ')
                          : otherParty?.name}
                      </p>
                      <span className="text-[11px] font-mono-code text-neutral-500 shrink-0">
                        {new Date(thread.updatedAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-neutral-600 truncate">
                      {lastMsg?.text}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Zone droite : Formulaire Nouveau message OU Fil de discussion */}
        <section
          className={`lg:col-span-7 rounded-3xl bg-white border border-neutral-200 shadow-sm p-5 sm:p-6 ${
            !selectedThread && !isComposing ? 'hidden lg:block' : 'block'
          }`}
        >
          {isComposing ? (
            <form onSubmit={handleSendNew} className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-extrabold text-neutral-950">
                  Nouveau message
                </h2>
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="min-h-[40px] rounded-xl bg-neutral-200 px-3.5 py-1.5 text-xs font-bold text-neutral-950 hover:bg-neutral-300 cursor-pointer"
                >
                  Annuler
                </button>
              </div>

              <div>
                <label
                  htmlFor="msg-recipient"
                  className="block text-sm font-bold text-neutral-950 mb-1.5"
                >
                  Destinataire
                </label>
                <select
                  id="msg-recipient"
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  className="w-full min-h-[50px] rounded-xl border border-neutral-300 bg-white px-4 text-sm sm:text-base font-semibold text-neutral-950 focus:border-[#D32F2F] focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/25"
                >
                  {availableRecipients.map((recipient) => (
                    <option key={recipient.id} value={recipient.id}>
                      {recipient.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="msg-body"
                  className="block text-sm font-bold text-neutral-950 mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="msg-body"
                  rows={4}
                  required
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Écrivez votre message ici..."
                  className="w-full rounded-xl border border-neutral-300 bg-white p-4 text-base text-neutral-950 placeholder:text-neutral-400 focus:border-[#D32F2F] focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/25"
                />
              </div>

              <button
                type="submit"
                className="flex w-full min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-[#D32F2F] px-6 py-3.5 text-base font-extrabold text-white transition-colors hover:bg-[#B71C1C] cursor-pointer"
              >
                <Send className="h-5 w-5 shrink-0" />
                <span>Envoyer</span>
              </button>
            </form>
          ) : selectedThread ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-neutral-200">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelectedThreadId(null)}
                    className="lg:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-200 text-neutral-950 cursor-pointer"
                    aria-label="Retour aux conversations"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-extrabold text-neutral-950 truncate">
                      {selectedThread.participants.map((p) => p.name).join(' ↔ ')}
                    </h2>
                    <p className="text-xs text-neutral-500 truncate">
                      {selectedThread.messages.length} message
                      {selectedThread.messages.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages du fil */}
              <div className="max-h-[340px] overflow-y-auto space-y-3 pr-1">
                {selectedThread.messages.map((msg) => {
                  const isMine = msg.senderId === currentActor.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isMine ? 'items-end' : 'items-start'
                      }`}
                    >
                      <span className="text-[11px] font-bold text-neutral-500 mb-1">
                        {msg.senderName} ·{' '}
                        {new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          isMine
                            ? 'bg-neutral-950 text-white'
                            : 'bg-neutral-100 text-neutral-950 border border-neutral-200'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Formulaire Répondre */}
              <form
                onSubmit={handleSendReply}
                className="pt-3 border-t border-neutral-200 space-y-3"
              >
                <label
                  htmlFor="reply-input"
                  className="block text-xs font-bold text-neutral-700"
                >
                  Répondre
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    id="reply-input"
                    type="text"
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Écrire une réponse..."
                    className="flex-1 min-h-[48px] rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-950 placeholder:text-neutral-400 focus:border-[#D32F2F] focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/25"
                  />
                  <button
                    type="submit"
                    className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#D32F2F] px-5 py-2.5 text-sm font-extrabold text-white transition-colors hover:bg-[#B71C1C] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Reply className="h-4 w-4 shrink-0" />
                    <span>Répondre</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <MessageSquare className="mx-auto h-10 w-10 text-neutral-400" />
              <p className="text-base font-bold text-neutral-950">
                Sélectionnez une conversation ou envoyez un nouveau message
              </p>
              <button
                type="button"
                onClick={handleOpenNewMessage}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-[#D32F2F] px-5 py-2.5 text-sm font-extrabold text-white hover:bg-[#B71C1C] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Nouveau message</span>
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
