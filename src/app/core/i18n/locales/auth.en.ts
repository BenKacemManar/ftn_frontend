import { auth_fr } from './auth.fr';

export const auth_en: typeof auth_fr = {
  auth: {
    brand: {
      since: 'Espérance · 1919',
      section: 'Swimming Section',
    },
    login: {
      stepLabel: 'Login',
      titleLine1: 'Welcome back',
      titleItalic: 'among us.',
      passwordLabel: 'Password',
      submitting: 'Signing in…',
      submit: 'Sign in',
      noAccount: "Don't have an account yet?",
      registerLink: 'Sign up',
      invalidCredentials: 'Invalid credentials.',
    },
    register: {
      stepLabel: 'Sign up',
      titleLine1: 'Join',
      titleItalic: 'the family.',
      firstName: 'First name',
      passwordLabel: 'Password',
      roleLabel: 'Role',
      roleAthlete: 'Athlete',
      roleCoach: 'Coach',
      submitting: 'Signing up…',
      submit: 'Create my account',
      hasAccount: 'Already have an account?',
      loginLink: 'Sign in',
      registerError: 'Registration error.',
    },
  },
};
