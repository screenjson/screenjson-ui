import '../app.css';
/**
 * ScreenJSON-UI Library
 * An embeddable document viewer for ScreenJSON screenplay files
 */

// Embedding API
export { ScreenJSONUI, type ScreenJSONUIConfig } from './embed';
export { ScreenJSONUI as default } from './embed';

// Components
export { default as ScreenJSONViewer } from './components/Viewer.svelte';
export { default as ViewerVirtual } from './components/ViewerVirtual.svelte';
export { default as Page } from './components/Page.svelte';
export { default as TitlePage } from './components/TitlePage.svelte';
export { default as Menu } from './components/Menu.svelte';
export { default as ErrorDisplay } from './components/ErrorDisplay.svelte';
export { default as PasswordModal } from './components/PasswordModal.svelte';
export { default as MetadataPanel } from './components/MetadataPanel.svelte';
export { default as VirtualScroller } from './components/VirtualScroller.svelte';

// Element components
export * from './components/elements';

// Types
export type {
  ScreenJSONDocument,
  Scene,
  SceneElement,
  ActionElement,
  DialogueElement,
  CharacterCueElement,
  ParentheticalElement,
  TransitionElement,
  ShotElement,
  GeneralElement,
  Slugline,
  Author,
  Character,
  Bookmark,
  Note,
  Lang,
  Text,
  Name,
  UUID
} from './types/screenjson';

export { getText, getAvailableLanguages, hasText, hasCharacter } from './types/screenjson';

// Services
export { DocumentLoader, loader, loadFromUrl } from './services/loader';
export type { LoadResult, LoaderOptions } from './services/loader';

export { Paginator, paginate, createPaginator } from './services/paginator';
export type { Page as PageData, PaginatedElement, PaginationResult } from './services/paginator';

export { validateDocument, isScreenJSONDocument, formatValidationErrors } from './validation/validator';
export type { ValidationResult, ValidationError } from './validation/validator';

export type { LoaderError } from './services/errors';
export { ErrorCode } from './services/errors';

// Crypto
export { hasEncryptedContent, decryptDocument, decryptText } from './services/crypto';

// Bookmarks
export * from './services/bookmarks';

// Stores
export { themeStore, settingsStore, documentStore } from './stores';
export type { Theme } from './stores';

// Constants
export * from './constants/formatting';
