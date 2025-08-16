import { Suspense } from "react";
import InterviewRoom from "@/components/InterviewRoom";

export default function NewInterviewPage() {
  return (
    <Suspense fallback={<div>Loading interview...</div>}>
      <InterviewRoom />
    </Suspense>
  );
}