import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ScrollMarks } from '../src/scroll-marks.js';

describe('ScrollMarks', () => {
  let scrollMark;
  
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    
    // Mock window dimensions
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
    Object.defineProperty(document.body, 'scrollHeight', { value: 2000, writable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, writable: true });
  });

  afterEach(() => {
    if (scrollMark) {
      scrollMark.destroy();
      scrollMark = null;
    }
  });

  describe('constructor', () => {
    it('should create instance with default options', () => {
      scrollMark = new ScrollMarks();
      
      expect(scrollMark).toBeInstanceOf(ScrollMarks);
      expect(scrollMark.getId()).toMatch(/^scrollmarks-[a-z0-9]+$/);
    });

    it('should create instance with custom options', () => {
      scrollMark = new ScrollMarks({
        trackColor: '#000000',
        thumbColor: '#ffffff',
        scrollbarWidth: 20
      });
      
      expect(scrollMark).toBeInstanceOf(ScrollMarks);
    });

    it('should inject style element into head', () => {
      scrollMark = new ScrollMarks();
      
      const styleEl = document.querySelector('style[data-scrollmarks]');
      expect(styleEl).not.toBeNull();
      expect(styleEl.id).toBe(scrollMark.getId());
    });
  });

  describe('VERSION', () => {
    it('should have a version string', () => {
      expect(ScrollMarks.VERSION).toBeDefined();
      expect(typeof ScrollMarks.VERSION).toBe('string');
    });
  });

  describe('getMarks', () => {
    it('should return empty array when no marked elements', () => {
      scrollMark = new ScrollMarks();
      
      expect(scrollMark.getMarks()).toEqual([]);
    });

    it('should return marks for elements with data-scroll-color', () => {
      // Add marked element
      const section = document.createElement('div');
      section.setAttribute('data-scroll-color', '#ff0000');
      section.style.height = '200px';
      document.body.appendChild(section);

      // Mock getBoundingClientRect
      section.getBoundingClientRect = () => ({
        top: 100,
        height: 200,
        left: 0,
        right: 100,
        bottom: 300,
        width: 100
      });

      scrollMark = new ScrollMarks();
      scrollMark.update();
      
      const marks = scrollMark.getMarks();
      expect(marks.length).toBe(1);
      expect(marks[0].color).toBe('#ff0000');
      expect(marks[0].start).toBeGreaterThanOrEqual(0);
      expect(marks[0].end).toBeLessThanOrEqual(100);
    });
  });

  describe('update', () => {
    it('should not throw when called', () => {
      scrollMark = new ScrollMarks();
      
      expect(() => scrollMark.update()).not.toThrow();
    });

    it('should update styles when elements change', () => {
      scrollMark = new ScrollMarks();
      
      const section = document.createElement('div');
      section.setAttribute('data-scroll-color', '#00ff00');
      section.getBoundingClientRect = () => ({
        top: 0, height: 500, left: 0, right: 100, bottom: 500, width: 100
      });
      document.body.appendChild(section);
      
      scrollMark.update();
      
      const styleEl = document.querySelector('style[data-scrollmarks]');
      expect(styleEl.textContent).toContain('#00ff00');
    });
  });

  describe('destroy', () => {
    it('should remove style element', () => {
      scrollMark = new ScrollMarks();
      const id = scrollMark.getId();
      
      scrollMark.destroy();
      
      const styleEl = document.getElementById(id);
      expect(styleEl).toBeNull();
    });

    it('should be safe to call multiple times', () => {
      scrollMark = new ScrollMarks();
      
      expect(() => {
        scrollMark.destroy();
        scrollMark.destroy();
      }).not.toThrow();
    });

    it('should prevent update after destroy', () => {
      scrollMark = new ScrollMarks();
      scrollMark.destroy();
      
      expect(() => scrollMark.update()).not.toThrow();
    });
  });

  describe('autoInit', () => {
    it('should return null when body has no data-scrollmarks-auto', () => {
      const result = ScrollMarks.autoInit();
      expect(result).toBeNull();
    });

    it('should create instance when body has data-scrollmarks-auto', () => {
      document.body.setAttribute('data-scrollmarks-auto', '');
      
      const result = ScrollMarks.autoInit();
      expect(result).toBeInstanceOf(ScrollMarks);
      
      result.destroy();
    });

    it('should read options from data attributes', () => {
      document.body.setAttribute('data-scrollmarks-auto', '');
      document.body.dataset.scrollmarksTrack = '#123456';
      document.body.dataset.scrollmarksThumb = '#654321';
      document.body.dataset.scrollmarksWidth = '20';
      
      const result = ScrollMarks.autoInit();
      expect(result).toBeInstanceOf(ScrollMarks);
      
      result.destroy();
    });
  });

  describe('gradient building', () => {
    it('should build gradient with multiple colors', () => {
      const section1 = document.createElement('div');
      section1.setAttribute('data-scroll-color', '#ff0000');
      section1.getBoundingClientRect = () => ({
        top: 0, height: 400, left: 0, right: 100, bottom: 400, width: 100
      });
      
      const section2 = document.createElement('div');
      section2.setAttribute('data-scroll-color', '#0000ff');
      section2.getBoundingClientRect = () => ({
        top: 600, height: 400, left: 0, right: 100, bottom: 1000, width: 100
      });
      
      document.body.appendChild(section1);
      document.body.appendChild(section2);
      
      scrollMark = new ScrollMarks();
      scrollMark.update();
      
      const styleEl = document.querySelector('style[data-scrollmarks]');
      expect(styleEl.textContent).toContain('#ff0000');
      expect(styleEl.textContent).toContain('#0000ff');
      expect(styleEl.textContent).toContain('linear-gradient');
    });
  });
});

