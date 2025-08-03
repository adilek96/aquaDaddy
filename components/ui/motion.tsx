"use client";

import dynamic from "next/dynamic";
import { ComponentType } from "react";

// Динамические импорты для framer-motion
export const motion = {
  div: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.div })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  span: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.span })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  button: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.button })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  img: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.img })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  svg: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.svg })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  path: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.path })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  circle: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.circle })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  rect: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.rect })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  g: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.g })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  line: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.line })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  polygon: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.polygon })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  polyline: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.polyline })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  ellipse: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.ellipse })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  defs: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.defs })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  stop: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.stop })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  linearGradient: dynamic(
    () =>
      import("framer-motion").then((mod) => ({
        default: mod.motion.linearGradient,
      })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  radialGradient: dynamic(
    () =>
      import("framer-motion").then((mod) => ({
        default: mod.motion.radialGradient,
      })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  foreignObject: dynamic(
    () =>
      import("framer-motion").then((mod) => ({
        default: mod.motion.foreignObject,
      })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  clipPath: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.clipPath })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  feGaussianBlur: dynamic(
    () =>
      import("framer-motion").then((mod) => ({
        default: mod.motion.feGaussianBlur,
      })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  feOffset: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.feOffset })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  feBlend: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.feBlend })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  feColorMatrix: dynamic(
    () =>
      import("framer-motion").then((mod) => ({
        default: mod.motion.feColorMatrix,
      })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  feComposite: dynamic(
    () =>
      import("framer-motion").then((mod) => ({
        default: mod.motion.feComposite,
      })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  feConvolveMatrix: dynamic(
    () =>
      import("framer-motion").then((mod) => ({
        default: mod.motion.feConvolveMatrix,
      })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  feDiffuseLighting: dynamic(
    () =>
      import("framer-motion").then((mod) => ({
        default: mod.motion.feDiffuseLighting,
      })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  feDisplacementMap: dynamic(
    () =>
      import("framer-motion").then((mod) => ({
        default: mod.motion.feDisplacementMap,
      })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  feDistantLight: dynamic(
    () =>
      import("framer-motion").then((mod) => ({
        default: mod.motion.feDistantLight,
      })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  feDropShadow: dynamic(
    () =>
      import("framer-motion").then((mod) => ({
        default: mod.motion.feDropShadow,
      })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  feFlood: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.feFlood })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  feFuncA: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.feFuncA })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  feFuncB: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.feFuncB })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  feFuncG: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.feFuncG })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  feFuncR: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.feFuncR })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  feImage: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.feImage })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  feMerge: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.feMerge })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  feMergeNode: dynamic(
    () =>
      import("framer-motion").then((mod) => ({
        default: mod.motion.feMergeNode,
      })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  feMorphology: dynamic(
    () =>
      import("framer-motion").then((mod) => ({
        default: mod.motion.feMorphology,
      })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  fePointLight: dynamic(
    () =>
      import("framer-motion").then((mod) => ({
        default: mod.motion.fePointLight,
      })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  feSpecularLighting: dynamic(
    () =>
      import("framer-motion").then((mod) => ({
        default: mod.motion.feSpecularLighting,
      })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  feSpotLight: dynamic(
    () =>
      import("framer-motion").then((mod) => ({
        default: mod.motion.feSpotLight,
      })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  feTile: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.feTile })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  feTurbulence: dynamic(
    () =>
      import("framer-motion").then((mod) => ({
        default: mod.motion.feTurbulence,
      })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  form: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.form })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  input: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.input })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  textarea: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.textarea })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  select: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.select })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  option: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.option })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  label: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.label })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  fieldset: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.fieldset })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  legend: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.legend })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  ul: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.ul })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  ol: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.ol })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  li: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.li })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  dl: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.dl })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  dt: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.dt })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  dd: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.dd })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  h1: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.h1 })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  h2: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.h2 })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  h3: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.h3 })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  h4: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.h4 })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  h5: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.h5 })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  h6: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.h6 })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  p: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.p })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  blockquote: dynamic(
    () =>
      import("framer-motion").then((mod) => ({
        default: mod.motion.blockquote,
      })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  pre: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.pre })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  code: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.code })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  em: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.em })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  strong: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.strong })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  i: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.i })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  b: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.b })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  u: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.u })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  small: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.small })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  sub: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.sub })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  sup: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.sup })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  del: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.del })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  ins: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.ins })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  mark: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.mark })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  time: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.time })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  address: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.address })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  article: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.article })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  aside: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.aside })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  footer: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.footer })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  header: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.header })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  hgroup: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.hgroup })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  main: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.main })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  nav: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.nav })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  section: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.section })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  table: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.table })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  thead: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.thead })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  tbody: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.tbody })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  tfoot: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.tfoot })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  tr: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.tr })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  td: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.td })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  th: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.th })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  caption: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.caption })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  colgroup: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.colgroup })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  col: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.col })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  iframe: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.iframe })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  object: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.object })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  param: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.param })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  video: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.video })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  audio: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.audio })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  source: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.source })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  track: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.track })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  embed: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.embed })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  area: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.area })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  map: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.map })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  canvas: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.canvas })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  figcaption: dynamic(
    () =>
      import("framer-motion").then((mod) => ({
        default: mod.motion.figcaption,
      })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  figure: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.figure })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  picture: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.picture })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  cite: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.cite })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  data: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.data })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  datalist: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.datalist })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  details: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.details })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  dialog: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.dialog })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  summary: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.summary })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  abbr: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.abbr })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  bdi: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.bdi })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  bdo: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.bdo })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  br: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.br })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  hr: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.hr })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  kbd: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.kbd })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  meter: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.meter })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  output: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.output })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  progress: dynamic(
    () =>
      import("framer-motion").then((mod) => ({ default: mod.motion.progress })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  q: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.q })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  rp: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.rp })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  rt: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.rt })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  ruby: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.ruby })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  samp: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.samp })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  var: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.var })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
  wbr: dynamic(
    () => import("framer-motion").then((mod) => ({ default: mod.motion.wbr })),
    {
      ssr: false,
    }
  ) as ComponentType<any>,
};

export const AnimatePresence = dynamic(
  () =>
    import("framer-motion").then((mod) => ({ default: mod.AnimatePresence })),
  {
    ssr: false,
  }
) as ComponentType<any>;
