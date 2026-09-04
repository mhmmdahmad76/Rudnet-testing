"use client";

import * as React from "react";

const QUOTES = [
  {
    quote:
      "I finally understood the difference between “since” and “for” — three months of confusion, gone in one lesson.",
    name: "Yousef, B1",
  },
  {
    quote: "The quizzes made me actually remember the grammar instead of just recognizing it.",
    name: "Rania, C1",
  },
];

/**
 * A rotating lesson quote on the auth brand panel. SSR and first paint
 * always show QUOTES[0] — a random index would differ between the server
 * render and the client's own render of the same lazy initializer, causing
 * a hydration mismatch. The random pick happens after mount instead, once
 * there's no server output left to disagree with.
 */
function AuthQuote() {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: picking randomly during render/SSR would mismatch the client's own random pick at hydration.
    setIndex(Math.floor(Math.random() * QUOTES.length));
  }, []);

  const quote = QUOTES[index]!;

  return (
    <blockquote className="flex flex-col gap-3 text-fg-on-brand">
      <p className="t-h3">&ldquo;{quote.quote}&rdquo;</p>
      <cite className="t-body-sm text-fg-on-brand/70 not-italic">— {quote.name}</cite>
    </blockquote>
  );
}

export { AuthQuote };
