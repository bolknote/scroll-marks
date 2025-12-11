/**
 * ScrollMarks - A library to colorize the scrollbar based on element positions
 * @version 1.0.0
 */

export interface ScrollMarksOptions {
  /** Container element to track (defaults to document.documentElement) */
  container?: HTMLElement;
  /** Base color of the scrollbar track */
  trackColor?: string;
  /** Scrollbar thumb color */
  thumbColor?: string;
  /** CSS selector to find marked elements */
  selector?: string;
  /** Data attribute name containing the color */
  attributeName?: string;
  /** Scrollbar width in pixels */
  scrollbarWidth?: number;
}

export interface ColorMark {
  /** Start position in percentage (0-100) */
  start: number;
  /** End position in percentage (0-100) */
  end: number;
  /** CSS color value */
  color: string;
}

export class ScrollMarks {
  /** Library version */
  static readonly VERSION: string;

  /**
   * Auto-initialize if body has data-scrollmarks-auto attribute
   */
  static autoInit(): ScrollMarks | null;

  /**
   * Create a new ScrollMarks instance
   */
  constructor(options?: ScrollMarksOptions);

  /**
   * Force update the scrollbar
   */
  update(): void;

  /**
   * Get current color marks
   */
  getMarks(): ColorMark[];

  /**
   * Get unique instance ID
   */
  getId(): string;

  /**
   * Destroy instance and release resources
   */
  destroy(): void;
}

export default ScrollMarks;
