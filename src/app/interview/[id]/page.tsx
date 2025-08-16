"use client"

import { useSearchParams } from 'next/navigation';
import InterviewRoom from "@/components/InterviewRoom";

export default function InterviewPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  
  // Extract job details from URL parameters to pass to InterviewRoom
  const jobDetails = {
    id: params.id,
    title: searchParams.get('jobTitle') || 'Software Engineer',
    company: searchParams.get('company') || 'Tech Company',
    location: searchParams.get('location') || 'Remote',
    salary: searchParams.get('salary') || '$80,000 - $120,000',
    description: searchParams.get('description') || 'We are looking for a talented software engineer...',
    requirements: searchParams.get('requirements') || 'JavaScript, React, Node.js'
  };

  return <InterviewRoom jobDetails={jobDetails} />;
}