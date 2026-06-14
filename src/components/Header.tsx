import Link from "next/link";
import Image from "next/image";
import { logoutAction } from "@/app/actions/auth";

export default function Header({
  subtitle,
  children,
}: {
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="MontiFood"
            width={40}
            height={40}
            className="h-10 w-10 rounded-xl object-cover"
            priority
          />
          <span className="leading-tight">
            <span className="block font-bold">MontiFood</span>
            {subtitle && <span className="block text-xs text-muted">{subtitle}</span>}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {children}
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-brand-light hover:text-brand-dark"
            >
              יציאה
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
