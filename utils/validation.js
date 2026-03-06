// src/utils/validation.js

export const rules = {
  required: (label = 'This field') => (v) =>
    !v || !v.toString().trim() ? `${label} is required` : null,

  email: () => (v) =>
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v?.trim()) ? 'Enter a valid email address' : null,

  minLength: (n, label = 'This field') => (v) =>
    !v || v.length < n ? `${label} must be at least ${n} characters` : null,

  maxLength: (n, label = 'This field') => (v) =>
    v && v.length > n ? `${label} must be at most ${n} characters` : null,

  password: () => (v) => {
    if (!v || v.length < 8)             return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(v))               return 'Password must have an uppercase letter';
    if (!/[a-z]/.test(v))               return 'Password must have a lowercase letter';
    if (!/[0-9]/.test(v))               return 'Password must have a number';
    if (!/[@$!%*?&#^()\-_=+]/.test(v))  return 'Password must have a special character';
    return null;
  },

  name: (label = 'Name') => (v) => {
    if (!v || !v.trim())       return `${label} is required`;
    if (v.trim().length < 2)   return `${label} must be at least 2 characters`;
    if (v.trim().length > 100) return `${label} is too long`;
    return null;
  },
};

/**
 * Validate a whole form object.
 * @param {object} fields   - { fieldName: value }
 * @param {object} schema   - { fieldName: [ruleFn, ...] }
 * @returns {{ errors: object, isValid: boolean }}
 */
export const validateForm = (fields, schema) => {
  const errors = {};
  for (const [key, validators] of Object.entries(schema)) {
    for (const validate of validators) {
      const error = validate(fields[key]);
      if (error) { errors[key] = error; break; }
    }
  }
  return { errors, isValid: Object.keys(errors).length === 0 };
};