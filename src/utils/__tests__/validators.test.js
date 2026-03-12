import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPassword,
  isValidProjectName,
  isValidCriterionName,
  isValidComparisonValue,
} from '../validators';

describe('isValidEmail', () => {
  it('accepts valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('accepts email with subdomain', () => {
    expect(isValidEmail('user@mail.example.co.kr')).toBe(true);
  });

  it('rejects email without @', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('rejects email without domain', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('rejects email with spaces', () => {
    expect(isValidEmail('user @example.com')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('rejects null/undefined', () => {
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('accepts password with 6+ characters', () => {
    expect(isValidPassword('abcdef')).toBe(true);
  });

  it('accepts long password', () => {
    expect(isValidPassword('a'.repeat(100))).toBe(true);
  });

  it('rejects password with 5 characters', () => {
    expect(isValidPassword('abcde')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidPassword('')).toBe(false);
  });

  it('rejects null/undefined', () => {
    expect(isValidPassword(null)).toBe(false);
    expect(isValidPassword(undefined)).toBe(false);
  });
});

describe('isValidProjectName', () => {
  it('accepts valid name', () => {
    expect(isValidProjectName('My Project')).toBe(true);
  });

  it('accepts single character', () => {
    expect(isValidProjectName('A')).toBe(true);
  });

  it('accepts name with exactly 100 characters', () => {
    expect(isValidProjectName('a'.repeat(100))).toBe(true);
  });

  it('rejects name with 101 characters', () => {
    expect(isValidProjectName('a'.repeat(101))).toBe(false);
  });

  it('rejects whitespace-only string', () => {
    expect(isValidProjectName('   ')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidProjectName('')).toBe(false);
  });

  it('rejects null/undefined', () => {
    expect(isValidProjectName(null)).toBe(false);
    expect(isValidProjectName(undefined)).toBe(false);
  });
});

describe('isValidCriterionName', () => {
  it('accepts valid name', () => {
    expect(isValidCriterionName('Cost')).toBe(true);
  });

  it('accepts name with exactly 50 characters', () => {
    expect(isValidCriterionName('a'.repeat(50))).toBe(true);
  });

  it('rejects name with 51 characters', () => {
    expect(isValidCriterionName('a'.repeat(51))).toBe(false);
  });

  it('rejects whitespace-only string', () => {
    expect(isValidCriterionName('   ')).toBe(false);
  });

  it('rejects null/undefined', () => {
    expect(isValidCriterionName(null)).toBe(false);
    expect(isValidCriterionName(undefined)).toBe(false);
  });
});

describe('isValidComparisonValue', () => {
  it('accepts 0', () => {
    expect(isValidComparisonValue(0)).toBe(true);
  });

  it('accepts positive integer within range', () => {
    expect(isValidComparisonValue(9)).toBe(true);
  });

  it('accepts negative integer within range', () => {
    expect(isValidComparisonValue(-9)).toBe(true);
  });

  it('accepts string number', () => {
    expect(isValidComparisonValue('5')).toBe(true);
  });

  it('rejects value > 9', () => {
    expect(isValidComparisonValue(10)).toBe(false);
  });

  it('rejects value < -9', () => {
    expect(isValidComparisonValue(-10)).toBe(false);
  });

  it('rejects float', () => {
    expect(isValidComparisonValue(1.5)).toBe(false);
  });

  it('rejects NaN', () => {
    expect(isValidComparisonValue(NaN)).toBe(false);
  });
});
