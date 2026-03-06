import { Dimensions } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── Screen ────────────────────────────────────────────────────────────────────
export const SCREEN = { W: SCREEN_W, H: SCREEN_H } as const;

// ── Scanner Frame ─────────────────────────────────────────────────────────────
export const SCAN_BOX = {
  WIDTH:  SCREEN_W * 0.82,
  get HEIGHT() { return this.WIDTH * 1.42; }, // A4-ish ratio
  CORNER: 28,
} as const;

// ── Palette ───────────────────────────────────────────────────────────────────
export const COLORS = {
  bg:        '#0A0C10',
  surface:   '#12151C',
  border:    '#1E2330',
  accent:    '#00E5C8',
  accentDim: '#00B89F',
  warn:      '#FFB830',
  danger:    '#FF4D6A',
  text:      '#E8EDF5',
  muted:     '#5A6478',
  overlay:   'rgba(10,12,16,0.85)',
} as const;

export type ColorKey = keyof typeof COLORS;

// ── Animation Durations (ms) ──────────────────────────────────────────────────
export const DURATION = {
  SHUTTER_PRESS:    80,
  REVIEW_ENTER:    350,
  LASER_SWEEP:    1800,
  SPINNER_ROTATE: 1200,
  PROGRESS_FILL:  2800,
  SUCCESS_SHOW:    250,
  SUCCESS_AUTO_DISMISS: 2200,
  BLINK:           500,
  STEP_ADVANCE:    600,
} as const;

// ── Image Validation ──────────────────────────────────────────────────────────
export const IMAGE_CONSTRAINTS = {
  MIN_BYTES:      10_000,         // 10 KB  – too small = likely corrupt
  MAX_BYTES:      15_000_000,     // 15 MB  – protect upload bandwidth
  MIN_DIMENSION:  480,            // px     – must be legible
  ALLOWED_TYPES:  ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  CAPTURE_QUALITY: 0.92,
} as const;

// ── Upload ────────────────────────────────────────────────────────────────────
export const UPLOAD = {
  MAX_RETRIES:     2,
  FIELD_NAME:      'bill',
  FILE_NAME:       'bill.jpg',
  MIME_TYPE:       'image/jpeg',
} as const;

// ── Scanning step labels ──────────────────────────────────────────────────────
export const SCAN_STEPS = [
  'Uploading image…',
  'Detecting bill edges…',
  'Extracting line items…',
  'Parsing amounts…',
  'Finalizing…',
] as const;

export type ScanStep = typeof SCAN_STEPS[number];

// ── Review checklist ──────────────────────────────────────────────────────────
export const REVIEW_CHECKS = [
  'Text is legible',
  'All edges visible',
  'No glare or blur',
] as const;