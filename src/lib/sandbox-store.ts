import { useSyncExternalStore } from "react";
import type { CategoryId } from "./discovery";
import type { LatLng } from "./geo";
import { transition, type Commitment, type CommitmentAction, type Fulfilment } from "./commitments";
import { emptyWallet, hold, refund, release, topUp, type Wallet } from "./escrow";

/** Browser-only sandbox data. One typed store so Lovable Cloud can replace it later. */
export type IdStatus = "none" | "pending" | "verified";
export interface SandboxUser { name: string; email: string; avatar?: string | undefined; home?: LatLng | undefined; idStatus: IdStatus; idFileName?: string | undefined; onboarded: boolean }
export interface Storefront { name: string; category: CategoryId; position: LatLng; description: string }
export interface Offer { id: string; title: string; price: number; photo?: string | undefined; description: string; fulfilment: Fulfilment; schedule: string; paused: boolean; createdAt: number }
export interface Thread { id: string; producerId: string; producerName: string; createdAt: number }
export interface ChatMessage { id: string; threadId: string; from: "me" | "them" | "system"; at: number; text?: string | undefined; location?: { position: LatLng; label: string } | undefined; commitmentId?: string | undefined }
export interface SandboxState { user: SandboxUser | null; storefront: Storefront | null; offers: Offer[]; threads: Thread[]; messages: ChatMessage[]; commitments: Commitment[]; wallet: Wallet; likes: string[] }

export const STORE_KEY = "qpi.sandbox.v1";
const empty = (): SandboxState => ({ user: null, storefront: null, offers: [], threads: [], messages: [], commitments: [], wallet: emptyWallet(), likes: [] });
const SERVER_SNAPSHOT = empty();
let state: SandboxState | null = null;
const listeners = new Set<() => void>();

export function getState(): SandboxState {
  if (state) return state;
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  try { state = { ...empty(), ...(JSON.parse(localStorage.getItem(STORE_KEY) ?? "null") ?? {}) }; } catch { state = empty(); }
  return state!;
}
function setState(update: (s: SandboxState) => SandboxState) {
  state = update(getState());
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { throw new Error("Device storage is full — try a smaller photo."); }
  listeners.forEach(l => l());
}
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
export const useSandbox = () => useSyncExternalStore(subscribe, getState, () => SERVER_SNAPSHOT);

export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export function clearSandbox() { state = null; localStorage.removeItem(STORE_KEY); state = empty(); listeners.forEach(l => l()); }
export function createUser(name: string, email: string) {
  setState(s => ({ ...s, user: s.user && s.user.email === email ? { ...s.user, name } : { name, email, idStatus: "none", onboarded: false } }));
}
export function updateUser(patch: Partial<SandboxUser>) {
  setState(s => (s.user ? { ...s, user: { ...s.user, ...patch } as SandboxUser } : s));
}
export function saveStorefront(storefront: Storefront) { setState(s => ({ ...s, storefront })); }
export function saveOffer(offer: Offer) {
  setState(s => ({ ...s, offers: s.offers.some(o => o.id === offer.id) ? s.offers.map(o => (o.id === offer.id ? offer : o)) : [offer, ...s.offers] }));
}
export function deleteOffer(id: string) { setState(s => ({ ...s, offers: s.offers.filter(o => o.id !== id) })); }
export function topUpWallet(amount: number) { setState(s => ({ ...s, wallet: topUp(s.wallet, amount, Date.now()) })); }

export function openThread(producerId: string, producerName: string): string {
  const existing = getState().threads.find(t => t.producerId === producerId);
  if (existing) return existing.id;
  const thread: Thread = { id: newId("t"), producerId, producerName, createdAt: Date.now() };
  setState(s => ({ ...s, threads: [thread, ...s.threads], messages: [...s.messages, { id: newId("m"), threadId: thread.id, from: "them", at: Date.now(), text: `Hi! This is ${producerName}. How can we help?` }] }));
  return thread.id;
}
export function sendMessage(message: Omit<ChatMessage, "id" | "at">) {
  setState(s => ({ ...s, messages: [...s.messages, { ...message, id: newId("m"), at: Date.now() }] }));
}
export function proposeCommitment(input: Omit<Commitment, "id" | "status" | "createdAt" | "total">) {
  const now = Date.now();
  const c: Commitment = { ...input, id: newId("c"), status: "proposed", createdAt: now, total: Math.round(input.quantity * input.unitPrice * 100) / 100 };
  setState(s => ({ ...s, commitments: [c, ...s.commitments], messages: [...s.messages, { id: newId("m"), threadId: c.threadId, from: "me", at: now, commitmentId: c.id }] }));
  return c.id;
}

const actionNotes: Record<CommitmentAction["type"], string> = {
  accept: "Commitment accepted · funds held in escrow", decline: "Commitment declined", counter: "Counter offer sent",
  acceptCounter: "Counter accepted · funds held in escrow", deliver: "Marked as delivered", complete: "Completed · escrow released to seller",
  dispute: "Dispute raised · escrow frozen", resolve: "Dispute resolved · escrow released", escalate: "Dispute escalated · refunded to your wallet",
};
/** Applies a commitment transition together with its escrow effect, atomically. */
export function actOnCommitment(id: string, action: CommitmentAction) {
  setState(s => {
    const current = s.commitments.find(c => c.id === id);
    if (!current) throw new Error("Commitment not found.");
    const now = Date.now();
    const { next, escrow } = transition(current, action, now);
    const wallet = escrow === "hold" ? hold(s.wallet, id, next.total, now) : escrow === "release" ? release(s.wallet, id, now) : escrow === "refund" ? refund(s.wallet, id, now) : s.wallet;
    return { ...s, wallet, commitments: s.commitments.map(c => (c.id === id ? next : c)), messages: [...s.messages, { id: newId("m"), threadId: current.threadId, from: "system", at: now, text: actionNotes[action.type] }] };
  });
}

/** Pure like toggle: adds the id once, or removes it. */
export const toggledLikes = (likes: string[], id: string) => (likes.includes(id) ? likes.filter(l => l !== id) : [...likes, id]);
export function toggleLike(id: string) { setState(s => ({ ...s, likes: toggledLikes(s.likes ?? [], id) })); }
