import type { FieldDef } from './schema';

// Field configs for the two structural OKR tables (Objectives, Key Results).
// Deliberately not merged into schema.ts's SCHEMAS/TABLIST/DATA_TAB_TYPES —
// these are nested inside one OKR tab, not their own sidebar tabs, since
// they're rarely-edited structure rather than day-to-day operational records.

export const OBJECTIVE_FIELDS: FieldDef[] = [
  { key: 'title', label: 'Objective Title', type: 'text' },
  { key: 'weight_pct', label: 'Objective Weight (%)', type: 'number' },
  { key: 'sort_order', label: 'Sort Order', type: 'number' },
];

export const KEY_RESULT_FIELDS: FieldDef[] = [
  { key: 'objective_id', label: 'Objective', type: 'objective' },
  { key: 'title', label: 'Key Result Title', type: 'text' },
  { key: 'weight_pct', label: 'KR Weight (%)', type: 'number' },
  { key: 'target_general', label: 'Target — General/Operational', type: 'textarea' },
  { key: 'target_challenge', label: 'Target — Challenge/Innovation', type: 'textarea' },
  { key: 'sort_order', label: 'Sort Order', type: 'number' },
];
