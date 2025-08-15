import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="absolute left-4 top-4 md:left-8 md:top-8">
        <Logo />
      </div>
      {children}
    </div>
  );
}
