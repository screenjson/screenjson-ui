/**
 * ScreenJSON TypeScript Types
 * Generated from schema.json (draft 2026-01)
 */

// ============================================================================
// Primitive Types
// ============================================================================

/** RFC4122 UUID string (8-4-4-4-12) */
export type UUID = string;

/** Lowercase sluggable identifier */
export type Slug = string;

/** ISO 8601 date-time */
export type DateTime = string;

/** BCP 47 language tag (e.g. en, en-GB, fr-CA) */
export type Lang = string;

/** Text direction */
export type Dir = 'ltr' | 'rtl';

/** IANA character set label */
export type Charset = string;

/** Arbitrary key/value metadata map */
export type Meta = Record<string, string>;

/** Translatable text keyed by language tag */
export type Text = Record<Lang, string>;

/** Short name/title keyed by language tag */
export type Name = Record<Lang, string>;

/** Access-control roles/groups */
export type Roles = Slug[];

/** List of slugs */
export type Tags = Slug[];

// ============================================================================
// Supporting Types
// ============================================================================

/** Reference to an external screenplay presentation standard */
export interface Format {
  id: Slug;
  title: string;
  url: string;
  note?: string;
  meta?: Meta;
}

/** A reusable UI color */
export interface Color {
  id: Slug;
  title?: Name;
  rgb: [number, number, number];
  hex: string;
  meta?: Meta;
}

/** An original writer of the content */
export interface Author {
  id: UUID;
  given: string;
  family: string;
  meta?: Meta;
}

/** Any third party who contributed artistically */
export interface Contributor {
  id: UUID;
  given: string;
  family: string;
  roles?: Roles;
  meta?: Meta;
}

/** A character entity referenced by cues/dialogue */
export interface Character {
  id: UUID;
  slug?: Slug;
  name: string;
  aliases?: string[];
  desc?: Text;
  traits?: Slug[];
  meta?: Meta;
}

/** A revision event/marker */
export interface Revision {
  id: UUID;
  parent?: UUID;
  index: number;
  authors: UUID[];
  label: string;
  created: DateTime;
  meta?: Meta;
}

/** An ancillary note attached to an object */
export interface Note {
  id: UUID;
  parent?: UUID;
  highlight?: [number, number][];
  contributor?: UUID;
  created: DateTime;
  text: Text;
  color?: Slug;
  meta?: Meta;
}

/** A source work this screenplay is based on */
export interface Source {
  id: UUID;
  type: Slug;
  title: Text;
  meta?: Meta;
}

/** Registration information (e.g. WGA) */
export interface Registration {
  authority: string;
  id: string;
  created?: DateTime;
  modified?: DateTime;
  meta?: Meta;
}

/** Encryption parameters */
export interface Encrypt {
  cipher: string;
  hash: string;
  encoding: 'hex' | 'base16' | 'base32' | 'base64' | 'ascii85';
  meta?: Meta;
}

/** Reusable presentation style rule */
export interface Style {
  id: Slug;
  default: boolean;
  text: string;
  meta?: Meta;
}

/** Reusable presentation template rule */
export interface Template {
  id: Slug;
  default: boolean;
  text: string;
  meta?: Meta;
}

/** A shortcut to a specific element within a scene */
export interface Bookmark {
  id: UUID;
  scene: UUID;
  element: UUID;
  title: Text;
  desc?: Text;
  meta?: Meta;
}

/** Structured scene heading (slugline) */
export interface Slugline {
  no?: number;
  context: 'I/E' | 'INT/EXT' | 'EXT/INT' | 'INT' | 'EXT' | 'POV';
  setting: string;
  time: string;
  mods?: string[];
  desc?: Text;
  meta?: Meta;
}

// ============================================================================
// Element Types
// ============================================================================

/** Common fields for all elements within a scene body */
export interface BaseElement {
  id: UUID;
  scene?: UUID;
  authors: UUID[];
  contributors?: UUID[];
  access?: Roles;
  notes?: Note[];
  charset?: Charset;
  dir?: Dir;
  class?: Slug;
  dom?: string;
  encrypt?: Encrypt;
  locked?: boolean;
  omit?: boolean;
  revisions?: Revision[];
  styles?: Slug[];
  meta?: Meta;
}

/** Action/stage direction element */
export interface ActionElement extends BaseElement {
  type: 'action';
  text: Text;
}

/** Shot element */
export interface ShotElement extends BaseElement {
  type: 'shot';
  text: Text;
  fov?: number;
  perspective?: '2D' | '3D';
}

/** Scene transition element */
export interface TransitionElement extends BaseElement {
  type: 'transition';
  text: Text;
}

/** General text element */
export interface GeneralElement extends BaseElement {
  type: 'general';
  text: Text;
}

/** Character cue element (speaker name) */
export interface CharacterCueElement extends BaseElement {
  type: 'character';
  character: UUID;
  display?: string;
}

/** Parenthetical direction within dialog */
export interface ParentheticalElement extends BaseElement {
  type: 'parenthetical';
  text: Text;
}

/** Dialogue text for a character */
export interface DialogueElement extends BaseElement {
  type: 'dialogue';
  character: UUID;
  origin?: 'V.O' | 'V.O.' | 'O.S' | 'O.S.' | 'O.C' | 'O.C.' | 'FILTER';
  dual?: boolean;
  text: Text;
}

/** Union of all element types */
export type SceneElement =
  | ActionElement
  | ShotElement
  | TransitionElement
  | GeneralElement
  | CharacterCueElement
  | ParentheticalElement
  | DialogueElement;

// ============================================================================
// Scene Type
// ============================================================================

/** A screenplay scene */
export interface Scene {
  id: UUID;
  authors: UUID[];
  contributors?: UUID[];
  heading: Slugline;
  body: SceneElement[];
  cast?: UUID[];
  animals?: Tags;
  extra?: Tags;
  locations?: Tags;
  moods?: Tags;
  props?: Tags;
  sfx?: Tags;
  sounds?: Tags;
  tags?: Tags;
  vfx?: Tags;
  wardrobe?: Tags;
  meta?: Meta;
}

// ============================================================================
// Document Structure Types
// ============================================================================

/** A repeating header or footer ribbon */
export interface Ribbon {
  cover: boolean;
  show: boolean;
  start?: number;
  omit?: number[];
  text: Text;
  meta?: Meta;
}

/** Script revision status */
export interface Status {
  color: 'white' | 'blue' | 'pink' | 'yellow' | 'green' | 'goldenrod' | 'buff' | 'salmon' | 'cherry';
  round: number;
  updated: DateTime;
  meta?: Meta;
}

/** License or copyright descriptor */
export interface License {
  id: string;
  ref?: string;
  meta?: Meta;
}

/** Cover page metadata */
export interface Cover {
  title: Name;
  authors: UUID[];
  sources?: UUID[];
  extra?: Text;
  meta?: Meta;
}

/** Optional rendering rules for viewers */
export interface Layout {
  header?: Ribbon;
  footer?: Ribbon;
  status?: Status;
  styles?: Style[];
  templates?: Template[];
  guides?: Format[];
  meta?: Meta;
}

/** The screenplay document container */
export interface Document {
  cover: Cover;
  layout?: Layout;
  bookmarks?: Bookmark[];
  scenes: Scene[];
  meta?: Meta;
}

// ============================================================================
// Analysis Types (Optional/Discardable)
// ============================================================================

/** A derived numeric representation for semantic search */
export interface Embedding {
  id: UUID;
  model: string;
  dimensions: number;
  values: number[];
  source: 'name' | 'text' | 'desc' | 'heading' | 'composite';
  lang?: Lang;
  tokens?: number;
  created: DateTime;
  meta?: Meta;
}

/** A derived passage of text used for retrieval */
export interface Passage {
  id: UUID;
  scene: UUID;
  elements: UUID[];
  text: Text;
  tokens: number;
  overlap?: number;
  meta?: Meta;
}

/** A derived summary */
export interface Summary {
  id: UUID;
  scope: 'document' | 'scene';
  target?: UUID | null;
  text: Text;
  generated?: boolean;
  model?: string;
  created: DateTime;
  meta?: Meta;
}

/** Derived machine-readable representations */
export interface Analysis {
  embeddings?: Record<UUID, Embedding[]>;
  passages?: Passage[];
  summaries?: Summary[];
  settings?: {
    model?: string;
    size?: number;
    overlap?: number;
    tokeniser?: string;
    meta?: Meta;
  };
  meta?: Meta;
}

// ============================================================================
// Root Document Type
// ============================================================================

/** Tool that generated this file */
export interface Generator {
  name: string;
  version: string;
  meta?: Meta;
}

/** Root ScreenJSON document type */
export interface ScreenJSONDocument {
  id: UUID;
  version: string;
  generator?: Generator;
  title: Name;
  lang: Lang;
  locale?: string;
  charset: Charset;
  dir: Dir;
  authors: Author[];
  contributors?: Contributor[];
  characters?: Character[];
  colors?: Color[];
  sources?: Source[];
  registrations?: Registration[];
  revisions?: Revision[];
  encrypt?: Encrypt | null;
  license?: License | null;
  taggable?: Slug[];
  genre?: Slug[];
  themes?: Slug[];
  logline?: Text;
  document: Document;
  analysis?: Analysis;
}

// ============================================================================
// Utility Types
// ============================================================================

/** Element type discriminator */
export type ElementType = SceneElement['type'];

/** Get element by type */
export type ElementByType<T extends ElementType> = Extract<SceneElement, { type: T }>;

/** Check if element has text property */
export function hasText(element: SceneElement): element is SceneElement & { text: Text } {
  return 'text' in element && element.text !== undefined;
}

/** Check if element has character property */
export function hasCharacter(element: SceneElement): element is SceneElement & { character: UUID } {
  return 'character' in element && element.character !== undefined;
}

/** Get text in specified language with fallback */
export function getText(text: Text | undefined, lang: Lang, fallback: Lang = 'en'): string {
  if (!text) return '';
  return text[lang] ?? text[fallback] ?? Object.values(text)[0] ?? '';
}

/** Get available languages from a Text object */
export function getAvailableLanguages(text: Text | undefined): Lang[] {
  if (!text) return [];
  return Object.keys(text);
}
