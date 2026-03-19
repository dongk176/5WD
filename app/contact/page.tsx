import SiteHeader from "@/components/SiteHeader";
import { socialLinks } from "@/lib/social-links";
import { submitContactInquiry } from "./actions";

type ContactPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ContactPage(props: ContactPageProps) {
  const searchParams = (await props.searchParams) ?? {};
  const isSent = searchParams.sent === "1";

  return (
    <div className="min-h-screen bg-background-light text-charcoal">
      <SiteHeader active="contact" />

      <main className="mx-auto max-w-7xl px-6 pt-28 pb-20">
        <section className="py-16 md:py-24">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">
            <div>
              <h1 className="mb-10 text-5xl font-bold tracking-tight uppercase md:text-6xl">Contact</h1>

              <div className="space-y-10">
                <div>
                  <div>
                    <p className="mb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">이메일</p>
                    <p className="text-xl font-bold tracking-tighter md:text-2xl">band5wheeldrive@gmail.com</p>
                  </div>
                </div>

                <div>
                  <div>
                    <p className="mb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">전화번호</p>
                    <p className="text-xl font-bold tracking-tighter md:text-2xl">010-3581-8879</p>
                  </div>
                </div>

                <div>
                  <p className="mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase">SNS</p>
                  <div className="overflow-x-auto pb-1">
                    <div className="flex min-w-max flex-nowrap items-center gap-6">
                      {socialLinks.map((social) => (
                        <a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={social.label}
                          className="shrink-0 opacity-80 transition-all hover:scale-105 hover:opacity-100"
                        >
                          <img src={social.icon} alt={social.label} className="h-9 w-9 object-contain md:h-11 md:w-11" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 bg-white p-8 md:p-12">
              {isSent && (
                <p className="mb-6 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  문의가 정상적으로 접수되었습니다.
                </p>
              )}
              <form action={submitContactInquiry} className="space-y-8">
                <div>
                  <label className="mb-2 block text-sm font-bold tracking-widest text-primary uppercase">
                    Name / Company <span className="align-middle text-[10px] text-slate-400">(required)</span>
                  </label>
                  <input
                    required
                    name="nameCompany"
                    className="w-full border-0 border-b border-primary/30 bg-transparent p-2 focus:border-primary focus:ring-0"
                    type="text"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold tracking-widest text-primary uppercase">
                    Email <span className="align-middle text-[10px] text-slate-400">(required)</span>
                  </label>
                  <input
                    required
                    name="email"
                    className="w-full border-0 border-b border-primary/30 bg-transparent p-2 focus:border-primary focus:ring-0"
                    type="email"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold tracking-widest text-primary uppercase">
                    Message <span className="align-middle text-[10px] text-slate-400">(required)</span>
                  </label>
                  <textarea
                    required
                    name="message"
                    className="w-full border-0 border-b border-primary/30 bg-transparent p-2 focus:border-primary focus:ring-0"
                    rows={4}
                  />
                </div>

                <button
                  className="bg-primary px-12 py-4 text-xs font-bold tracking-widest text-white uppercase transition-all hover:bg-primary/90"
                  type="submit"
                >
                  Send Inquiry
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
