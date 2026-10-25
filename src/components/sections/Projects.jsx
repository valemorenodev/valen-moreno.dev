import { useTranslation } from '../../i18n/LanguageProvider.jsx'
import SectionShell from '../ui/SectionShell.jsx'
import Reveal from '../ui/Reveal.jsx'
import TiltCard from '../ui/TiltCard.jsx'
import CaseStudyCard from '../ui/CaseStudyCard.jsx'
import BadJokes from '../../assets/BadJokes.png'
import Cripto from '../../assets/Cripto.png'
import RickAndMorty from '../../assets/Rick&Morty.png'
import ToDo from '../../assets/ToDo.png'

const PROJECT_IMAGES = {
  cripto: Cripto,
  rickandmorty: RickAndMorty,
  todo: ToDo,
  badjokes: BadJokes,
}

export default function Projects() {
  const { t } = useTranslation()
  const { labels } = t.projects

  const featured = t.projects.items.filter((project) => project.featured)
  const secondary = t.projects.items.filter((project) => !project.featured)
  
 console.log('Idioma actual:', t?.projects);
console.log('Items de proyectos:', t?.projects?.items);

if (!Array.isArray(t?.projects?.items)) {
  console.error(
    'La traducción projects.items no existe o no es un array.',
    t?.projects?.items,
  );
}
 
const hasPlaceholders = Array.isArray(t?.projects?.items)
  && t.projects.items.some(
    (project) =>
      typeof project?.result === 'string' &&
      /^\[.*\]$/.test(project.result.trim()),
  );

  return (
    <SectionShell
      id="proyectos"
      eyebrow={t.projects.eyebrow}
      title={t.projects.title}
      subtitle={t.projects.subtitle}
    >
      {/* --- Proyectos destacados --- */}
      <div className="mt-12 space-y-8">
        {featured.map((project, index) => (
          <Reveal key={project.id} delay={0.06 * index} amount={0.15}>
            <TiltCard tiltMaxAngle={3} glare={false} scale={1.006}>
              <CaseStudyCard
                project={project}
                labels={labels}
                image={PROJECT_IMAGES[project.id]}
                featured
              />
            </TiltCard>
          </Reveal>
        ))}
      </div>

      {/* --- Otros proyectos --- */}
      {secondary.length > 0 && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {secondary.map((project, index) => (
            <Reveal key={project.id} delay={0.06 * index} amount={0.15} className="h-full">
              <TiltCard className="h-full" tiltMaxAngle={5}>
                <CaseStudyCard
                  project={project}
                  labels={labels}
                  image={PROJECT_IMAGES[project.id]}
                />
              </TiltCard>
            </Reveal>
          ))}
        </div>
      )}

      {hasPlaceholders && (
        <Reveal delay={0.1}>
          <p className="mt-10 rounded-xl border border-dashed border-amber/35 bg-amber/5 px-5 py-4 text-sm text-ink-soft">
            <span className="font-mono text-[0.7rem] tracking-wider text-amber uppercase">
              {labels.placeholderNote}
            </span>{' '}
            {t.projects.placeholderHelp}
          </p>
        </Reveal>
      )}
    </SectionShell>
  )
}
