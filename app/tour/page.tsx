import SiteHeader from "@/components/SiteHeader";
import { prisma } from "@/lib/db";
import { socialLinks } from "@/lib/social-links";

export const revalidate = 600;

function formatDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}월 ${day}, ${year}`;
}

function formatDay(date: Date): string {
  return date.toLocaleDateString("ko-KR", { weekday: "long" });
}

export default async function TourPage() {
  const tourRows = await prisma.tourEvent.findMany({
    orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="relative flex min-h-screen flex-col bg-background-light font-display text-charcoal antialiased">
      <SiteHeader active="tour" />

      <main className="flex-grow pt-24">
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-12">
          <div className="max-w-3xl">
            <h2 className="page-reveal page-delay-1 mb-6 text-5xl font-black tracking-tight md:text-7xl">Tour</h2>
          </div>
        </section>

        <section className="page-reveal page-delay-2 mx-auto mb-8 max-w-6xl px-6">
          <div className="flex gap-8 border-b border-slate-200">
            <button className="border-b-2 border-primary pb-4 text-sm font-bold tracking-widest uppercase" type="button">
              Upcoming Dates
            </button>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-32">
          <div className="space-y-0 md:hidden">
            {tourRows.map((row, index) => (
              <div
                key={row.id}
                className="page-reveal group flex flex-col items-start justify-between border-b border-slate-100 px-4 py-10 transition-colors hover:bg-slate-50"
                style={{ animationDelay: `${220 + index * 45}ms` }}
              >
                <div className="mb-4 flex flex-col gap-1">
                  <span className="text-xs tracking-widest text-slate-400 uppercase">{formatDate(row.eventDate)}</span>
                  <h3 className="text-xl font-medium tracking-tight">{row.eventName}</h3>
                </div>
                <div className="mb-6 flex flex-col gap-1">
                  <span className="text-sm font-light text-slate-500">{row.eventTime}</span>
                  <span className="text-sm font-light text-slate-500">{row.location}</span>
                  <span className="text-[11px] tracking-wider text-slate-400 uppercase">{formatDay(row.eventDate)}</span>
                </div>
                {row.isSoldOut ? (
                  <button
                    className="cursor-not-allowed border border-slate-200 bg-transparent px-8 py-3 text-xs tracking-widest text-slate-400 uppercase"
                    type="button"
                  >
                    Sold Out
                  </button>
                ) : row.ticketUrl ? (
                  <a
                    href={row.ticketUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-charcoal bg-transparent px-8 py-3 text-xs tracking-widest uppercase transition-all hover:bg-charcoal hover:text-white"
                  >
                    Tickets
                  </a>
                ) : (
                  <button
                    className="cursor-not-allowed border border-slate-200 bg-transparent px-8 py-3 text-xs tracking-widest text-slate-400 uppercase"
                    type="button"
                  >
                    Open Soon
                  </button>
                )}
              </div>
            ))}
            {tourRows.length === 0 && <p className="px-4 py-12 text-sm text-slate-400">등록된 공연 일정이 없습니다.</p>}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                  <th className="px-4 py-6">Date</th>
                  <th className="px-4 py-6">Show / Venue</th>
                  <th className="px-4 py-6">Time</th>
                  <th className="px-4 py-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tourRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="page-reveal group transition-colors hover:bg-slate-50"
                    style={{ animationDelay: `${230 + index * 45}ms` }}
                  >
                    <td className="px-4 py-8">
                      <div className="text-sm font-bold">{formatDate(row.eventDate).toUpperCase()}</div>
                      <div className="text-[11px] tracking-wider text-slate-400 uppercase">{formatDay(row.eventDate)}</div>
                    </td>
                    <td className="px-4 py-8">
                      <div className="text-lg font-medium">{row.eventName}</div>
                      <div className="text-sm text-slate-500">{row.location}</div>
                    </td>
                    <td className="px-4 py-8">
                      <div className="text-slate-500">{row.eventTime}</div>
                    </td>
                    <td className="px-4 py-8 text-right">
                      {row.isSoldOut ? (
                        <span className="inline-block cursor-not-allowed rounded-full border border-slate-200 px-6 py-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
                          Sold Out
                        </span>
                      ) : row.ticketUrl ? (
                        <a
                          href={row.ticketUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2 text-xs font-bold tracking-widest text-white uppercase transition-all hover:bg-primary/90"
                        >
                          Tickets
                        </a>
                      ) : (
                        <span className="inline-block rounded-full bg-primary/10 px-6 py-2 text-xs font-bold tracking-widest text-primary uppercase">
                          Open Soon
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {tourRows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-16 text-center text-sm text-slate-400">
                      등록된 공연 일정이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">© 2026 5WD. All Rights Reserved.</p>
          <div className="flex items-center gap-5">
            {socialLinks.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label}>
                <img src={social.icon} alt={social.label} className="h-8 w-8 object-contain opacity-80 transition hover:opacity-100" />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
