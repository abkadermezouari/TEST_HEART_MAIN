"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { saveQuizResultAction } from "../_actions/quiz.action";
import type { QuizData } from "@/lib/queries/quiz";

interface QuizClientProps {
  quiz: QuizData;
  articleSlug: string;
  previousResult: { score: number; max_score: number; completed_at: string } | null;
}

export function QuizClient({ quiz, articleSlug, previousResult }: QuizClientProps) {
  const questions = quiz.quiz_questions;
  const maxScore = questions.length;

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<"answering" | "reviewing">(
    previousResult ? "reviewing" : "answering"
  );
  const [score, setScore] = useState(previousResult?.score ?? 0);
  const [isPending, startTransition] = useTransition();

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  function handleSubmit() {
    const computed = questions.reduce(
      (acc, q) => (answers[q.id] === q.correct_answer ? acc + 1 : acc),
      0
    );
    setScore(computed);
    setPhase("reviewing");
    startTransition(() => { void saveQuizResultAction(quiz.id, computed, maxScore); });
  }

  function handleRetry() {
    setAnswers({});
    setScore(0);
    setPhase("answering");
  }

  /* ── Phase résultat ──────────────────────────────────────────── */
  if (phase === "reviewing") {
    const scoreRing =
      percentage >= 80
        ? "text-emerald-700 bg-emerald-100"
        : percentage >= 50
        ? "text-yellow-700 bg-yellow-100"
        : "text-[#ae2f34] bg-[#ae2f34]/10";

    return (
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Score */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#bec8c9] p-8 text-center">
          <div
            className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-2xl font-black mb-4 ${scoreRing}`}
          >
            {percentage}%
          </div>
          <h2 className="text-2xl font-bold text-[#181c1d] mb-1">
            {score}&nbsp;/&nbsp;{maxScore}&nbsp;bonne{score > 1 ? "s" : ""}&nbsp;réponse
            {score > 1 ? "s" : ""}
          </h2>
          <p className="text-sm text-[#6f797a]">
            {percentage === 100
              ? "Parfait ! Vous maîtrisez ce sujet."
              : percentage >= 80
              ? "Très bien ! Continuez comme ça."
              : percentage >= 50
              ? "Pas mal — relisez les points faibles."
              : "Relisez l'article avant de réessayer."}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-5 py-2.5 border border-[#bec8c9] text-[#181c1d] rounded-full text-sm font-semibold hover:bg-[#f1f4f4] transition-colors"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
              Réessayer
            </button>
            <Link
              href={`/learn/${articleSlug}`}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#004f54] text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Retour à l&apos;article
            </Link>
          </div>
        </div>

        {/* Correction */}
        <h3 className="text-lg font-bold text-[#181c1d]">Correction</h3>
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const chosen = answers[q.id];
            const isCorrect = chosen === q.correct_answer;
            return (
              <div
                key={q.id}
                className="bg-white rounded-xl border border-[#bec8c9] p-5 shadow-sm"
              >
                <p className="font-semibold text-[#181c1d] mb-3">
                  {idx + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {(q.options as string[]).map((opt, i) => {
                    const isChosen = chosen === i;
                    const isCorrectOpt = i === q.correct_answer;
                    const cls = isCorrectOpt
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                      : isChosen && !isCorrectOpt
                      ? "border-[#ae2f34] bg-[#ae2f34]/5 text-[#ae2f34]"
                      : "border-[#bec8c9] text-[#6f797a]";
                    return (
                      <div
                        key={i}
                        className={`px-4 py-2.5 rounded-lg border-2 text-sm flex items-center justify-between ${cls}`}
                      >
                        <span>{opt}</span>
                        {isCorrectOpt && (
                          <span
                            className="material-symbols-outlined text-emerald-600 text-base"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check_circle
                          </span>
                        )}
                        {isChosen && !isCorrectOpt && (
                          <span
                            className="material-symbols-outlined text-[#ae2f34] text-base"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            cancel
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {q.explanation && !isCorrect && (
                  <p className="mt-3 text-xs text-[#6f797a] bg-[#f1f4f4] rounded-lg px-3 py-2">
                    <span className="font-semibold">Explication&nbsp;: </span>
                    {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Phase réponse ───────────────────────────────────────────── */
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#181c1d]">{quiz.title}</h1>
        <span className="text-sm text-[#6f797a]">
          {answeredCount}&nbsp;/&nbsp;{maxScore}&nbsp;répondu{answeredCount > 1 ? "s" : ""}
        </span>
      </div>

      {/* Barre de progression */}
      <div className="h-1.5 w-full bg-[#e0e3e3] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#004f54] rounded-full transition-all duration-300"
          style={{ width: `${Math.round((answeredCount / maxScore) * 100)}%` }}
        />
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white rounded-xl border border-[#bec8c9] p-5 shadow-sm"
          >
            <p className="font-semibold text-[#181c1d] mb-4">
              {idx + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {(q.options as string[]).map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 text-sm transition-colors ${
                    answers[q.id] === i
                      ? "border-[#004f54] bg-[#004f54]/5 text-[#004f54] font-semibold"
                      : "border-[#bec8c9] hover:border-[#004f54]/40 text-[#3f4949]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href={`/learn/${articleSlug}`}
          className="flex items-center gap-1 text-sm text-[#6f797a] hover:text-[#181c1d] font-semibold"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Retour à l&apos;article
        </Link>
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || isPending}
          className="bg-[#004f54] text-white px-8 py-3 rounded-full text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isPending ? "Enregistrement…" : "Valider mes réponses"}
        </button>
      </div>
    </div>
  );
}
