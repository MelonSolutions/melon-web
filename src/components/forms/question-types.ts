import {
  AlignLeft,
  Calendar,
  CheckSquare,
  CircleDot,
  Clock,
  Grid3x3,
  Hash,
  ListChecks,
  type LucideIcon,
  Mail,
  MapPin,
  Paperclip,
  Phone,
  SlidersHorizontal,
  TextCursorInput,
  TrendingUp,
} from 'lucide-react';
import type { Question, QuestionType } from '@/types/reports';

export interface QuestionTypeInfo {
  value: QuestionType;
  label: string;
  hint: string;
  icon: LucideIcon;
  group: 'Choice' | 'Text' | 'Scale & grid' | 'Date & time' | 'Field data';
}

/** Every type the API accepts, in the order the builder offers them. */
export const QUESTION_TYPES: QuestionTypeInfo[] = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple choice', hint: 'Pick one', icon: CircleDot, group: 'Choice' },
  { value: 'CHECKBOXES', label: 'Checkboxes', hint: 'Pick any', icon: CheckSquare, group: 'Choice' },
  { value: 'DROPDOWN', label: 'Dropdown', hint: 'Pick one from a long list', icon: ListChecks, group: 'Choice' },
  { value: 'SHORT_ANSWER', label: 'Short answer', hint: 'One line of text', icon: TextCursorInput, group: 'Text' },
  { value: 'PARAGRAPH', label: 'Paragraph', hint: 'Longer text', icon: AlignLeft, group: 'Text' },
  { value: 'NUMBER', label: 'Number', hint: 'Counts, amounts, ages', icon: Hash, group: 'Text' },
  { value: 'PHONE', label: 'Phone', hint: 'Phone number', icon: Phone, group: 'Text' },
  { value: 'EMAIL', label: 'Email', hint: 'Email address', icon: Mail, group: 'Text' },
  { value: 'LINEAR_SCALE', label: 'Linear scale', hint: 'Rate from low to high', icon: SlidersHorizontal, group: 'Scale & grid' },
  { value: 'MATRIX', label: 'Matrix / Likert', hint: 'Same scale for several rows', icon: Grid3x3, group: 'Scale & grid' },
  { value: 'DATE', label: 'Date', hint: 'Calendar date', icon: Calendar, group: 'Date & time' },
  { value: 'TIME', label: 'Time', hint: 'Time of day', icon: Clock, group: 'Date & time' },
  { value: 'GPS_LOCATION', label: 'GPS location', hint: 'Capture where the answer was given', icon: MapPin, group: 'Field data' },
  { value: 'FILE_UPLOAD', label: 'Photo / file', hint: 'Upload an image', icon: Paperclip, group: 'Field data' },
];

/** Impact metrics need a linked metric, which only existing questions carry. */
export const IMPACT_METRIC_TYPE: QuestionTypeInfo = {
  value: 'IMPACT_METRIC',
  label: 'Impact metric',
  hint: 'Linked to an impact metric',
  icon: TrendingUp,
  group: 'Field data',
};

export const typeInfo = (type: string): QuestionTypeInfo =>
  QUESTION_TYPES.find((t) => t.value === type.toUpperCase()) ??
  (type.toUpperCase() === 'IMPACT_METRIC' ? IMPACT_METRIC_TYPE : QUESTION_TYPES[3]);

export const CHOICE_TYPES: string[] = ['MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN'];
export const isChoiceType = (type: string) => CHOICE_TYPES.includes(type.toUpperCase());

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * Fill in what a type needs (options, scale ends, matrix rows) without
 * throwing away anything the question already has.
 */
export function withTypeDefaults(question: Question, type: QuestionType): Question {
  const next: Question = { ...question, type };
  if (isChoiceType(type) && !next.options?.length) next.options = ['', ''];
  if (type === 'LINEAR_SCALE') {
    next.settings = { min: 1, max: 5, ...next.settings };
  }
  if (type === 'MATRIX') {
    next.settings = {
      rows: ['', ''],
      columns: ['Poor', 'Fair', 'Good'],
      ...next.settings,
    };
  }
  return next;
}

export const newQuestion = (type: QuestionType = 'MULTIPLE_CHOICE'): Question =>
  withTypeDefaults({ id: newId(), type, title: '', description: '', required: false }, type);

export const duplicateOf = (question: Question): Question => ({
  ...JSON.parse(JSON.stringify(question)),
  id: newId(),
  title: question.title ? `${question.title} (copy)` : '',
});
