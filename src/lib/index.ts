import '../app.css';
/**
 * ScreenJSON-UI Library
 * An embeddable document viewer for ScreenJSON screenplay files
 */

// Embedding API
export { ScreenJSONUI, type ScreenJSONUIConfig } from './embed';
// Re-export embed's real `default` (not `export { ScreenJSONUI as default }`): Safari /
// WKWebView reject mixing that form with `export *` in the same module ("default cannot
// be resolved by star export entries"). `embed.ts` ends with `export default ScreenJSONUI`.
export { default } from './embed';

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

// Element components (explicit re-exports: avoid `export *` in this barrel — Safari /
// WKWebView mishandle `default` resolution when star re-exports share the module graph.)
export {
  Action,
  Character,
  Dialogue,
  General,
  Parenthetical,
  Shot,
  Slugline,
  Transition,
  ElementRenderer
} from './components/elements';

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

export { collectDocumentLanguages, getLanguageOption, getLanguageOptions, getUiStrings } from './i18n/languages';
export type { LanguageOption, UiStrings } from './i18n/languages';

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
export type { UserBookmark, UserNote } from './services/bookmarks';
export {
  getBookmarks,
  addBookmark,
  updateBookmark,
  deleteBookmark,
  getBookmarksForScene,
  getNotes,
  addNote,
  updateNote,
  deleteNote,
  getNotesForElement,
  getNotesForScene,
  exportUserData,
  importUserData,
  clearUserData
} from './services/bookmarks';

// Stores
export { themeStore, settingsStore, documentStore } from './stores';
export type { Theme } from './stores';

// Constants
export type { ElementMarginType } from './constants/formatting';
export {
  PAGE_WIDTH_INCHES,
  PAGE_HEIGHT_INCHES,
  DPI,
  PAGE_WIDTH_PX,
  PAGE_HEIGHT_PX,
  FONT_SIZE_PT,
  FONT_SIZE_PX,
  CHARS_PER_INCH,
  LINES_PER_INCH,
  MAX_LINES_PER_PAGE,
  HEADER_LINES,
  FOOTER_LINES,
  MARGINS,
  inchesToPx,
  inchesToPercent,
  SPACING,
  getMarginsForElement,
  getTextWidth,
  LINE_HEIGHT_PX,
  estimateLines,
  ELEMENT_STYLES
} from './constants/formatting';
