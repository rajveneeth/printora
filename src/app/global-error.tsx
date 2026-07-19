'use client';

export default function GlobalError({ reset }: { readonly reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main style={{ margin: '0 auto', maxWidth: 720, padding: '4rem 1.5rem' }}>
          <h1>Formivo is temporarily unavailable</h1>
          <p>The request did not complete. Please retry; no payment status is inferred here.</p>
          <button type="button" onClick={reset}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
