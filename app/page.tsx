'use client';
import { persistLanguagePreference, readLanguagePreference } from '@/brand/language-preference.mjs';
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { BrandHeader, BrandFooter, BrandLanguage, type BrandLocale } from '@/brand/shell';

type Point = { x: number; y: number };

type StarPalette = {
  id: string;
  color: string;
};

type StarShapeSpec = {
  points: number;
  outerR: number;
  secondaryR?: number;
  innerR: number;
};

type FlowerSpecies =
  | 'cornflower'
  | 'sakura'
  | 'sunflower'
  | 'cosmos'
  | 'camellia'
  | 'daisy'
  | 'lily'
  | 'plum'
  | 'hydrangea'
  | 'narcissus'
  | 'forgetmenot'
  | 'clematis';

type FloatingNode = {
  id: string;
  name: string;
  profileUrl?: string;
  kind: 'star' | 'flower';
  x: number;
  y: number;
  dx: number;
  dy: number;
  duration: number;
  delay: number;
  rotation: number;
  scale: number;
  shapeIndex: number;
  paletteIndex: number;
  flowerSpecies: FlowerSpecies;
};

const FLOWER_SPECIES_LIST: Array<{ species: FlowerSpecies; color: string }> = [
  { species: 'cornflower', color: '#3273E8' },
  { species: 'sakura', color: '#F0829B' },
  { species: 'sunflower', color: '#E8B228' },
  { species: 'cosmos', color: '#DF5B8C' },
  { species: 'camellia', color: '#D94B64' },
  { species: 'daisy', color: '#7A68DC' },
  { species: 'lily', color: '#4984E8' },
  { species: 'plum', color: '#E05263' },
  { species: 'hydrangea', color: '#5A95F0' },
  { species: 'narcissus', color: '#E8A829' },
  { species: 'forgetmenot', color: '#479BF0' },
  { species: 'clematis', color: '#8362E6' },
];

const STAR_PALETTES: StarPalette[] = [
  { id: 'violet', color: '#6A5ACD' },
  { id: 'gold', color: '#E4B230' },
  { id: 'rose', color: '#DF6284' },
  { id: 'cerulean', color: '#4492E6' },
  { id: 'jade', color: '#36B393' },
  { id: 'apricot', color: '#E87E43' },
  { id: 'orchid', color: '#B560DA' },
  { id: 'cobalt', color: '#5C73E6' },
  { id: 'aqua', color: '#35A4BE' },
  { id: 'ruby', color: '#D9585E' },
];

const STAR_SHAPES: StarShapeSpec[] = [
  { points: 5, outerR: 24, innerR: 10.2 },
  { points: 6, outerR: 24, innerR: 11.8 },
  { points: 8, outerR: 25, secondaryR: 16.5, innerR: 8.2 },
  { points: 7, outerR: 23.5, innerR: 11.4 },
  { points: 8, outerR: 23.5, innerR: 11.2 },
  { points: 10, outerR: 24, secondaryR: 18.5, innerR: 11.8 },
  { points: 5, outerR: 23, innerR: 13.4 },
  { points: 6, outerR: 24.5, innerR: 8.8 },
  { points: 9, outerR: 23.5, innerR: 12.2 },
];

function fmt(n: number): string {
  return n.toFixed(2);
}

function buildPolygonalStar(spec: StarShapeSpec): string {
  const cx = 32;
  const cy = 32;
  const n = spec.points;
  const contourParts: string[] = [];

  for (let i = 0; i < n; i++) {
    const tipAngle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const valleyAngle = tipAngle + Math.PI / n;
    const tipR = spec.secondaryR !== undefined && i % 2 === 1 ? spec.secondaryR : spec.outerR;
    const tipX = cx + tipR * Math.cos(tipAngle);
    const tipY = cy + tipR * Math.sin(tipAngle);
    const valleyX = cx + spec.innerR * Math.cos(valleyAngle);
    const valleyY = cy + spec.innerR * Math.sin(valleyAngle);
    contourParts.push(`${fmt(tipX)},${fmt(tipY)}`, `${fmt(valleyX)},${fmt(valleyY)}`);
  }

  return contourParts.join(' ');
}

const PRECOMPUTED_STARS = STAR_SHAPES.map(buildPolygonalStar);

function RealWorldFlowerSvg({ species }: { species: FlowerSpecies }) {
  switch (species) {
    case 'cornflower':
      return (
        <svg className="thanks-star-svg" viewBox="0 0 64 64" focusable="false">
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <path
              key={`o-${deg}`}
              transform={`rotate(${deg} 32 32)`}
              d="M 32 28.5 L 25.2 14.5 L 27.4 9 L 29.4 13 L 30.8 7.8 L 32 12.4 L 33.2 7.8 L 34.6 13 L 36.6 9 L 38.8 14.5 Z"
              fill="#2E6BE6"
              stroke="#FCFBF7"
              strokeWidth="0.95"
              strokeLinejoin="round"
            />
          ))}
          {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map(deg => (
            <path
              key={`m-${deg}`}
              transform={`rotate(${deg} 32 32)`}
              d="M 32 29 L 26.5 16.5 L 28.4 11.4 L 30 15 L 31.1 10.6 L 32 14.4 L 32.9 10.6 L 34 15 L 35.6 11.4 L 37.5 16.5 Z"
              fill="#4B8AF4"
              stroke="#FCFBF7"
              strokeWidth="0.85"
              strokeLinejoin="round"
            />
          ))}
          <circle cx="32" cy="32" r="6.8" fill="#23388E" stroke="#FCFBF7" strokeWidth="1" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <g key={`c-${deg}`} transform={`rotate(${deg} 32 32)`}>
              <line x1="32" y1="32" x2="32" y2="25.2" stroke="#5B3FA6" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="32" cy="24.8" r="1.15" fill="#F0ECFF" />
            </g>
          ))}
          <circle cx="32" cy="32" r="2.6" fill="#3B2E7E" />
        </svg>
      );

    case 'sakura':
      return (
        <svg className="thanks-star-svg" viewBox="0 0 64 64" focusable="false">
          {[0, 72, 144, 216, 288].map(deg => (
            <path
              key={deg}
              transform={`rotate(${deg} 32 32)`}
              d="M 32 30.5 C 23 25.5 20 15 26.2 9.2 C 28 7.5 29.8 8 30.6 9.7 L 32 12.8 L 33.4 9.7 C 34.2 8 36 7.5 37.8 9.2 C 44 15 41 25.5 32 30.5 Z"
              fill="#F0829B"
              stroke="#FCFBF7"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          ))}
          {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map(deg => (
            <g key={deg} transform={`rotate(${deg} 32 32)`}>
              <line x1="32" y1="32" x2="32" y2="23.5" stroke="#C84669" strokeWidth="1.1" strokeLinecap="round" />
              <circle cx="32" cy="23" r="1.3" fill="#E8B228" />
            </g>
          ))}
          <circle cx="32" cy="32" r="2.8" fill="#C84669" />
        </svg>
      );

    case 'sunflower':
      return (
        <svg className="thanks-star-svg" viewBox="0 0 64 64" focusable="false">
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
            <path
              key={`b-${deg}`}
              transform={`rotate(${deg + 15} 32 32)`}
              d="M 32 23 C 28.4 17.5 28.6 10.5 32 6.5 C 35.4 10.5 35.6 17.5 32 23 Z"
              fill="#D99B1E"
            />
          ))}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
            <path
              key={`f-${deg}`}
              transform={`rotate(${deg} 32 32)`}
              d="M 32 23 C 28.4 17.5 28.6 10.5 32 6.5 C 35.4 10.5 35.6 17.5 32 23 Z"
              fill="#F2BE35"
              stroke="#FCFBF7"
              strokeWidth="0.7"
            />
          ))}
          <circle cx="32" cy="32" r="11.2" fill="#5C3A24" stroke="#FCFBF7" strokeWidth="1" />
          <circle cx="32" cy="32" r="8.2" fill="none" stroke="#E8B228" strokeWidth="1.4" strokeDasharray="2 2.4" />
          <circle cx="32" cy="32" r="4.2" fill="none" stroke="#8C5B3C" strokeWidth="1.3" strokeDasharray="1.8 2.2" />
        </svg>
      );

    case 'cosmos':
      return (
        <svg className="thanks-star-svg" viewBox="0 0 64 64" focusable="false">
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <path
              key={deg}
              transform={`rotate(${deg} 32 32)`}
              d="M 32 28 C 26.2 22 25.2 13 28 9.2 C 29 8 30.2 8.8 30.6 9.6 C 31.2 8 32.8 8 33.4 9.6 C 33.8 8.8 35 8 36 9.2 C 38.8 13 37.8 22 32 28 Z"
              fill="#DF5B8C"
              stroke="#FCFBF7"
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
          ))}
          <circle cx="32" cy="32" r="6" fill="#E8B532" stroke="#FCFBF7" strokeWidth="1.2" />
        </svg>
      );

    case 'camellia':
      return (
        <svg className="thanks-star-svg" viewBox="0 0 64 64" focusable="false">
          {[0, 60, 120, 180, 240, 300].map(deg => (
            <path
              key={`o-${deg}`}
              transform={`rotate(${deg} 32 32)`}
              d="M 32 30 C 21 26 19 11 32 7.5 C 45 11 43 26 32 30 Z"
              fill="#D94B64"
              stroke="#FCFBF7"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          ))}
          {[30, 90, 150, 210, 270, 330].map(deg => (
            <path
              key={`m-${deg}`}
              transform={`rotate(${deg} 32 32)`}
              d="M 32 30.5 C 23.5 27 22 15 32 12 C 42 15 40.5 27 32 30.5 Z"
              fill="#EA6B82"
              stroke="#FCFBF7"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          ))}
          {[0, 60, 120, 180, 240, 300].map(deg => (
            <path
              key={`i-${deg}`}
              transform={`rotate(${deg} 32 32)`}
              d="M 32 31 C 26.5 28.5 25.5 20.5 32 18 C 38.5 20.5 37.5 28.5 32 31 Z"
              fill="#F48B9E"
              stroke="#FCFBF7"
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
          ))}
          <circle cx="32" cy="32" r="4.8" fill="#E8B532" stroke="#FCFBF7" strokeWidth="1.2" />
        </svg>
      );

    case 'daisy':
      return (
        <svg className="thanks-star-svg" viewBox="0 0 64 64" focusable="false">
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
            <path
              key={deg}
              transform={`rotate(${deg} 32 32)`}
              d="M 32 25.5 C 29 19 29 10 32 7 C 35 10 35 19 32 25.5 Z"
              fill="#7A68DC"
              stroke="#FCFBF7"
              strokeWidth="1"
            />
          ))}
          <circle cx="32" cy="32" r="7.8" fill="#E8B534" stroke="#FCFBF7" strokeWidth="1.4" />
        </svg>
      );

    case 'lily':
      return (
        <svg className="thanks-star-svg" viewBox="0 0 64 64" focusable="false">
          {[0, 120, 240].map(deg => (
            <path
              key={`o-${deg}`}
              transform={`rotate(${deg} 32 32)`}
              d="M 32 31 C 25.5 23.5 25 13.5 32 6 C 39 13.5 38.5 23.5 32 31 Z"
              fill="#3B78DE"
              stroke="#FCFBF7"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          ))}
          {[60, 180, 300].map(deg => (
            <path
              key={`i-${deg}`}
              transform={`rotate(${deg} 32 32)`}
              d="M 32 31 C 25 23 24.5 14 32 7 C 39.5 14 39 23 32 31 Z"
              fill="#5B95F5"
              stroke="#FCFBF7"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          ))}
          {[30, 90, 150, 210, 270, 330].map(deg => (
            <g key={`s-${deg}`} transform={`rotate(${deg} 32 32)`}>
              <line x1="32" y1="32" x2="32" y2="21.5" stroke="#FCFBF7" strokeWidth="1.2" strokeLinecap="round" />
              <ellipse cx="32" cy="20.5" rx="1.3" ry="2.2" fill="#E8A229" />
            </g>
          ))}
          <circle cx="32" cy="32" r="3.2" fill="#E8A229" />
        </svg>
      );

    case 'plum':
      return (
        <svg className="thanks-star-svg" viewBox="0 0 64 64" focusable="false">
          {[0, 72, 144, 216, 288].map(deg => (
            <circle
              key={deg}
              transform={`rotate(${deg} 32 32)`}
              cx="32"
              cy="17.5"
              r="10.2"
              fill="#E05263"
              stroke="#FCFBF7"
              strokeWidth="1.3"
            />
          ))}
          <circle cx="32" cy="32" r="6.2" fill="#B83246" />
          {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map(deg => (
            <g key={`st-${deg}`} transform={`rotate(${deg} 32 32)`}>
              <line x1="32" y1="32" x2="32" y2="22.8" stroke="#FCFBF7" strokeWidth="1.05" strokeLinecap="round" />
              <circle cx="32" cy="22.2" r="1.35" fill="#F2C94C" />
            </g>
          ))}
          <circle cx="32" cy="32" r="2.6" fill="#F2C94C" />
        </svg>
      );

    case 'hydrangea':
      return (
        <svg className="thanks-star-svg" viewBox="0 0 64 64" focusable="false">
          {[0, 90, 180, 270].map((deg, idx) => (
            <path
              key={deg}
              transform={`rotate(${deg} 32 32)`}
              d="M 32 30.5 C 21 26.5 19.5 14 32 7.5 C 44.5 14 43 26.5 32 30.5 Z"
              fill={idx % 2 === 0 ? '#5A95F0' : '#74A9F7'}
              stroke="#FCFBF7"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          ))}
          {[0, 90, 180, 270].map(deg => (
            <line
              key={`v-${deg}`}
              transform={`rotate(${deg} 32 32)`}
              x1="32"
              y1="32"
              x2="32"
              y2="19"
              stroke="#FCFBF7"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
          ))}
          <circle cx="32" cy="32" r="4.2" fill="#2E5CB8" stroke="#FCFBF7" strokeWidth="1.2" />
        </svg>
      );

    case 'narcissus':
      return (
        <svg className="thanks-star-svg" viewBox="0 0 64 64" focusable="false">
          {[0, 60, 120, 180, 240, 300].map(deg => (
            <path
              key={deg}
              transform={`rotate(${deg} 32 32)`}
              d="M 32 30.5 C 24 25 23.5 13.5 32 7 C 40.5 13.5 40 25 32 30.5 Z"
              fill="#F3CA4D"
              stroke="#FCFBF7"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          ))}
          <circle cx="32" cy="32" r="9.2" fill="#E66432" stroke="#FCFBF7" strokeWidth="1.3" />
          <circle cx="32" cy="32" r="5.6" fill="#F7DC6F" />
          <circle cx="32" cy="32" r="2.2" fill="#E66432" />
        </svg>
      );

    case 'forgetmenot':
      return (
        <svg className="thanks-star-svg" viewBox="0 0 64 64" focusable="false">
          {[0, 72, 144, 216, 288].map(deg => (
            <path
              key={deg}
              transform={`rotate(${deg} 32 32)`}
              d="M 32 30.5 C 21.5 27 19.5 13 28.5 9.2 C 30.8 8.2 33.2 8.2 35.5 9.2 C 44.5 13 42.5 27 32 30.5 Z"
              fill="#479BF0"
              stroke="#FCFBF7"
              strokeWidth="1.25"
              strokeLinejoin="round"
            />
          ))}
          <circle cx="32" cy="32" r="6.8" fill="#FCFBF7" />
          <circle cx="32" cy="32" r="5.2" fill="#F2C138" />
          <circle cx="32" cy="32" r="2.1" fill="#2A5C9E" />
        </svg>
      );

    case 'clematis':
      return (
        <svg className="thanks-star-svg" viewBox="0 0 64 64" focusable="false">
          {[0, 90, 180, 270].map(deg => (
            <path
              key={`o-${deg}`}
              transform={`rotate(${deg} 32 32)`}
              d="M 32 31 C 25.5 24 25.5 13 32 6.5 C 38.5 13 38.5 24 32 31 Z"
              fill="#7A56E0"
              stroke="#FCFBF7"
              strokeWidth="1.15"
              strokeLinejoin="round"
            />
          ))}
          {[45, 135, 225, 315].map(deg => (
            <path
              key={`i-${deg}`}
              transform={`rotate(${deg} 32 32)`}
              d="M 32 31 C 26 24.5 26 14 32 7.5 C 38 14 38 24.5 32 31 Z"
              fill="#9474F2"
              stroke="#FCFBF7"
              strokeWidth="1.15"
              strokeLinejoin="round"
            />
          ))}
          <circle cx="32" cy="32" r="6.8" fill="#FCFBF7" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
            <line
              key={`s-${deg}`}
              transform={`rotate(${deg} 32 32)`}
              x1="32"
              y1="32"
              x2="32"
              y2="24"
              stroke="#462E96"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          ))}
          <circle cx="32" cy="32" r="3" fill="#F2C438" />
        </svg>
      );
  }
}

const text = {
  ko: { eyebrow: '당신에게 드리는 꽃다발', title: '감사합니다.', contributors: '기여자', profile: '프로필 열기' },
  en: { eyebrow: 'A bouquet for you', title: 'Thank you.', contributors: 'Contributors', profile: 'Open profile' },
  zh: { eyebrow: '献给你的一束花', title: '谢谢。', contributors: '贡献者', profile: '打开个人主页' },
  ja: { eyebrow: 'あなたへ贈る花束', title: 'ありがとう。', contributors: 'コントリビューター', profile: 'プロフィールを開く' },
};

function FloatingContributor({ contributor, profile }: { contributor: FloatingNode; profile: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; origin: Point } | null>(null);
  const moved = useRef(false);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });

  function bound(next: Point) {
    const node = ref.current;
    const field = node?.parentElement;
    if (!node || !field) return next;
    const clamp = (n: number, low: number, high: number) => Math.max(low, Math.min(high, n));
    return {
      x: clamp(next.x, 24 + node.offsetWidth / 2 - node.offsetLeft, field.clientWidth - 24 - node.offsetWidth / 2 - node.offsetLeft),
      y: clamp(next.y, 20 + node.offsetHeight / 2 - node.offsetTop, field.clientHeight - 36 - node.offsetHeight / 2 - node.offsetTop),
    };
  }

  function start(event: PointerEvent<HTMLAnchorElement>) {
    if (event.button !== 0) return;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, origin: offset };
    moved.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.dragging = 'true';
  }

  function move(event: PointerEvent<HTMLAnchorElement>) {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;
    const x = event.clientX - state.x;
    const y = event.clientY - state.y;
    if (Math.hypot(x, y) > 4) moved.current = true;
    setOffset(bound({ x: state.origin.x + x, y: state.origin.y + y }));
  }

  function end(event: PointerEvent<HTMLAnchorElement>) {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    event.currentTarget.dataset.dragging = 'false';
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function click(event: MouseEvent<HTMLAnchorElement>) {
    if (moved.current || !contributor.profileUrl) {
      event.preventDefault();
    }
    moved.current = false;
  }

  function key(event: KeyboardEvent<HTMLAnchorElement>) {
    const step = event.shiftKey ? 36 : 12;
    const deltas: Record<string, Point> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };
    const delta = deltas[event.key];
    if (!delta) return;
    event.preventDefault();
    setOffset(current => bound({ x: current.x + delta.x, y: current.y + delta.y }));
  }

  const palette = STAR_PALETTES[contributor.paletteIndex % STAR_PALETTES.length];
  const contour = PRECOMPUTED_STARS[contributor.shapeIndex % PRECOMPUTED_STARS.length];
  const flowerMeta = FLOWER_SPECIES_LIST.find(f => f.species === contributor.flowerSpecies) ?? FLOWER_SPECIES_LIST[0];
  const dotColor = contributor.kind === 'flower' ? flowerMeta.color : palette.color;
  const hasProfile = Boolean(contributor.profileUrl);

  const style = {
    '--left': `${contributor.x}%`,
    '--top': `${contributor.y}%`,
    '--dx': `${contributor.dx}px`,
    '--dy': `${contributor.dy}px`,
    '--duration': `${contributor.duration}s`,
    '--delay': `${contributor.delay}s`,
    '--star-rotate': `${contributor.rotation}deg`,
    '--star-scale': `${contributor.scale}`,
    '--star-color': dotColor,
    transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
  } as CSSProperties;

  return (
    <a
      ref={ref}
      className="thanks-name thanks-star"
      data-node-kind={contributor.kind}
      data-flower-species={contributor.kind === 'flower' ? contributor.flowerSpecies : undefined}
      data-has-profile={hasProfile ? 'true' : 'false'}
      data-star-palette={palette.id}
      style={style}
      href={contributor.profileUrl}
      target={hasProfile ? '_blank' : undefined}
      rel={hasProfile ? 'noopener noreferrer' : undefined}
      draggable={false}
      tabIndex={0}
      aria-label={hasProfile ? `${contributor.name} — ${profile}` : contributor.name}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
      onClick={click}
      onKeyDown={key}
    >
      <span className="thanks-star-drift">
        <span className="thanks-star-visual" aria-hidden="true">
          {contributor.kind === 'flower' ? (
            <RealWorldFlowerSvg species={contributor.flowerSpecies} />
          ) : (
            <svg className="thanks-star-svg" viewBox="0 0 64 64" focusable="false">
              <polygon points={contour} fill={palette.color} />
            </svg>
          )}
        </span>
        <span className="thanks-star-label">
          <span className="thanks-star-label-dot" aria-hidden="true" />
          <span className="thanks-star-label-text">{contributor.name}</span>
          {hasProfile && (
            <svg className="thanks-star-label-link" viewBox="0 0 12 12" aria-hidden="true">
              <path
                d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </span>
    </a>
  );
}

function pickStarPositions(count: number, random: (min: number, max: number) => number): Point[] {
  const positions: Point[] = [];
  const inTitleBox = (x: number, y: number) => x > 24 && x < 76 && y > 32 && y < 68;

  function sampleOutsideTitle(): Point {
    for (let k = 0; k < 50; k++) {
      const p = { x: random(10, 90), y: random(11, 83) };
      if (!inTitleBox(p.x, p.y)) return p;
    }
    return { x: random(10, 23), y: random(12, 82) };
  }

  for (let i = 0; i < count; i++) {
    let chosen: Point = sampleOutsideTitle();
    const baseDist = Math.max(9, 17 - Math.floor(i / 6) * 1.5);

    for (let attempt = 0; attempt < 60; attempt++) {
      const candidate = sampleOutsideTitle();
      const requiredDist = baseDist * Math.max(0.45, 1 - attempt / 70);
      const farEnough = positions.every(p => Math.hypot(p.x - candidate.x, p.y - candidate.y) >= requiredDist);
      if (farEnough || attempt === 59) {
        chosen = candidate;
        break;
      }
    }
    positions.push(chosen);
  }

  return positions;
}

function shuffleArray<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function HomePage() {
  const [language, setLanguage] = useState<BrandLocale>('en');
  useEffect(() => {
    const stored = readLanguagePreference();
    if (stored) {
      const timer = setTimeout(() => setLanguage(stored), 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const [contributors, setContributors] = useState<FloatingNode[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch('/thanks/contributors.json', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) return;
        const records: unknown = await response.json();
        if (!Array.isArray(records)) return;
        const random = (min: number, max: number) => min + Math.random() * (max - min);
        const validRecords: Array<{ name: string; profileUrl?: string }> = [];
        const seenNames = new Set<string>();
        for (const record of records) {
          if (
            !record ||
            typeof record !== 'object' ||
            typeof record.name !== 'string' ||
            (record.profileUrl !== undefined && typeof record.profileUrl !== 'string') ||
            seenNames.has(record.name)
          ) {
            continue;
          }
          seenNames.add(record.name);
          validRecords.push({ name: record.name, profileUrl: record.profileUrl });
        }

        const positions = pickStarPositions(validRecords.length, random);
        let flowerDeck: Array<{ species: FlowerSpecies; color: string }> = [];

        const list: FloatingNode[] = validRecords.map((record, index) => {
          if (flowerDeck.length === 0) {
            flowerDeck = shuffleArray(FLOWER_SPECIES_LIST);
          }
          const flowerEntry = flowerDeck.pop() ?? FLOWER_SPECIES_LIST[Math.floor(Math.random() * FLOWER_SPECIES_LIST.length)];
          const pos = positions[index];

          return {
            id: `contributor-${record.name}`,
            name: record.name,
            profileUrl: record.profileUrl,
            kind: 'flower',
            x: pos.x,
            y: pos.y,
            dx: (Math.random() < 0.5 ? -1 : 1) * random(14, 30),
            dy: (Math.random() < 0.5 ? -1 : 1) * random(12, 24),
            duration: random(28, 46),
            delay: random(-40, 0),
            rotation: random(-24, 24),
            scale: random(0.96, 1.14),
            shapeIndex: index % STAR_SHAPES.length,
            paletteIndex: index % STAR_PALETTES.length,
            flowerSpecies: flowerEntry.species,
          };
        });

        setContributors(list);
      } catch {
        /* Optional name-list failures do not remove the acknowledgement page. */
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  function changeLanguage(next: BrandLocale) {
    setLanguage(next);
    persistLanguagePreference(next);
  }

  const copy = text[language];
  return (
    <div className="thanks-page">
      <BrandHeader active="thanks" locale={language} languageControl={<BrandLanguage locale={language} onChange={changeLanguage} />} />
      <main className="thanks-scene">
        <section className="thanks-title" aria-labelledby="thanks-heading">
          <p>{copy.eyebrow}</p>
          <h1 id="thanks-heading">{copy.title}</h1>
        </section>
        <div className="thanks-field" aria-label={copy.contributors}>
          {contributors.map(contributor => (
            <FloatingContributor key={contributor.id} contributor={contributor} profile={copy.profile} />
          ))}
        </div>
      </main>
      <BrandFooter />
    </div>
  );
}
