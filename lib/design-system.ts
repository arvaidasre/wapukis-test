// Dizaino sistema - spalvos, šriftai, atstumai ir animacijos

// Spalvų paletė
export const colors = {
  // Pagrindinės spalvos
  primary: {
    50: "#eefdf2",
    100: "#d7f9e0",
    200: "#b2f0c5",
    300: "#7ee2a8",
    400: "#4acd85",
    500: "#2ab369", // Pagrindinė žalia spalva
    600: "#1d9255",
    700: "#197547",
    800: "#185c3b",
    900: "#174d34",
    950: "#072b1b",
  },
  // Akcentinės spalvos
  accent: {
    amber: {
      light: "#fef3c7",
      DEFAULT: "#f59e0b",
      dark: "#b45309",
    },
    blue: {
      light: "#dbeafe",
      DEFAULT: "#3b82f6",
      dark: "#1e40af",
    },
    red: {
      light: "#fee2e2",
      DEFAULT: "#ef4444",
      dark: "#b91c1c",
    },
  },
  // Neutralios spalvos
  neutral: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#030712",
  },
  // Semantinės spalvos
  semantic: {
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },
  // Fono spalvos
  background: {
    light: "#f8fafc",
    DEFAULT: "#f1f5f9",
    dark: "#e2e8f0",
    paper: "#ffffff",
  },
}

// Šriftų dydžiai
export const typography = {
  fontFamily: {
    sans: "var(--font-sans)",
    heading: "var(--font-heading)",
  },
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    none: "1",
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },
}

// Atstumai
export const spacing = {
  0: "0",
  0.5: "0.125rem", // 2px
  1: "0.25rem", // 4px
  1.5: "0.375rem", // 6px
  2: "0.5rem", // 8px
  2.5: "0.625rem", // 10px
  3: "0.75rem", // 12px
  3.5: "0.875rem", // 14px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  7: "1.75rem", // 28px
  8: "2rem", // 32px
  9: "2.25rem", // 36px
  10: "2.5rem", // 40px
  11: "2.75rem", // 44px
  12: "3rem", // 48px
  14: "3.5rem", // 56px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  28: "7rem", // 112px
  32: "8rem", // 128px
  36: "9rem", // 144px
  40: "10rem", // 160px
  44: "11rem", // 176px
  48: "12rem", // 192px
  52: "13rem", // 208px
  56: "14rem", // 224px
  60: "15rem", // 240px
  64: "16rem", // 256px
  72: "18rem", // 288px
  80: "20rem", // 320px
  96: "24rem", // 384px
}

// Šešėliai
export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  none: "none",
}

// Užapvalinimai
export const borderRadius = {
  none: "0",
  sm: "0.125rem", // 2px
  DEFAULT: "0.25rem", // 4px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  "3xl": "1.5rem", // 24px
  full: "9999px",
}

// Animacijos
export const animations = {
  // Trukmės
  duration: {
    75: "75ms",
    100: "100ms",
    150: "150ms",
    200: "200ms",
    300: "300ms",
    500: "500ms",
    700: "700ms",
    1000: "1000ms",
  },
  // Easing funkcijos
  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    linear: "linear",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  // Iš anksto apibrėžtos animacijos
  keyframes: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    fadeOut: {
      from: { opacity: 1 },
      to: { opacity: 0 },
    },
    scaleIn: {
      from: { transform: "scale(0.95)", opacity: 0 },
      to: { transform: "scale(1)", opacity: 1 },
    },
    scaleOut: {
      from: { transform: "scale(1)", opacity: 1 },
      to: { transform: "scale(0.95)", opacity: 0 },
    },
    slideInFromTop: {
      from: { transform: "translateY(-10px)", opacity: 0 },
      to: { transform: "translateY(0)", opacity: 1 },
    },
    slideInFromBottom: {
      from: { transform: "translateY(10px)", opacity: 0 },
      to: { transform: "translateY(0)", opacity: 1 },
    },
    pulse: {
      "0%, 100%": { opacity: 1 },
      "50%": { opacity: 0.5 },
    },
    bounce: {
      "0%, 100%": { transform: "translateY(0)" },
      "50%": { transform: "translateY(-5px)" },
    },
    spin: {
      from: { transform: "rotate(0deg)" },
      to: { transform: "rotate(360deg)" },
    },
  },
}

// Z-indeksai
export const zIndices = {
  0: "0",
  10: "10",
  20: "20",
  30: "30",
  40: "40",
  50: "50", // Modaliniai langai
  auto: "auto",
}

// Perėjimai
export const transitions = {
  DEFAULT: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
  colors:
    "color, background-color, border-color, text-decoration-color, fill, stroke 150ms cubic-bezier(0.4, 0, 0.2, 1)",
  opacity: "opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)",
  shadow: "box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)",
  transform: "transform 150ms cubic-bezier(0.4, 0, 0.2, 1)",
}

// Žaidimo ikonos ir simboliai
export const gameIcons = {
  resources: {
    coins: "💰",
    grain: "🌾",
    fruit: "🍎",
    milk: "🥛",
    eggs: "🥚",
    meat: "🥩",
    experience: "✨",
  },
  buildings: {
    field: "🌱",
    barn: "🏚️",
    house: "🏠",
    storage: "🏪",
    market: "🏬",
    mill: "🏭",
  },
  animals: {
    cow: "🐄",
    chicken: "🐔",
    pig: "🐷",
    sheep: "🐑",
    horse: "🐎",
  },
  crops: {
    wheat: "🌾",
    corn: "🌽",
    tomato: "🍅",
    carrot: "🥕",
    potato: "🥔",
  },
  ui: {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
    star: "⭐",
    heart: "❤️",
    time: "⏱️",
    settings: "⚙️",
    user: "👤",
    crown: "👑",
  },
}
