import SiteHeader from "@/components/SiteHeader";
import { prisma } from "@/lib/db";
import { socialLinks } from "@/lib/social-links";
import { resolveAssetUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const [teamConfig, membersRaw] = await Promise.all([
    prisma.teamConfig.findUnique({ where: { id: 1 } }),
    prisma.teamMember.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      take: 6,
    }),
  ]);

  const heroUrl = (await resolveAssetUrl(teamConfig?.heroAsset)) || "/team/main.png";
  const members = await Promise.all(
    membersRaw.map(async (member) => ({
      ...member,
      photoUrl: await resolveAssetUrl(member.photoAsset),
    })),
  );

  return (
    <div className="min-h-screen bg-background-light text-charcoal">
      <SiteHeader active="team" />

      <main className="mx-auto w-full max-w-7xl px-6 pt-28 pb-16">
        <div className="mb-24 grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <h1 className="page-reveal page-delay-1 mb-8 text-5xl font-black leading-tight tracking-tighter text-charcoal md:text-7xl">
              5WD 오륜구동
            </h1>
            <div className="page-reveal page-delay-2 mb-8 max-w-2xl space-y-5 text-lg leading-9 font-medium text-slate-700 md:text-xl md:leading-10">
              <p>
                오륜구동이라는 이름은 밴드 멤버들이 함께 회의를 하러 가던 차 안에서 시작됐습니다. 차 에어컨에 달린 바퀴
                모양 키링을 보다가 ‘사륜구동’이라는 말이 떠올랐고, 당시 다섯 명이었던 우리는 자연스럽게 ‘오륜구동’이라는
                이름을 붙이게 됐습니다.
              </p>
              <p>
                이 이름에는 다섯 명이 함께 팀을 굴리고 움직인다는 뜻이 담겨 있습니다. 지금은 한 명이 더 합류해 6인조가
                되었지만, 오륜구동이라는 이름이 가진 의미는 여전히 같습니다. 한 사람의 힘이 아니라, 모든 멤버가 함께
                움직일 때 가장 잘 굴러가는 팀. 오륜구동은 그런 밴드입니다.
              </p>
            </div>
            <div className="page-reveal page-delay-3 mb-8 h-1 w-16 bg-primary" />
          </div>

          <div className="order-1 lg:order-2">
            <div className="page-reveal page-delay-2 aspect-[4/5] overflow-hidden bg-slate-200">
              <img alt="Team main image" className="h-full w-full object-cover" src={heroUrl} />
            </div>
          </div>
        </div>

        <section className="py-24">
          <div className="mb-12 flex items-end justify-between">
            <h3 className="page-reveal page-delay-4 text-4xl font-bold tracking-tight text-charcoal">Personnel</h3>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {members.map((member, index) => (
              <div key={member.id} className="page-reveal group" style={{ animationDelay: `${260 + index * 55}ms` }}>
                {member.profileUrl ? (
                  <a href={member.profileUrl} target="_blank" rel="noreferrer" className="block cursor-pointer">
                    <div className="mb-6 aspect-square overflow-hidden bg-slate-100">
                      <img
                        alt={`${member.name} portrait`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={member.photoUrl}
                      />
                    </div>
                    <h4 className="mb-1 text-xl font-bold text-charcoal">{member.name}</h4>
                    <p className="font-medium text-slate-500">{member.part}</p>
                    {member.description && (
                      <p className="mt-2 text-sm leading-6 text-slate-600 whitespace-pre-wrap">{member.description}</p>
                    )}
                  </a>
                ) : (
                  <div>
                    <div className="mb-6 aspect-square overflow-hidden bg-slate-100">
                      <img
                        alt={`${member.name} portrait`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={member.photoUrl}
                      />
                    </div>
                    <h4 className="mb-1 text-xl font-bold text-charcoal">{member.name}</h4>
                    <p className="font-medium text-slate-500">{member.part}</p>
                    {member.description && (
                      <p className="mt-2 text-sm leading-6 text-slate-600 whitespace-pre-wrap">{member.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            {members.length === 0 && <p className="text-sm text-slate-500">등록된 멤버가 없습니다.</p>}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 px-6 py-12 md:px-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-sm text-slate-500">© 2024 Official Archive. All Rights Reserved.</div>
          <div className="flex items-center gap-6">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="shrink-0 opacity-80 transition-all hover:scale-105 hover:opacity-100"
              >
                <img src={social.icon} alt={social.label} className="h-8 w-8 object-contain" />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
