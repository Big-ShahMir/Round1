import { TestTube2 } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <TestTube2 className="h-6 w-6 text-accent" />
      <h1 className="text-lg font-bold text-foreground">Round1</h1>
    </Link>
  );
}
