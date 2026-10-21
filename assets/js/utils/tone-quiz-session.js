function shuffle(items, random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Draw evenly across tones and avoid repeating a character within a round.
export function createToneRound(bank, count = 10, random = Math.random) {
  const tones = [...new Set(bank.map(question => question.tone))];
  const groups = new Map(tones.map(tone => [tone, shuffle(bank.filter(question => question.tone === tone), random)]));
  const questions = [];
  while (questions.length < Math.min(count, bank.length)) {
    for (const tone of shuffle(tones, random)) {
      const question = groups.get(tone).pop();
      if (question) questions.push(question);
      if (questions.length === count) break;
    }
  }
  return shuffle(questions, random);
}

export class ToneQuizSession {
  constructor(questions) {
    this.questions = questions;
    this.index = 0;
    this.answers = [];
    this.heard = false;
  }
  get current() { return this.questions[this.index]; }
  get answered() { return this.answers.length > this.index; }
  get complete() { return this.index >= this.questions.length; }
  get score() { return this.answers.filter(answer => answer.correct).length; }
  markHeard() { if (!this.complete) this.heard = true; }
  answer(tone) {
    if (this.complete || !this.heard || this.answered || !Number.isInteger(tone)) return null;
    const result = { question: this.current, chosen: tone, correct: tone === this.current.tone };
    this.answers.push(result);
    return result;
  }
  next() {
    if (!this.answered) return false;
    this.index++;
    this.heard = false;
    return true;
  }
}
