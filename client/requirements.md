## Packages
framer-motion | Page transitions and 3D flip card animations
@stripe/react-stripe-js | Stripe UI components for the donation mock
@stripe/stripe-js | Stripe core library for the donation mock
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility to merge tailwind classes safely

## Notes
- The app uses `window.speechSynthesis` for Text-to-Speech (requires browser support).
- Stripe integration uses the provided test publishable key to render a mock CardElement.
- The UI follows a Glassmorphism / iOS translucent aesthetic with ambient background blobs.
