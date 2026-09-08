import "server-only";

// The answer key lives only in this server-only module. Client code gets
// questions via getPublicQuestions(), which strips `correct` before it
// ever leaves the server — see (auth)/actions.ts's getPlacementQuestions.

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface PlacementQuestion {
  id: string;
  level: CefrLevel;
  prompt: string;
  options: string[];
  correct: number;
}

export interface PublicPlacementQuestion {
  id: string;
  prompt: string;
  options: string[];
}

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  { id: "q1", level: "A1", prompt: "My sister ___ two children.", options: ["have", "has", "having", "had"], correct: 1 },
  { id: "q2", level: "A1", prompt: "There ___ a book on the table.", options: ["is", "are", "be", "been"], correct: 0 },
  { id: "q3", level: "A1", prompt: "He usually ___ up at 7 a.m.", options: ["wake", "wakes", "woke", "waking"], correct: 1 },
  { id: "q4", level: "A1", prompt: "This soup is very ___.", options: ["delicious", "deliciously", "deliciousness", "delicious ly"], correct: 0 },

  { id: "q5", level: "A2", prompt: "I ___ my homework yesterday.", options: ["do", "did", "done", "doing"], correct: 1 },
  { id: "q6", level: "A2", prompt: "She is taller ___ her brother.", options: ["then", "than", "that", "this"], correct: 1 },
  { id: "q7", level: "A2", prompt: "If it rains, we ___ stay home.", options: ["will", "would", "are", "was"], correct: 0 },
  { id: "q8", level: "A2", prompt: "“Exhausted” means:", options: ["very tired", "very happy", "very angry", "very hungry"], correct: 0 },

  { id: "q9", level: "B1", prompt: "By the time we arrived, the movie ___ already started.", options: ["has", "have", "had", "having"], correct: 2 },
  { id: "q10", level: "B1", prompt: "I'm looking forward ___ you again.", options: ["to see", "to seeing", "seeing", "see"], correct: 1 },
  { id: "q11", level: "B1", prompt: "He suggested ___ a different route.", options: ["to take", "take", "taking", "took"], correct: 2 },
  { id: "q12", level: "B1", prompt: "“Reluctant” means:", options: ["unwilling", "excited", "confident", "careless"], correct: 0 },

  { id: "q13", level: "B2", prompt: "___ the heavy traffic, we arrived on time.", options: ["Despite", "Although", "Because", "So"], correct: 0 },
  { id: "q14", level: "B2", prompt: "I wish I ___ more time to prepare.", options: ["have", "had", "having", "has"], correct: 1 },
  { id: "q15", level: "B2", prompt: "The report needs to be ___ before Friday.", options: ["submit", "submitted", "submitting", "submits"], correct: 1 },
  { id: "q16", level: "B2", prompt: "“Meticulous” means:", options: ["very careful and precise", "very fast", "very lazy", "very generous"], correct: 0 },

  { id: "q17", level: "C1", prompt: "Had I known about the meeting, I ___ attended.", options: ["would have", "will have", "would", "had"], correct: 0 },
  { id: "q18", level: "C1", prompt: "Her argument was so ___ that no one could disagree.", options: ["compelling", "boring", "weak", "confusing"], correct: 0 },
];

export function getPublicQuestions(): PublicPlacementQuestion[] {
  return PLACEMENT_QUESTIONS.map(({ id, prompt, options }) => ({ id, prompt, options }));
}

/** A short, non-adaptive test — level follows total correct, not a
 * per-band breakdown. Good enough for a placement starting point; the
 * product already lets a student's level be edited later. */
export function scorePlacementTest(answers: Record<string, number>): {
  score: number;
  total: number;
  level: CefrLevel;
} {
  let score = 0;
  for (const question of PLACEMENT_QUESTIONS) {
    if (answers[question.id] === question.correct) score += 1;
  }
  const total = PLACEMENT_QUESTIONS.length;

  let level: CefrLevel;
  if (score <= 3) level = "A1";
  else if (score <= 7) level = "A2";
  else if (score <= 11) level = "B1";
  else if (score <= 15) level = "B2";
  else level = "C1";

  return { score, total, level };
}
