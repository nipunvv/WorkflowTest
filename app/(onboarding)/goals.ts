// Goal catalog for Onboarding Step 2 (issue #10). Colocated with the screen;
// may be reused by Step 3/4 and the future persistence layer. IDs are
// kebab-case to match route-segment conventions and to map cleanly to
// database column values.
//
// "Other" is intentionally NOT in this catalog — its state shape (boolean
// toggle + free-text input) differs from the preset goals, and folding it in
// would force every consumer to special-case it. The Step 2 screen renders
// it as a sixth row inline.

export type GoalId =
  | 'find-symptom-triggers'
  | 'improve-energy'
  | 'understand-protocol'
  | 'capture-everything'
  | 'coordinate-care-team';

export type Goal = {
  id: GoalId;
  emoji: string;
  label: string;
};

export const GOALS = [
  { id: 'find-symptom-triggers', emoji: '🔍', label: 'Find my symptom triggers' },
  { id: 'improve-energy', emoji: '⚡', label: 'Improve my daily energy' },
  { id: 'understand-protocol', emoji: '📋', label: 'Understand my protocol' },
  { id: 'capture-everything', emoji: '📊', label: 'Capture everything in one place' },
  { id: 'coordinate-care-team', emoji: '🤝', label: 'Coordinate with my care team' },
] as const satisfies readonly Goal[];
