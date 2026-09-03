import { fp } from '../utils/responsive';
export const typography = {
  heading: {
    fontSize: fp(2.4),
    fontWeight: '700' as const,
  },
  subheading: {
    fontSize: fp(1.8),
    fontWeight: '600' as const,
  },
  body: {
    fontSize: fp(1.6),
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: fp(1.4),
    fontWeight: '400' as const,
  },
};
