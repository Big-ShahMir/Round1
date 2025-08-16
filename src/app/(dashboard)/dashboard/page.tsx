"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye, FileText } from "lucide-react"
import Link from "next/link"

const candidates = [
  {
    id: "1",
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    jobTitle: "Software Engineer",
    startedAt: "2023-06-23",
    overall: 88,
    status: "Passed",
    interviewId: "int-123",
  },
  {
    id: "2",
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    jobTitle: "Product Manager",
    startedAt: "2023-06-24",
    overall: 72,
    status: "Failed",
    interviewId: "int-124",
  },
  {
    id: "3",
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    jobTitle: "Software Engineer",
    startedAt: "2023-06-25",
    overall: 95,
    status: "Passed",
    interviewId: "int-125",
  },
  {
    id: "4",
    name: "William Kim",
    email: "will@email.com",
    jobTitle: "Data Scientist",
    startedAt: "2023-06-26",
    overall: 65,
    status: "Failed",
    interviewId: "int-126",
  },
  {
    id: "5",
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    jobTitle: "UX Designer",
    startedAt: "2023-06-27",
    overall: 81,
    status: "Passed",
    interviewId: "int-127",
  },
];

export default function Dashboard() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Interviews</CardTitle>
          <CardDescription>
            An overview of recent candidate interviews.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Job</TableHead>
                <TableHead className="text-center">Overall Score</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <div className="font-medium">{candidate.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {candidate.email}
                    </div>
                  </TableCell>
                  <TableCell>{candidate.jobTitle}</TableCell>
                  <TableCell className="text-center font-medium">{candidate.overall}%</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={candidate.status === "Passed" ? "default" : "destructive"}>
                      {candidate.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/interview/${candidate.interviewId}/report`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View Report</span>
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon">
                       <Link href="#">
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">View Profile</span>
                       </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
