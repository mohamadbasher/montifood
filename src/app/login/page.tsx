import Image from "next/image";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Image
            src="/logo.png"
            alt="MontiFood"
            width={120}
            height={120}
            priority
            className="mx-auto mb-4 h-28 w-28 rounded-3xl object-cover shadow-md"
          />
          <h1 className="text-2xl font-bold tracking-tight">מערכת הזמנות למסעדות</h1>
          <p className="mt-1 text-muted">התחברו כדי לבצע הזמנה</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          אין לך גישה? פנה ל-MontiFood לקבלת פרטי כניסה.
        </p>
        <p className="mt-1 text-center text-sm">
          <a href="mailto:montifood@rushdi.co.il" className="font-medium text-brand hover:underline" dir="ltr">
            montifood@rushdi.co.il
          </a>
        </p>
        <p className="mt-0.5 text-center text-sm">
          <a href="tel:+972527430074" className="font-medium text-brand hover:underline" dir="ltr">
            052-743-0074
          </a>
        </p>
      </div>
    </main>
  );
}
