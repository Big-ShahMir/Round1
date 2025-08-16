import { Logo } from "@/components/logo";
import { UserNav } from "@/components/user-nav";
import { Button } from "./ui/button";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 md:px-8">
        <Logo />
        <nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Dashboard
          </Link>
          <Link
            href="/jobs"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Jobs
          </Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <Button>Create New Job</Button>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
