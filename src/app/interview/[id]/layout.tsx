import { Logo } from "@/components/logo";

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-8">
        <Logo />
        <p className="text-sm text-muted-foreground">Job: Software Engineer</p>
      </header>
      <main className="flex-1 p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
