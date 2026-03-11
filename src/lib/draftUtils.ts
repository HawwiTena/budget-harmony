import { BudgetLineItem, BudgetCategory } from "@/types/budget";

const DRAFT_KEY = "budget_draft_v1";

export interface BudgetDraft {
  title: string;
  fiscalYear: string;
  lineItems: BudgetLineItem[];
  activeTab: BudgetCategory;
  savedAt: string;
}

export function saveDraft(draft: BudgetDraft): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // localStorage full or unavailable
  }
}

export function loadDraft(): BudgetDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BudgetDraft;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

export function hasDraft(): boolean {
  return !!localStorage.getItem(DRAFT_KEY);
}
