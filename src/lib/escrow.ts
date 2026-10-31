/** Sandbox wallet and escrow rules. Pure functions: every call returns a new wallet. */
export type LedgerKind = "topup" | "hold" | "release" | "refund";
export interface LedgerEntry { id: string; kind: LedgerKind; amount: number; at: number; commitmentId?: string | undefined; note: string }
export interface Wallet { balance: number; holds: Record<string, number>; ledger: LedgerEntry[] }

export const STARTING_BALANCE = 50000;
export const emptyWallet = (): Wallet => ({ balance: STARTING_BALANCE, holds: {}, ledger: [] });
export const heldTotal = (wallet: Wallet) => Object.values(wallet.holds).reduce((sum, value) => sum + value, 0);
const round = (value: number) => Math.round(value * 100) / 100;

function assertAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Amount must be positive.");
}
const entry = (kind: LedgerKind, amount: number, at: number, note: string, commitmentId?: string): LedgerEntry => ({ id: `${kind}-${at}-${Math.round(amount * 100)}-${commitmentId ?? "wallet"}`, kind, amount: round(amount), at, commitmentId, note });

export function topUp(wallet: Wallet, amount: number, at: number): Wallet {
  assertAmount(amount);
  return { ...wallet, balance: round(wallet.balance + amount), ledger: [entry("topup", amount, at, "Sandbox top-up"), ...wallet.ledger] };
}

/** Moves funds from the spendable balance into escrow for one commitment. */
export function hold(wallet: Wallet, commitmentId: string, amount: number, at: number): Wallet {
  assertAmount(amount);
  if (wallet.holds[commitmentId] !== undefined) throw new Error("Funds are already held for this commitment.");
  if (amount > wallet.balance) throw new Error("Insufficient sandbox balance.");
  return { balance: round(wallet.balance - amount), holds: { ...wallet.holds, [commitmentId]: round(amount) }, ledger: [entry("hold", amount, at, "Held in escrow", commitmentId), ...wallet.ledger] };
}

function settle(wallet: Wallet, commitmentId: string, at: number, kind: "release" | "refund"): Wallet {
  const amount = wallet.holds[commitmentId];
  if (amount === undefined) throw new Error("No escrow hold for this commitment.");
  const { [commitmentId]: _removed, ...holds } = wallet.holds;
  return {
    balance: kind === "refund" ? round(wallet.balance + amount) : wallet.balance,
    holds,
    ledger: [entry(kind, amount, at, kind === "refund" ? "Refunded to wallet" : "Released to seller", commitmentId), ...wallet.ledger],
  };
}
/** Pays the seller; the buyer's balance is unchanged because funds already left at hold time. */
export const release = (wallet: Wallet, commitmentId: string, at: number) => settle(wallet, commitmentId, at, "release");
export const refund = (wallet: Wallet, commitmentId: string, at: number) => settle(wallet, commitmentId, at, "refund");
