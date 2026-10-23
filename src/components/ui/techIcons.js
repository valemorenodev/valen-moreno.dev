import {
  FaReact, FaAngular, FaHtml5, FaCss3Alt, FaNodeJs, FaDocker, FaGitAlt, FaLinux,
  FaNpm, FaFigma,
} from 'react-icons/fa'
import {
  SiTypescript, SiJavascript, SiVite, SiTailwindcss, SiReactquery,
  SiFramer, SiThreedotjs, SiExpress, SiNestjs, SiSpringboot, SiDotnet, SiDjango,
  SiGraphql, SiZod, SiJsonwebtokens, SiPostgresql, SiMysql, SiMongodb, SiRedis,
  SiVitest, SiJest, SiTestinglibrary, SiEslint, SiPrettier,
  SiSonar, SiGithubactions, SiVercel, SiNginx,
} from 'react-icons/si'
import {
  TbApi, TbChartDots, TbCloudLock, TbDatabase, TbFileCode,
  TbGauge, TbLayoutDashboard, TbPlugConnected, TbRefresh, TbRoute, TbSchema,
  TbSql, TbTargetArrow, TbUsersGroup, TbWand, TbWorldWww, TbGitMerge,
  TbPuzzle, TbTestPipe,
} from 'react-icons/tb'

/**
 * Un único mapa de iconos evita que cada componente decida cómo representar
 * una tecnología. Si un nombre no está aquí, se usa `FallbackIcon`.
 */
export const TECH_ICONS = {
  // Front-end
  React: FaReact,
  TypeScript: SiTypescript,
  JavaScript: SiJavascript,
  Angular: FaAngular,
  Vite: SiVite,
  'Tailwind CSS': SiTailwindcss,
  'TanStack Query': SiReactquery,
  Zustand: TbPuzzle,
  HTML5: FaHtml5,
  CSS3: FaCss3Alt,
  'Framer Motion': SiFramer,
  'Three.js': SiThreedotjs,

  // Back-end
  'Node.js': FaNodeJs,
  Express: SiExpress,
  NestJS: SiNestjs,
  'Spring Boot': SiSpringboot,
  '.NET Core': SiDotnet,
  Django: SiDjango,
  REST: TbApi,
  'REST API': TbApi,
  GraphQL: SiGraphql,
  Zod: SiZod,
  JWT: SiJsonwebtokens,

  // Datos
  PostgreSQL: SiPostgresql,
  MySQL: SiMysql,
  MongoDB: SiMongodb,
  Redis: SiRedis,
  SQL: TbSql,

  // Calidad
  Vitest: SiVitest,
  Jest: SiJest,
  'Testing Library': SiTestinglibrary,
  Playwright: TbTestPipe,
  ESLint: SiEslint,
  Prettier: SiPrettier,
  SonarQube: SiSonar,

  // DevOps
  Docker: FaDocker,
  Git: FaGitAlt,
  'GitHub Actions': SiGithubactions,
  Linux: FaLinux,
  Vercel: SiVercel,
  Nginx: SiNginx,

  // Metodología
  Scrum: TbRefresh,
  'Code Review': TbGitMerge,
  Testing: TbTargetArrow,
  'Accesibilidad (WCAG)': TbUsersGroup,
  'Core Web Vitals': TbGauge,
  'Design System': TbSchema,
}

/** Iconos para las tarjetas de servicios (campo `icon` del contenido). */
export const SERVICE_ICONS = {
  layout: TbLayoutDashboard,
  chart: TbChartDots,
  plug: TbPlugConnected,
  gauge: TbGauge,
  api: TbApi,
  code: TbFileCode,
  route: TbRoute,
  cloud: TbCloudLock,
  database: TbDatabase,
  world: TbWorldWww,
  wand: TbWand,
}

export const FallbackIcon = TbFileCode
