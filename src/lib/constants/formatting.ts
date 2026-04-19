/**
 * Screenplay Formatting Constants
 * Based on Warner Bros/Final Draft standard
 */

// Page dimensions (US Letter)
export const PAGE_WIDTH_INCHES = 8.5;
export const PAGE_HEIGHT_INCHES = 11;

// Page dimensions in pixels at 96 DPI
export const DPI = 96;
export const PAGE_WIDTH_PX = PAGE_WIDTH_INCHES * DPI; // 816px
export const PAGE_HEIGHT_PX = PAGE_HEIGHT_INCHES * DPI; // 1056px

// Font specifications
export const FONT_SIZE_PT = 12;
export const FONT_SIZE_PX = FONT_SIZE_PT * (DPI / 72); // 16px at 96 DPI
export const CHARS_PER_INCH = 10; // Fixed-pitch Courier
export const LINES_PER_INCH = 6;

// Maximum lines per page (content only)
export const MAX_LINES_PER_PAGE = 60;

// Lines reserved for page headers/footers
export const HEADER_LINES = 2; // Page number + blank line
export const FOOTER_LINES = 1; // CONTINUED line

// Margin specifications (in inches)
export const MARGINS = {
  // Page margins
  page: {
    top: 0.5,
    bottom: 0.5,
    left: 1.5,
    right: 1.0
  },
  
  // Action/stage direction and slug lines
  action: {
    left: 1.7,
    right: 1.1
  },
  
  // Dialog text
  dialogue: {
    left: 2.7,
    right: 2.4
  },
  
  // Character name (speaker cue)
  character: {
    left: 4.1,
    right: 0
  },
  
  // Parenthetical direction
  parenthetical: {
    left: 3.4,
    right: 3.1
  },
  
  // Scene transitions (CUT TO:, FADE OUT., etc.)
  transition: {
    left: 6.0,
    right: 0
  },
  
  // Scene numbers
  sceneNumber: {
    left: 1.0,
    right: 7.4 // from left edge
  }
} as const;

// Convert inches to pixels
export function inchesToPx(inches: number): number {
  return inches * DPI;
}

// Convert inches to percentage of page width
export function inchesToPercent(inches: number): number {
  return (inches / PAGE_WIDTH_INCHES) * 100;
}

// Blank lines before/after elements
export const SPACING = {
  // Before slug line
  beforeSlugline: 2,
  
  // After slug line
  afterSlugline: 1,
  
  // Before character name
  beforeCharacter: 1,
  
  // Before transition
  beforeTransition: 1,
  
  // After transition
  afterTransition: 2,
  
  // Normal paragraph spacing
  paragraph: 1
} as const;

// Element type identifiers
export type ElementMarginType = 
  | 'action'
  | 'dialogue'
  | 'character'
  | 'parenthetical'
  | 'transition';

// Get margins for an element type
export function getMarginsForElement(type: ElementMarginType) {
  return MARGINS[type];
}

// Calculate available width for text (in characters)
export function getTextWidth(type: ElementMarginType): number {
  const margins = MARGINS[type];
  const availableInches = PAGE_WIDTH_INCHES - margins.left - margins.right;
  return Math.floor(availableInches * CHARS_PER_INCH);
}

// Line height in pixels
export const LINE_HEIGHT_PX = PAGE_HEIGHT_PX / (LINES_PER_INCH * PAGE_HEIGHT_INCHES);

// Estimate lines for a text block
export function estimateLines(text: string, type: ElementMarginType): number {
  const width = getTextWidth(type);
  if (width <= 0) return 1;
  
  const words = text.split(/\s+/);
  let lines = 1;
  let currentLineLength = 0;
  
  for (const word of words) {
    const wordLength = word.length + 1; // +1 for space
    
    if (currentLineLength + wordLength > width) {
      lines++;
      currentLineLength = word.length;
    } else {
      currentLineLength += wordLength;
    }
  }
  
  return lines;
}

// CSS styles for each element type (for inline styles)
export const ELEMENT_STYLES = {
  action: {
    marginLeft: `${MARGINS.action.left}in`,
    marginRight: `${MARGINS.action.right}in`
  },
  dialogue: {
    marginLeft: `${MARGINS.dialogue.left}in`,
    marginRight: `${MARGINS.dialogue.right}in`
  },
  character: {
    marginLeft: `${MARGINS.character.left}in`,
    textTransform: 'uppercase' as const
  },
  parenthetical: {
    marginLeft: `${MARGINS.parenthetical.left}in`,
    marginRight: `${MARGINS.parenthetical.right}in`
  },
  transition: {
    marginLeft: `${MARGINS.transition.left}in`,
    textTransform: 'uppercase' as const
  },
  slugline: {
    marginLeft: `${MARGINS.action.left}in`,
    marginRight: `${MARGINS.action.right}in`,
    textTransform: 'uppercase' as const,
    fontWeight: 'bold' as const
  }
} as const;
