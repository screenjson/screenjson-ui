/**
 * Pagination Engine
 * Handles breaking screenplay content into 60-line pages
 * with proper CONTINUED/MORE handling
 */

import type {
  ScreenJSONDocument,
  Scene,
  SceneElement,
  Lang,
  Text,
  Character
} from '../types/screenjson';
import { getText } from '../types/screenjson';
import {
  MAX_LINES_PER_PAGE,
  HEADER_LINES,
  FOOTER_LINES,
  SPACING,
  estimateLines,
  type ElementMarginType
} from '../constants/formatting';

// ============================================================================
// Types
// ============================================================================

/** A rendered element with pagination metadata */
export interface PaginatedElement {
  /** Original element */
  element: SceneElement;
  /** Text content in current language */
  text: string;
  /** Element type for styling */
  type: SceneElement['type'];
  /** Character name for dialogue/cue */
  characterName?: string;
  /** Number of lines this element takes */
  lines: number;
  /** Whether this is a continuation from previous page */
  isContinued: boolean;
  /** Whether this continues on next page */
  hasMore: boolean;
  /** Scene ID this belongs to */
  sceneId: string;
  /** Original scene heading (for first element of scene) */
  sceneHeading?: string;
  /** Scene number */
  sceneNumber?: number;
}

/** A single page of content */
export interface Page {
  /** Page number (1-indexed) */
  number: number;
  /** Elements on this page */
  elements: PaginatedElement[];
  /** Whether this page starts with CONTINUED: */
  hasContinuedHeader: boolean;
  /** Whether this page ends with (CONTINUED) */
  hasContinuedFooter: boolean;
  /** Total lines used on this page */
  totalLines: number;
}

/** Pagination result */
export interface PaginationResult {
  /** All pages */
  pages: Page[];
  /** Total page count */
  totalPages: number;
  /** Document metadata */
  document: ScreenJSONDocument;
  /** Current language */
  lang: Lang;
}

// ============================================================================
// Helper Functions
// ============================================================================

/** Get element margin type for line estimation */
function getMarginType(type: SceneElement['type']): ElementMarginType {
  switch (type) {
    case 'dialogue':
      return 'dialogue';
    case 'character':
      return 'character';
    case 'parenthetical':
      return 'parenthetical';
    case 'transition':
      return 'transition';
    case 'action':
    case 'shot':
    case 'general':
    default:
      return 'action';
  }
}

/** Get spacing before an element */
function getSpacingBefore(
  type: SceneElement['type'],
  isFirstInScene: boolean
): number {
  if (isFirstInScene) {
    return SPACING.beforeSlugline;
  }
  
  switch (type) {
    case 'character':
      return SPACING.beforeCharacter;
    case 'transition':
      return SPACING.beforeTransition;
    default:
      return 0;
  }
}

/** Format scene heading from slugline */
function formatSceneHeading(scene: Scene): string {
  const { heading } = scene;
  const parts = [heading.context, heading.setting];
  
  if (heading.time) {
    parts.push('-', heading.time);
  }
  
  if (heading.mods && heading.mods.length > 0) {
    parts.push('-', heading.mods.join(' - '));
  }
  
  return parts.join(' ');
}

/** Get character name by ID */
function getCharacterName(
  characterId: string,
  characters: Character[]
): string {
  const character = characters.find((c) => c.id === characterId);
  return character?.name ?? 'UNKNOWN';
}

/** Get text content from an element */
function getElementText(element: SceneElement, lang: Lang): string {
  if ('text' in element && element.text) {
    return getText(element.text as Text, lang);
  }
  if ('display' in element && element.display) {
    return element.display;
  }
  return '';
}

/** Break text at sentence boundary */
function breakAtSentence(text: string, targetLines: number, marginType: ElementMarginType): {
  first: string;
  rest: string;
} | null {
  // Find sentence endings
  const sentenceEnds = [...text.matchAll(/[.!?]["']?\s+/g)];
  
  if (sentenceEnds.length === 0) {
    return null; // Can't break at sentence
  }
  
  // Estimate where the break should occur
  let bestBreak = -1;
  let bestLines = 0;
  
  for (const match of sentenceEnds) {
    const breakPoint = match.index! + match[0].length;
    const firstPart = text.substring(0, breakPoint).trim();
    const lines = estimateLines(firstPart, marginType);
    
    if (lines <= targetLines && lines > bestLines) {
      bestBreak = breakPoint;
      bestLines = lines;
    }
  }
  
  if (bestBreak === -1) {
    return null;
  }
  
  return {
    first: text.substring(0, bestBreak).trim(),
    rest: text.substring(bestBreak).trim()
  };
}

// ============================================================================
// Paginator Class
// ============================================================================

export class Paginator {
  private document: ScreenJSONDocument;
  private lang: Lang;
  private characters: Map<string, string>;
  
  constructor(document: ScreenJSONDocument, lang?: Lang) {
    this.document = document;
    this.lang = lang ?? document.lang ?? 'en';
    
    // Build character lookup map
    this.characters = new Map();
    for (const char of document.characters ?? []) {
      this.characters.set(char.id, char.name);
    }
  }
  
  /** Get available lines on a page (accounting for headers/footers) */
  private getAvailableLines(hasContinuedHeader: boolean, hasContinuedFooter: boolean): number {
    let available = MAX_LINES_PER_PAGE;
    
    if (hasContinuedHeader) {
      available -= HEADER_LINES;
    }
    
    if (hasContinuedFooter) {
      available -= FOOTER_LINES;
    }
    
    return available;
  }
  
  /** Paginate the entire document */
  paginate(): PaginationResult {
    const pages: Page[] = [];
    let currentPage: Page = {
      number: 1,
      elements: [],
      hasContinuedHeader: false,
      hasContinuedFooter: false,
      totalLines: 0
    };
    
    const scenes = this.document.document.scenes;
    
    for (let sceneIndex = 0; sceneIndex < scenes.length; sceneIndex++) {
      const scene = scenes[sceneIndex];
      const isFirstScene = sceneIndex === 0;
      
      // Process scene heading
      const headingText = formatSceneHeading(scene);
      const headingLines = estimateLines(headingText, 'action');
      const headingSpacing = isFirstScene ? 0 : SPACING.beforeSlugline;
      const totalHeadingLines = headingLines + headingSpacing + SPACING.afterSlugline;
      
      // Check if heading fits on current page
      const availableForHeading = this.getAvailableLines(
        currentPage.hasContinuedHeader,
        false
      ) - currentPage.totalLines;
      
      // A slugline should never be alone at the bottom of a page
      // Require at least 3 lines for heading + some content
      if (availableForHeading < totalHeadingLines + 3) {
        // Start new page
        currentPage.hasContinuedFooter = false;
        pages.push(currentPage);
        currentPage = {
          number: pages.length + 1,
          elements: [],
          hasContinuedHeader: false,
          hasContinuedFooter: false,
          totalLines: 0
        };
      }
      
      // Add scene heading as a virtual element
      currentPage.totalLines += headingSpacing;
      
      // Process scene body elements
      for (let elemIndex = 0; elemIndex < scene.body.length; elemIndex++) {
        const element = scene.body[elemIndex];
        const isFirstInScene = elemIndex === 0;
        
        // Get element text and calculate lines
        let text = getElementText(element, this.lang);
        const marginType = getMarginType(element.type);
        let lines = estimateLines(text, marginType);
        const spacing = isFirstInScene ? 0 : getSpacingBefore(element.type, false);
        const totalLines = lines + spacing;
        
        // Get character name for dialogue/cue elements
        let characterName: string | undefined;
        if (element.type === 'character' || element.type === 'dialogue') {
          const charId = 'character' in element ? element.character : undefined;
          if (charId) {
            characterName = this.characters.get(charId) ?? 'UNKNOWN';
          }
        }
        
        // Check if element fits on current page
        const available = this.getAvailableLines(
          currentPage.hasContinuedHeader,
          true // Reserve space for CONTINUED footer
        ) - currentPage.totalLines;
        
        if (totalLines <= available) {
          // Element fits entirely
          currentPage.totalLines += spacing;
          currentPage.elements.push({
            element,
            text,
            type: element.type,
            characterName,
            lines,
            isContinued: false,
            hasMore: false,
            sceneId: scene.id,
            sceneHeading: isFirstInScene ? headingText : undefined,
            sceneNumber: isFirstInScene ? scene.heading.no : undefined
          });
          currentPage.totalLines += lines;
        } else {
          // Need to break or move to next page
          
          // For dialogue and action, try to break at sentence boundary
          if ((element.type === 'dialogue' || element.type === 'action') && available >= 3) {
            const breakResult = breakAtSentence(text, available - spacing, marginType);
            
            if (breakResult && breakResult.rest) {
              // Add first part to current page with (MORE)
              currentPage.totalLines += spacing;
              currentPage.elements.push({
                element,
                text: breakResult.first,
                type: element.type,
                characterName,
                lines: estimateLines(breakResult.first, marginType),
                isContinued: false,
                hasMore: true,
                sceneId: scene.id,
                sceneHeading: isFirstInScene ? headingText : undefined,
                sceneNumber: isFirstInScene ? scene.heading.no : undefined
              });
              
              // Mark page as having CONTINUED
              currentPage.hasContinuedFooter = true;
              pages.push(currentPage);
              
              // Start new page with continuation
              currentPage = {
                number: pages.length + 1,
                elements: [],
                hasContinuedHeader: true,
                hasContinuedFooter: false,
                totalLines: HEADER_LINES
              };
              
              // Add rest of text as continuation
              text = breakResult.rest;
              lines = estimateLines(text, marginType);
              
              // For dialogue, repeat character name with (CONT'D)
              if (element.type === 'dialogue' && characterName) {
                currentPage.elements.push({
                  element,
                  text,
                  type: element.type,
                  characterName: `${characterName} (CONT'D)`,
                  lines,
                  isContinued: true,
                  hasMore: false,
                  sceneId: scene.id
                });
              } else {
                currentPage.elements.push({
                  element,
                  text,
                  type: element.type,
                  characterName,
                  lines,
                  isContinued: true,
                  hasMore: false,
                  sceneId: scene.id
                });
              }
              currentPage.totalLines += lines;
              continue;
            }
          }
          
          // Can't break - move entire element to next page
          currentPage.hasContinuedFooter = true;
          pages.push(currentPage);
          
          currentPage = {
            number: pages.length + 1,
            elements: [],
            hasContinuedHeader: true,
            hasContinuedFooter: false,
            totalLines: HEADER_LINES
          };
          
          currentPage.elements.push({
            element,
            text,
            type: element.type,
            characterName,
            lines,
            isContinued: false,
            hasMore: false,
            sceneId: scene.id,
            sceneHeading: isFirstInScene ? headingText : undefined,
            sceneNumber: isFirstInScene ? scene.heading.no : undefined
          });
          currentPage.totalLines += lines;
        }
      }
    }
    
    // Don't forget the last page
    if (currentPage.elements.length > 0) {
      currentPage.hasContinuedFooter = false;
      pages.push(currentPage);
    }
    
    return {
      pages,
      totalPages: pages.length,
      document: this.document,
      lang: this.lang
    };
  }
  
  /** Get page for a specific scene */
  getPageForScene(sceneId: string): number | null {
    const result = this.paginate();
    
    for (const page of result.pages) {
      for (const element of page.elements) {
        if (element.sceneId === sceneId) {
          return page.number;
        }
      }
    }
    
    return null;
  }
  
  /** Get page for a specific element */
  getPageForElement(elementId: string): number | null {
    const result = this.paginate();
    
    for (const page of result.pages) {
      for (const element of page.elements) {
        if (element.element.id === elementId) {
          return page.number;
        }
      }
    }
    
    return null;
  }
}

/** Create a paginator for a document */
export function createPaginator(document: ScreenJSONDocument, lang?: Lang): Paginator {
  return new Paginator(document, lang);
}

/** Quick paginate function */
export function paginate(document: ScreenJSONDocument, lang?: Lang): PaginationResult {
  const paginator = new Paginator(document, lang);
  return paginator.paginate();
}
