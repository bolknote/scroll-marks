/**
 * ScrollMarks - A library to colorize the scrollbar based on element positions
 * @module scroll-marks
 */

// Private data storage via WeakMap (isolation)
const privateData = new WeakMap();

/**
 * Creates a debounced version of a function using rAF
 * @param {Function} fn 
 * @returns {Function}
 */
function debounce(fn) {
  let timeoutId = null;
  return function(...args) {
    if (timeoutId) {
      cancelAnimationFrame(timeoutId);
    }
    timeoutId = requestAnimationFrame(() => {
      fn.apply(this, args);
      timeoutId = null;
    });
  };
}

/**
 * Generates a unique ID
 * @returns {string}
 */
function generateId() {
  return 'scrollmarks-' + Math.random().toString(36).substr(2, 9);
}

/**
 * @typedef {Object} ScrollMarksOptions
 * @property {HTMLElement} [container] - Container element to track
 * @property {string} [trackColor='#1a1a2e'] - Base color of the scrollbar track
 * @property {string} [thumbColor='rgba(255,255,255,0.3)'] - Scrollbar thumb color
 * @property {string} [selector='[data-scroll-color]'] - CSS selector to find marked elements
 * @property {string} [attributeName='data-scroll-color'] - Data attribute name containing the color
 * @property {number} [scrollbarWidth=14] - Scrollbar width in pixels
 */

/**
 * @typedef {Object} ColorMark
 * @property {number} start - Start position in percentage
 * @property {number} end - End position in percentage
 * @property {string} color - CSS color value
 */

/**
 * ScrollMarks - Main library class
 */
export class ScrollMarks {
  /**
   * Library version (injected at build time)
   * @type {string}
   */
  static VERSION = '__VERSION__';

  /**
   * @param {ScrollMarksOptions} [options={}]
   */
  constructor(options = {}) {
    const config = {
      container: options.container || document.documentElement,
      trackColor: options.trackColor || '#1a1a2e',
      thumbColor: options.thumbColor || 'rgba(255,255,255,0.3)',
      selector: options.selector || '[data-scroll-color]',
      attributeName: options.attributeName || 'data-scroll-color',
      scrollbarWidth: options.scrollbarWidth || 14
    };

    const state = {
      id: generateId(),
      styleElement: null,
      resizeObserver: null,
      mutationObserver: null,
      isDestroyed: false,
      boundUpdate: null,
      marks: []
    };

    privateData.set(this, { config, state });
    this._init();
  }

  /**
   * Initialize the library
   * @private
   */
  _init() {
    const { config, state } = privateData.get(this);

    // Create isolated style element
    state.styleElement = document.createElement('style');
    state.styleElement.id = state.id;
    state.styleElement.setAttribute('data-scrollmarks', '');
    document.head.appendChild(state.styleElement);

    // Debounced update
    state.boundUpdate = debounce(() => this.update());

    // ResizeObserver to track element size changes
    if (typeof ResizeObserver !== 'undefined') {
      state.resizeObserver = new ResizeObserver(state.boundUpdate);
      this._observeElements();
    }

    // MutationObserver to track DOM changes
    if (typeof MutationObserver !== 'undefined') {
      state.mutationObserver = new MutationObserver((mutations) => {
        const shouldUpdate = mutations.some(m => 
          m.type === 'childList' || 
          (m.type === 'attributes' && m.attributeName === config.attributeName)
        );
        
        if (shouldUpdate) {
          this._observeElements();
          state.boundUpdate();
        }
      });

      state.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: [config.attributeName]
      });
    }

    // Listen to window resize
    window.addEventListener('resize', state.boundUpdate, { passive: true });

    // Initial render
    this.update();
  }

  /**
   * Subscribe to element size changes
   * @private
   */
  _observeElements() {
    const { config, state } = privateData.get(this);
    if (!state.resizeObserver) return;

    document.querySelectorAll(config.selector).forEach(el => {
      state.resizeObserver.observe(el);
    });
  }

  /**
   * Get total document height
   * @private
   * @returns {number}
   */
  _getScrollHeight() {
    return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
  }

  /**
   * Get viewport height
   * @private
   * @returns {number}
   */
  _getViewportHeight() {
    return window.innerHeight;
  }

  /**
   * Collect information about all marks
   * @private
   * @returns {ColorMark[]}
   */
  _collectMarks() {
    const { config } = privateData.get(this);
    const elements = document.querySelectorAll(config.selector);
    const totalHeight = this._getScrollHeight();
    const marks = [];

    if (totalHeight <= 0) return marks;

    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      const top = rect.top + scrollTop;
      const height = rect.height;
      const color = el.getAttribute(config.attributeName);
      
      if (!color) return;

      const startPercent = Math.max(0, (top / totalHeight) * 100);
      const endPercent = Math.min(100, ((top + height) / totalHeight) * 100);
      
      if (startPercent < endPercent) {
        marks.push({
          start: startPercent,
          end: endPercent,
          color: color.trim()
        });
      }
    });

    return marks.sort((a, b) => a.start - b.start);
  }

  /**
   * Build CSS gradient from marks
   * @private
   * @param {ColorMark[]} marks
   * @returns {string}
   */
  _buildGradient(marks) {
    const { config } = privateData.get(this);

    if (marks.length === 0) {
      return config.trackColor;
    }

    const stops = [];
    let lastEnd = 0;

    for (const mark of marks) {
      if (mark.start > lastEnd + 0.01) {
        stops.push(`${config.trackColor} ${lastEnd.toFixed(2)}%`);
        stops.push(`${config.trackColor} ${mark.start.toFixed(2)}%`);
      }
      
      stops.push(`${mark.color} ${mark.start.toFixed(2)}%`);
      stops.push(`${mark.color} ${mark.end.toFixed(2)}%`);
      
      lastEnd = mark.end;
    }

    if (lastEnd < 99.99) {
      stops.push(`${config.trackColor} ${lastEnd.toFixed(2)}%`);
      stops.push(`${config.trackColor} 100%`);
    }

    return `linear-gradient(to bottom, ${stops.join(', ')})`;
  }

  /**
   * Apply styles to the page
   * @private
   * @param {string} gradient
   */
  _applyStyles(gradient) {
    const { config, state } = privateData.get(this);
    if (!state.styleElement) return;

    const w = config.scrollbarWidth;

    state.styleElement.textContent = `
::-webkit-scrollbar {
  width: ${w}px;
}
::-webkit-scrollbar-track {
  background: ${gradient};
}
::-webkit-scrollbar-thumb {
  background: ${config.thumbColor};
  border-radius: ${Math.floor(w / 2)}px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}`;
  }

  /**
   * Update the scrollbar
   */
  update() {
    const data = privateData.get(this);
    if (!data) return; // Already destroyed
    
    const { state } = data;
    if (state.isDestroyed) return;

    if (this._getScrollHeight() <= this._getViewportHeight()) {
      if (state.styleElement) state.styleElement.textContent = '';
      return;
    }

    state.marks = this._collectMarks();
    this._applyStyles(this._buildGradient(state.marks));
  }

  /**
   * Get current marks
   * @returns {ColorMark[]}
   */
  getMarks() {
    const data = privateData.get(this);
    if (!data) return [];
    return [...data.state.marks];
  }

  /**
   * Get instance ID
   * @returns {string}
   */
  getId() {
    const data = privateData.get(this);
    if (!data) return '';
    return data.state.id;
  }

  /**
   * Destroy instance and release resources
   */
  destroy() {
    const data = privateData.get(this);
    if (!data) return; // Already destroyed
    
    const { state } = data;
    if (state.isDestroyed) return;
    
    state.isDestroyed = true;

    state.styleElement?.parentNode?.removeChild(state.styleElement);
    state.resizeObserver?.disconnect();
    state.mutationObserver?.disconnect();
    
    if (state.boundUpdate) {
      window.removeEventListener('resize', state.boundUpdate);
    }

    privateData.delete(this);
  }

  /**
   * Auto-initialize if body has data-scrollmarks-auto attribute
   * @returns {ScrollMarks|null}
   */
  static autoInit() {
    if (typeof document === 'undefined') return null;
    
    const body = document.body;
    if (!body?.hasAttribute('data-scrollmarks-auto')) return null;

    return new ScrollMarks({
      trackColor: body.dataset.scrollmarksTrack,
      thumbColor: body.dataset.scrollmarksThumb,
      scrollbarWidth: body.dataset.scrollmarksWidth 
        ? parseInt(body.dataset.scrollmarksWidth, 10) 
        : undefined
    });
  }
}

export default ScrollMarks;
