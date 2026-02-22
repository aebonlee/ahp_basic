/**
 * Validate email format.
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate password strength.
 */
export function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

/**
 * Validate project name.
 */
export function isValidProjectName(name) {
  return typeof name === 'string' && name.trim().length >= 1 && name.trim().length <= 100;
}

/**
 * Validate criterion name.
 */
export function isValidCriterionName(name) {
  return typeof name === 'string' && name.trim().length >= 1 && name.trim().length <= 50;
}

/**
 * Validate pairwise comparison value.
 */
export function isValidComparisonValue(value) {
  const num = Number(value);
  return Number.isInteger(num) && num >= -9 && num <= 9;
}
