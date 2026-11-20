/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Answer rules shared by the public survey pages: what counts as answered,
 * what is invalid, and the shape sent to the API.
 *
 * Shapes the API, analytics and Excel export already read:
 * - checkboxes: one string, options joined with ", "
 * - matrix: { [row]: column } object
 * - GPS: { lat, lng, accuracy?, capturedAt? } object
 * - "Others": "- Others: <text>"
 */

export const OTHERS = '- Others';

export interface FormQuestion {
  id: string;
  type: string;
  title: string;
  description?: string;
  required: boolean;
  options?: any[];
  impactMetricId?: string;
  settings?: any;
}

const isOthers = (v: any) => !!v && typeof v === 'object' && v.option === OTHERS;

/** Matrix rows and columns: settings first, then the legacy options: [rows, cols] shape. */
export function matrixAxes(question: FormQuestion): { rows: string[]; columns: string[] } {
  if (question.settings?.rows && question.settings?.columns) {
    return { rows: question.settings.rows, columns: question.settings.columns };
  }
  if (Array.isArray(question.options) && Array.isArray(question.options[0])) {
    return { rows: question.options[0] ?? [], columns: question.options[1] ?? [] };
  }
  return { rows: [], columns: [] };
}

export function isAnswered(question: FormQuestion, answer: any): boolean {
  if (answer === undefined || answer === null || answer === '') return false;
  if (typeof answer === 'number') return !Number.isNaN(answer);
  if (Array.isArray(answer)) return answer.length > 0;
  if (question.type.toUpperCase() === 'MATRIX') return Object.keys(answer).length > 0;
  return true;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+]?[\d\s\-().]{7,20}$/;

/** The message to show under a question, or null when the answer is fine. */
export function validateAnswer(question: FormQuestion, answer: any): string | null {
  const type = question.type.toUpperCase();

  if (!isAnswered(question, answer)) {
    if (!question.required) return null;
    if (type === 'CHECKBOXES') return 'Select at least one option.';
    if (type === 'GPS_LOCATION') return 'Capture the location before submitting.';
    if (type === 'FILE_UPLOAD') return 'Upload a file before submitting.';
    return 'This question needs an answer.';
  }

  if (isOthers(answer) && !answer.customText?.trim()) return 'Type your answer for "Others".';
  if (Array.isArray(answer)) {
    const others = answer.find(isOthers);
    if (others && !others.customText?.trim()) return 'Type your answer for "Others".';
  }

  if (type === 'MATRIX' && question.required) {
    const missing = matrixAxes(question).rows.filter((row) => !answer[row]);
    if (missing.length) {
      return missing.length === 1 ? `Answer the row "${missing[0]}".` : `Answer all ${missing.length} remaining rows.`;
    }
  }

  if (type === 'EMAIL' && !EMAIL.test(String(answer))) return 'Enter a valid email address.';
  if (type === 'PHONE' && !PHONE.test(String(answer))) return 'Enter a valid phone number.';

  if (type === 'NUMBER') {
    const n = Number(answer);
    if (Number.isNaN(n)) return 'Enter a number.';
    const { min, max } = question.settings ?? {};
    if (typeof min === 'number' && n < min) return `Enter ${min} or more.`;
    if (typeof max === 'number' && n > max) return `Enter ${max} or less.`;
  }

  return null;
}

/** One entry of the submit payload, or null for an unanswered question. */
export function formatAnswer(question: FormQuestion, answer: any) {
  if (!isAnswered(question, answer)) return null;
  const type = question.type.toUpperCase();

  if (type === 'IMPACT_METRIC') {
    return {
      questionId: question.id,
      impactMetricId: question.impactMetricId,
      actualValue: typeof answer === 'number' ? answer : parseFloat(answer) || 0,
    };
  }

  const others = (v: any) => (isOthers(v) ? `${OTHERS}: ${v.customText?.trim() ?? ''}` : v);

  if (Array.isArray(answer)) {
    return { questionId: question.id, answer: answer.map(others).join(', ') };
  }
  if (isOthers(answer)) {
    return { questionId: question.id, answer: others(answer) };
  }
  if (typeof answer === 'object') {
    return { questionId: question.id, answer };
  }
  return { questionId: question.id, answer: String(answer) };
}

/** Rough minutes to complete: long or physical questions take longer. */
export function estimateMinutes(questions: FormQuestion[]): number {
  const slow = new Set(['PARAGRAPH', 'MATRIX', 'GPS_LOCATION', 'FILE_UPLOAD']);
  const seconds = questions.reduce((total, q) => total + (slow.has(q.type.toUpperCase()) ? 60 : 25), 0);
  return Math.max(1, Math.round(seconds / 60));
}
