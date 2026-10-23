import { ArrowUp, Mail } from 'lucide-react'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { useTranslation } from '../../i18n/LanguageProvider.jsx'
import { useSmoothScroll } from '../../hooks/useSmoothScroll.js'
import { NAV_SECTIONS, sectionHref } from '../../data/sections.js'

export default function Footer() {
  const { t } = useTranslation()
  const { scrollTo } = useSmoothScroll()
  const year = new Date().getFullYear()

  const socials = [
    { id: 'github', href: t.contact.github, label: t.contact.githubLabel, Icon: FaGithub },
    { id: 'linkedin', href: t.contact.linkedin, label: t.contact.linkedinLabel, Icon: FaLinkedin },
    { id: 'mail', href: `mailto:${t.contact.email}`, label: t.contact.emailLabel, Icon: Mail },
  ]

  return (
    <footer id="pie" className="relative border-t border-line/70 bg-abyss">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <a href={sectionHref('inicio')} className="flex items-center gap-2.5 font-display text-base font-bold text-ink">
              <span className="grid size-8 place-items-center rounded-lg border border-violet/40 bg-violet/10 font-mono text-xs text-violet">
                VM
              </span>
              Valentina Moreno
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">{t.footer.tagline}</p>
            <p className="mt-2 font-mono text-xs text-ink-dim">{t.footer.location}</p>
          </div>

          <nav aria-label={t.footer.navTitle}>
            <h3 className="font-mono text-[0.68rem] tracking-wider text-ink-dim uppercase">
              {t.footer.navTitle}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {NAV_SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={sectionHref(section.id)}
                    className="text-sm text-ink-soft transition-colors hover:text-violet"
                  >
                    {t.nav[section.navKey]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="font-mono text-[0.68rem] tracking-wider text-ink-dim uppercase">
              {t.footer.socialTitle}
            </h3>
            <ul className="mt-4 flex gap-2">
              {socials.map((social) => (
                <li key={social.id}>
                  <a
                    href={social.href}
                    aria-label={social.label}
                    title={social.label}
                    {...(social.id !== 'mail' ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
                    className="grid size-10 place-items-center rounded-xl border border-line bg-surface/70 text-ink-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-violet/40 hover:text-violet"
                  >
                    <social.Icon aria-hidden="true" className="size-4" />
                  </a>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => scrollTo('#inicio')}
              className="mt-5 inline-flex items-center gap-2 font-mono text-xs text-ink-dim transition-colors hover:text-violet"
            >
              <ArrowUp aria-hidden="true" className="size-3.5" />
              {t.ui.backToTop}
            </button>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line/60 pt-6 text-xs text-ink-dim sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Valentina Moreno. {t.footer.rights}
          </p>
          <p className="font-mono">{t.footer.builtWith}</p>
        </div>
      </div>
    </footer>
  )
}
