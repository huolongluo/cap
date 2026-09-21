import { Suspense } from "react";
import { Pitch } from "@/components/Pitch";

export default function PitchPage() {
  return (
    <Suspense fallback={<p className="wrap muted">Loading pitch…</p>}>
      <Pitch />
    </Suspense>
  );
}
