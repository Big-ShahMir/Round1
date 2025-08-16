import { Suspense } from "react";
import AIInterviewRoom from "@/components/AIInterviewRoom";

export default function NewInterviewPage() {
  return (
    <Suspense fallback={<div>Loading AI interview...</div>}>
      <AIInterviewRoom />
    </Suspense>
  );
}