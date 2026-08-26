import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <main className="relative grid min-h-screen overflow-hidden bg-sidebar lg:grid-cols-[1.15fr_0.85fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden p-14 text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(31,205,194,.28),transparent_32%),radial-gradient(circle_at_78%_72%,rgba(57,171,224,.22),transparent_35%)]" />
        <div className="relative flex items-center gap-3 text-sm font-semibold tracking-[0.16em] uppercase">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            SI
          </span>
          Sales Intelligence
        </div>
        <div className="relative max-w-2xl">
          <p className="mb-5 text-sm font-semibold tracking-[0.24em] text-copilot-accent uppercase">
            Revenue clarity, every day
          </p>
          <h1 className="text-6xl leading-[1.02] font-semibold tracking-[-0.045em]">
            Turn pipeline into predictable performance.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-sidebar-muted">
            A focused command center for forecast, margin, seller execution and commercial risk.
          </p>
        </div>
        <p className="relative text-sm text-sidebar-muted">
          Synthetic demonstration environment · Multitenant by design
        </p>
      </div>
      <div className="flex items-center justify-center bg-background px-6 py-14">
        <LoginForm />
      </div>
    </main>
  );
}
