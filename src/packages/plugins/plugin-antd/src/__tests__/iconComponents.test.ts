import { describe, it, expect } from 'vitest';
import { getAntdIconComponents, getAntdIconNames } from '../iconComponents';

describe('iconComponents', () => {
  describe('getAntdIconComponents', () => {
    it('should return an object with icon components', () => {
      const icons = getAntdIconComponents();
      expect(icons).toBeDefined();
      expect(typeof icons).toBe('object');
    });

    it('should include common outlined icons', () => {
      const icons = getAntdIconComponents();
      expect(icons).toHaveProperty('SearchOutlined');
      expect(icons).toHaveProperty('HomeOutlined');
      expect(icons).toHaveProperty('SettingOutlined');
      expect(icons).toHaveProperty('SmileOutlined');
    });

    it('should include filled icons', () => {
      const icons = getAntdIconComponents();
      expect(icons).toHaveProperty('SettingFilled');
      expect(icons).toHaveProperty('SmileFilled');
    });

    it('should include loading icons', () => {
      const icons = getAntdIconComponents();
      expect(icons).toHaveProperty('LoadingOutlined');
      expect(icons).toHaveProperty('SyncOutlined');
    });

    it('should have render function on each icon component', () => {
      const icons = getAntdIconComponents();
      for (const component of Object.values(icons)) {
        expect(component).toBeDefined();
        expect(['function', 'object']).toContain(typeof component);
      }
    });
  });

  describe('getAntdIconNames', () => {
    it('should return an array of icon names', () => {
      const names = getAntdIconNames();
      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBeGreaterThan(0);
    });

    it('should include SearchOutlined', () => {
      const names = getAntdIconNames();
      expect(names).toContain('SearchOutlined');
    });
  });
});