import { describe, expect, it } from 'vitest';
import { LOGIN_FORM_NATIVE_FALLBACK } from './login-contract';

describe('login form native fallback', () => {
  it('never serializes credentials into the login URL before hydration', () => {
    expect(LOGIN_FORM_NATIVE_FALLBACK).toEqual({
      action: '/backend/auth/login',
      method: 'post',
    });
  });
});
