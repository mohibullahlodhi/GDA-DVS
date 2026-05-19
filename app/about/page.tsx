import Link from "next/link";
import { ArrowLeft, ShieldCheck, BadgeCheck, Building2, FileScan, LockKeyhole } from "lucide-react";
import { Footer } from "@/components/ui/footer";

const milestones = [
  {
    title: "Public verification",
    description:
      "Citizens can confirm the authenticity of government-issued documents without creating an account.",
  },
  {
    title: "Officer issuance",
    description:
      "Authorized staff generate barcode-authenticated documents through a controlled and traceable workflow.",
  },
  {
    title: "Auditability",
    description:
      "Each document is stamped with a unique identifier and stored for secure retrieval and verification.",
  },
];

const principles = [
  "Trusted issuance for official departments",
  "Barcode-backed verification with clear document identity",
  "Clean public access for transparent authentication",
  "Minimal, efficient, and maintainable user journeys",
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <section className="relative overflow-hidden px-6 py-16 text-white sm:py-20" style={{ background: 'linear-gradient(180deg, #0B1F33 0%, #091726 100%)' }}>
        <div className="absolute inset-0 opacity-28 [background-image:repeating-linear-gradient(45deg,rgba(255,255,255,0.05)_0_1px,transparent_1px_24px)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(201,168,76,0.24),transparent)]" />

        <div className="relative mx-auto max-w-5xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(201,168,76,0.26)] px-4 py-2 text-sm text-white/85 transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>

          <div className="mt-10 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent)]">
              About GDA-DVS
            </p>
            <h1 className="playfair-about mt-4 text-4xl font-bold leading-tight sm:text-6xl">
              Institutional trust for official document verification
            </h1>
            <p className="dmsans-about mt-5 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
              The Galiyat Development Authority Document Verification System
              is designed as a dependable civic platform for issuing,
              authenticating, and verifying official records. It brings together
              a controlled officer workflow and a simple public verification
              experience so institutions and citizens can rely on the same
              source of truth.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:py-20" style={{ background: 'linear-gradient(180deg, #F4F6F5 0%, #EEF2F0 100%)' }}>
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-[rgba(201,168,76,0.18)] bg-white p-8 shadow-sm sm:p-10">
            <div className="flex items-center gap-3 text-[var(--color-forest)]">
              <ShieldCheck size={20} />
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                System purpose
              </span>
            </div>
            <h2 className="playfair-about mt-4 text-3xl font-bold text-[var(--color-deep)] sm:text-4xl">
              Designed for accountability, clarity, and public trust
            </h2>
            <p className="dmsans-about mt-4 max-w-2xl text-sm leading-7 text-[var(--color-text-soft)] sm:text-[15px]">
              GDA-DVS standardizes how documents are issued and verified across
              departments. The platform keeps the interface direct and the
              workflow disciplined, reducing confusion while preserving the
              authority of the issuing institution.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {milestones.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[rgba(201,168,76,0.14)] bg-[#FFFFFF] p-5 transition hover:-translate-y-1 hover:border-[var(--color-accent)] hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #0B1F33, #1D4D3A)', color: '#fff' }}>
                    {item.title === "Public verification" ? (
                      <FileScan size={18} />
                    ) : item.title === "Officer issuance" ? (
                      <LockKeyhole size={18} />
                    ) : (
                      <BadgeCheck size={18} />
                    )}
                  </div>
                  <h3 className="dmsans-about mt-4 text-sm font-semibold text-[var(--color-deep)]">
                    {item.title}
                  </h3>
                  <p className="dmsans-about mt-2 text-sm leading-6 text-[var(--color-muted)]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-[rgba(201,168,76,0.14)] bg-[linear-gradient(180deg,#0B1F33,#091726)] p-8 text-white shadow-sm sm:p-10">
            <div className="flex items-center gap-3 text-[var(--color-accent)]">
              <Building2 size={20} />
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                Core principles
              </span>
            </div>
            <ul className="dmsans-about mt-6 space-y-4 text-sm leading-7 text-white/75">
              {principles.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-accent)]">
                Office note
              </p>
              <p className="dmsans-about mt-3 text-sm leading-7 text-white/75">
                This portal is intended for official use within the Gailayat
                Development Authority environment and for public verification of
                documents issued through authorized channels.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}
