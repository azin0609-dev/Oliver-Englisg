import {
  Apple,
  ArrowUpRight,
  Backpack,
  BookOpen,
  Boxes,
  Heart,
  Home,
  Leaf,
  MessageCircle,
  Moon,
  Puzzle,
  Settings,
  Sparkles,
  Sprout,
  Sun,
  TreePine,
  Users,
  Droplets,
} from 'lucide-react';
export function Dino({ className = '', small = false }: { className?: string; small?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <path
        d="M26 86C12 86 6 75 9 68c7 8 13 8 21 3l8-18c5-11 15-16 28-12l6-19c4-12 15-16 27-10 10 5 13 18 8 28-4 8-13 11-23 8l-5 32c-2 14-16 19-28 17l-6 9H33l-1-16Z"
        fill="currentColor"
      />
      <path d="m38 54-9-9 13-2m8-1-5-12 13 5m7-1 1-12 9 8" fill="#e8bd6f" />
      <path d="M63 63c-6 0-13 9-13 18 0 11 15 15 25 8l5-22c-5-3-12-4-17-4Z" fill="#dce7be" />
      <circle cx="96" cy="25" r="3" fill="#314b3a" />
      <circle cx="102" cy="33" r="4" fill="#e6aa8b" />
      <path d="M92 38c3 2 6 2 9 0" stroke="#314b3a" strokeWidth="2" strokeLinecap="round" />
      {!small && (
        <path
          d="M45 103v4m-6-4v4m34-12v4m-6-4v4"
          stroke="#f8f7f1"
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
export function Garden({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`garden-art ${className}`}
      viewBox="0 0 500 360"
      role="img"
      aria-label="原創繪本插畫：大恐龍和小恐龍在花園裡散步"
    >
      <defs>
        <pattern id="grain" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="2" r=".5" fill="#456d51" opacity=".08" />
        </pattern>
        <linearGradient id="body" x1="0" x2="1" y2="1">
          <stop stopColor="#7b9d72" />
          <stop offset="1" stopColor="#90ad80" />
        </linearGradient>
      </defs>
      <path
        d="M51 231C17 135 91 46 190 48c81 2 84-31 153-5 94 35 143 133 95 213-41 67-157 53-228 55-83 2-139-27-159-80Z"
        fill="#e8eddb"
      />
      <circle cx="373" cy="71" r="31" fill="#e9bc76" />
      <path
        d="m373 26 1-8m32 21 6-7m10 37 9-1m-30 34 6 6m-66-66-6-6"
        stroke="#dca85b"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M68 89c9-12 19-11 24-3 12-17 34-9 35 7H66" fill="#fffdf5" />
      <path d="M266 37c7-9 17-10 22-2 12-14 32-7 31 7h-55" fill="#fffdf5" />
      <path d="M35 283c80-48 139-31 214-34 66-2 115-17 210 34-75 44-325 53-424 0Z" fill="#d4dfb9" />
      <path
        d="M159 294c44-27 107-25 124-18s-12 16-3 30c14 21 69 24 91 29-97 11-175 2-217-7 41-2 84-11 69-18-12-7-43-10-64-16Z"
        fill="#f2e2bc"
      />
      <path
        d="M60 265c-6-29-25-37-29-27-5 13 16 21 29 27Zm3 4c-3-25 8-41 17-34 10 9-6 26-17 34Z"
        fill="#a1b48b"
      />
      <path d="M414 252c-5-34 6-71 20-68 17 3 5 39-20 68Z" fill="#6e9273" />
      <path
        d="M419 252c18-37 39-40 44-27 5 11-18 24-44 27Zm-6 3c-25-19-29-42-15-46 14-3 21 22 15 46Z"
        fill="#8eaa7b"
      />
      <path
        d="M188 254c-46 11-79-4-88-30-2-5 3-7 7-3 17 17 36 16 52 3 5-4 9-9 13-17l17-40c8-18 29-27 49-20l11-48c4-21 19-38 39-34 22 4 32 25 25 45-4 13-17 21-32 19l-5 78c-1 22-17 40-36 45l-2 27h-24l-5-25-17-1-4 25h-23l-2-24Z"
        fill="url(#body)"
      />
      <path d="m180 178-14-16 22 1m6-17-9-19 21 9m16-1 1-22 17 15m8-30 13-12 4 16" fill="#d5b375" />
      <path d="M223 179c-22 0-33 21-31 41 1 17 33 24 54 11l6-40c-7-8-18-12-29-12Z" fill="#c9d5a6" />
      <path d="M222 187c4 8 12 10 19 4" stroke="#6c8f63" strokeWidth="6" strokeLinecap="round" />
      <circle cx="294" cy="87" r="3.5" fill="#344e3b" />
      <circle cx="299" cy="100" r="7" fill="#d9ab8e" opacity=".9" />
      <path d="M279 109c4 4 10 4 15 1" stroke="#344e3b" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M170 278v3m7-3v3m40-3v3m8-3v3"
        stroke="#eef0d9"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M335 287c-21 4-39-2-41-15 9 5 18 3 22-4l11-17c6-9 17-9 25-4l3-16c1-10 9-15 17-11 10 4 13 15 6 22-3 4-8 5-13 4l1 24c0 9-5 15-13 16l-1 11h-12l-3-10-7-1-3 11h-10l-1-11Z"
        fill="#d4a16c"
      />
      <path d="m323 255-8-8h12m9-5-1-10 10 6" fill="#b78055" />
      <ellipse cx="342" cy="268" rx="10" ry="13" fill="#edd0a2" />
      <circle cx="372" cy="229" r="2" fill="#4b513b" />
      <path d="M366 238h5" stroke="#4b513b" strokeWidth="1.5" strokeLinecap="round" />
      <g stroke="#8da378" strokeWidth="2" strokeLinecap="round">
        <path d="m103 293 2-14m-2 8-5-4m292 16 2-15m-1 7 5-4m-273-22 1-12m241 60 1-9" />
      </g>
      <g fill="#f4e4ba">
        <circle cx="105" cy="277" r="5" />
        <circle cx="393" cy="283" r="4" />
        <circle cx="125" cy="251" r="4" />
      </g>
      <g fill="#c9a36b">
        <circle cx="105" cy="277" r="2" />
        <circle cx="393" cy="283" r="1.5" />
      </g>
      <path d="m146 86 3 7 8 1-6 5 2 8-7-4-6 4 1-8-6-5 8-1Z" fill="#d6b478" />
      <path d="M348 129c4-6 9-5 12 0-5 1-7 4-7 8-5-1-7-4-5-8Z" fill="#97af9a" />
      <rect x="25" y="25" width="450" height="310" fill="url(#grain)" opacity=".9" />
    </svg>
  );
}
const icons = {
  sun: Sun,
  droplets: Droplets,
  apple: Apple,
  backpack: Backpack,
  tree: TreePine,
  basket: Boxes,
  heart: Heart,
  friends: Users,
  moon: Moon,
  book: BookOpen,
  message: MessageCircle,
  sprout: Sprout,
  home: Home,
  settings: Settings,
  sparkles: Sparkles,
  leaf: Leaf,
  puzzle: Puzzle,
  arrow: ArrowUpRight,
};
export function TopicIcon({
  name,
  size = 25,
  className = '',
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  if (name === 'dino') return <Dino className={`dino-icon ${className}`} small />;
  const Icon = icons[name as keyof typeof icons] ?? BookOpen;
  return <Icon size={size} className={className} strokeWidth={1.65} aria-hidden="true" />;
}
