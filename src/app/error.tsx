"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main" className="page grid min-h-screen place-items-center py-16 text-center">
      <div>
        <h1 className="text-2xl font-bold">حدث خطأ غير متوقع</h1>
        <p className="mt-2 text-ink-soft">نعتذر عن ذلك، يمكنك إعادة المحاولة.</p>
        <button type="button" className="btn btn-primary mt-6" onClick={() => reset()}>
          إعادة المحاولة
        </button>
      </div>
    </main>
  );
}
