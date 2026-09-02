"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

type Language = "en" | "zh" | "ja";

interface ContributorRecord {
  name: string;
  profileUrl?: string;
}

interface Contributor extends ContributorRecord {
  motion: FloatingMotion;
}

const copy = {
  en: {
    languageName: "English",
    eyebrow: "A bouquet for you",
    title: "Thank you.",
    contributorsLabel: "Contributors",
    profileLabel: "Open profile",
  },
  zh: {
    languageName: "简体中文",
    eyebrow: "献给你的一束花",
    title: "谢谢。",
    contributorsLabel: "贡献者",
    profileLabel: "打开个人主页",
  },
  ja: {
    languageName: "日本語",
    eyebrow: "あなたへ贈る花束",
    title: "ありがとう。",
    contributorsLabel: "コントリビューター",
    profileLabel: "プロフィールを開く",
  },
} satisfies Record<Language, Record<string, string>>;

const languageLabels: Record<Language, string> = {
  en: "EN",
  zh: "中文",
  ja: "日本語",
};

interface Point {
  x: number;
  y: number;
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  origin: Point;
}

interface FloatingMotion {
  placement: Point;
  mobilePlacement: Point;
  x: number;
  y: number;
  rotation: number;
  delay: number;
  duration: number;
}

function randomBetween(minimum: number, maximum: number) {
  return minimum + Math.random() * (maximum - minimum);
}

function randomMotion(): FloatingMotion {
  return {
    placement: {
      x: randomBetween(9, 91),
      y: randomBetween(10, 86),
    },
    mobilePlacement: {
      x: randomBetween(22, 78),
      y: randomBetween(10, 84),
    },
    x: randomBetween(-42, 42),
    y: randomBetween(-34, 34),
    rotation: randomBetween(-2, 2),
    delay: randomBetween(-14, 0),
    duration: randomBetween(11, 20),
  };
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function FloatingContributor({
  contributor,
  profileLabel,
}: {
  contributor: Contributor;
  profileLabel: string;
}) {
  const { motion } = contributor;
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const dragState = useRef<DragState | null>(null);
  const moved = useRef(false);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  function boundedOffset(nextOffset: Point) {
    const anchor = anchorRef.current;
    const field = anchor?.parentElement;
    if (!anchor || !field) return nextOffset;

    const baseX = anchor.offsetLeft;
    const baseY = anchor.offsetTop;
    const horizontalInset = Math.min(18, field.clientWidth * 0.025);
    const verticalInset = 12;

    return {
      x: clamp(
        nextOffset.x,
        horizontalInset + anchor.offsetWidth / 2 - baseX,
        field.clientWidth - horizontalInset - anchor.offsetWidth / 2 - baseX,
      ),
      y: clamp(
        nextOffset.y,
        verticalInset + anchor.offsetHeight / 2 - baseY,
        field.clientHeight - verticalInset - anchor.offsetHeight / 2 - baseY,
      ),
    };
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLAnchorElement>) {
    if (event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: offset,
    };
    moved.current = false;
    setDragging(true);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLAnchorElement>) {
    const state = dragState.current;
    if (!state || state.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - state.startX;
    const deltaY = event.clientY - state.startY;
    if (Math.hypot(deltaX, deltaY) > 4) moved.current = true;

    setOffset(
      boundedOffset({
        x: state.origin.x + deltaX,
        y: state.origin.y + deltaY,
      }),
    );
  }

  function handlePointerEnd(event: ReactPointerEvent<HTMLAnchorElement>) {
    if (dragState.current?.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragState.current = null;
    setDragging(false);
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!contributor.profileUrl || moved.current) event.preventDefault();
    moved.current = false;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLAnchorElement>) {
    const step = event.shiftKey ? 36 : 12;
    const movement: Record<string, Point> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };
    const delta = movement[event.key];
    if (!delta) return;

    event.preventDefault();
    setOffset((current) =>
      boundedOffset({ x: current.x + delta.x, y: current.y + delta.y }),
    );
  }

  const style = {
    transform: `translate3d(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px), 0)`,
    "--anchor-left": `${motion.placement.x}%`,
    "--anchor-top": `${motion.placement.y}%`,
    "--mobile-anchor-left": `${motion.mobilePlacement.x}%`,
    "--mobile-anchor-top": `${motion.mobilePlacement.y}%`,
    "--float-x": `${motion.x}px`,
    "--float-y": `${motion.y}px`,
    "--float-rotation": `${motion.rotation}deg`,
    "--float-delay": `${motion.delay}s`,
    "--float-duration": `${motion.duration}s`,
  } as CSSProperties;

  return (
    <a
      ref={anchorRef}
      className={`floating-name${dragging ? " is-dragging" : ""}`}
      style={style}
      href={contributor.profileUrl}
      target={contributor.profileUrl ? "_blank" : undefined}
      rel={contributor.profileUrl ? "noreferrer" : undefined}
      draggable={false}
      aria-label={contributor.profileUrl ? `${contributor.name} — ${profileLabel}` : contributor.name}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <span className="floating-name-drift">{contributor.name}</span>
    </a>
  );
}

function SparkMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 28 28" fill="none">
      <path d="M14 1.75c.55 7.82 4.43 11.7 12.25 12.25C18.43 14.55 14.55 18.43 14 26.25 13.45 18.43 9.57 14.55 1.75 14 9.57 13.45 13.45 9.57 14 1.75Z" fill="currentColor" />
    </svg>
  );
}

export default function HomePage() {
  const [language, setLanguage] = useState<Language>("en");
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const text = copy[language];

  useEffect(() => {
    const controller = new AbortController();

    async function loadContributors() {
      try {
        const response = await fetch("/thanks/contributors.json", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;

        const list: unknown = await response.json();
        if (!Array.isArray(list)) return;

        const records = list.filter(
          (entry): entry is ContributorRecord =>
            typeof entry === "object" &&
            entry !== null &&
            "name" in entry &&
            typeof entry.name === "string" &&
            (!("profileUrl" in entry) || typeof entry.profileUrl === "string"),
        );

        setContributors(
          records.map((record) => ({
            ...record,
            motion: randomMotion(),
          })),
        );
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) return;
      }
    }

    void loadContributors();
    return () => controller.abort();
  }, []);

  return (
    <div className="site-shell" lang={language === "zh" ? "zh-CN" : language}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <header className="site-header">
        <nav className="language-switcher" aria-label="Language">
          {(Object.keys(languageLabels) as Language[]).map((option) => (
            <button
              type="button"
              key={option}
              className={option === language ? "active" : undefined}
              aria-pressed={option === language}
              aria-label={copy[option].languageName}
              onClick={() => setLanguage(option)}
            >
              {languageLabels[option]}
            </button>
          ))}
        </nav>
      </header>

      <main id="main-content" className="thanks-canvas">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-ornament" aria-hidden="true"><SparkMark /></div>
          <p className="eyebrow">{text.eyebrow}</p>
          <h1 id="hero-title">{text.title}</h1>
        </section>

        <div className="floating-field" aria-label={text.contributorsLabel}>
          {contributors.map((contributor) => (
            <FloatingContributor
              key={contributor.name}
              contributor={contributor}
              profileLabel={text.profileLabel}
            />
          ))}
        </div>

        <p className="site-signature">TURBOISM.DEV/THANKS</p>
      </main>
    </div>
  );
}
