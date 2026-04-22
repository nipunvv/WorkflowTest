// Symptom catalog for Onboarding Step 2. Colocated with the screen; may be
// reused by Step 3 and the future persistence layer. IDs are kebab-case to
// match route-segment conventions and to map cleanly to database column values.

export type SymptomId =
  | 'dry-eyes'
  | 'dry-mouth'
  | 'joint-pain'
  | 'fatigue'
  | 'brain-fog'
  | 'neuropathy';

export type Symptom = {
  id: SymptomId;
  emoji: string;
  label: string; // visible title case ("Dry Eyes")
  accessibilityLabel: string; // emoji-free sentence case ("Dry eyes")
};

export const SYMPTOMS = [
  { id: 'dry-eyes', emoji: '👁', label: 'Dry Eyes', accessibilityLabel: 'Dry eyes' },
  { id: 'dry-mouth', emoji: '💧', label: 'Dry Mouth', accessibilityLabel: 'Dry mouth' },
  { id: 'joint-pain', emoji: '🦴', label: 'Joint Pain', accessibilityLabel: 'Joint pain' },
  { id: 'fatigue', emoji: '😴', label: 'Fatigue', accessibilityLabel: 'Fatigue' },
  { id: 'brain-fog', emoji: '🌫', label: 'Brain Fog', accessibilityLabel: 'Brain fog' },
  { id: 'neuropathy', emoji: '⚡', label: 'Neuropathy', accessibilityLabel: 'Neuropathy' },
] as const satisfies readonly Symptom[];
