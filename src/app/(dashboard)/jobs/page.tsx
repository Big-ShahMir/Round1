import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"

const jobs = [
  {
    id: "job-1",
    title: "Software Engineer, Frontend",
    team: "Web Platform",
    description: "Build and maintain our next-generation web applications.",
    skills: ["React", "TypeScript", "Next.js", "GraphQL"],
  },
  {
    id: "job-2",
    title: "Product Manager",
    team: "Core Products",
    description: "Define the future of our core product offerings.",
    skills: ["Product Strategy", "Agile", "User Research"],
  },
  {
    id: "job-3",
    title: "Data Scientist",
    team: "AI & Machine Learning",
    description: "Develop models to solve complex business problems.",
    skills: ["Python", "TensorFlow", "PyTorch", "SQL"],
  },
  {
    id: "job-4",
    title: "UX Designer",
    team: "Design System",
    description: "Create intuitive and beautiful user experiences.",
    skills: ["Figma", "User-centered Design", "Prototyping"],
  },
];

export default function JobsPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Available Jobs</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <Card key={job.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{job.title}</CardTitle>
              <CardDescription>{job.team}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">{job.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/interview/new?jobId=${job.id}`}>Start Interview</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  )
}
