import { Variants, Transition } from 'framer-motion';
import type { AnimationSpeed } from './settings';
interface AnimationSettings {
  animationSpeed: AnimationSpeed;
  reduceMotion: boolean;
}
const speeds = {
  fast: 0.2,
  medium: 0.4,
  slow: 0.8,
};
export const getAnimationProps = (settings: AnimationSettings): { variants: Variants; transition: Transition } => {
  if (settings.reduceMotion) {
    return {
      variants: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      },
      transition: { duration: 0 },
    };
  }
  const duration = speeds[settings.animationSpeed] || speeds.medium;
  return {
    variants: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    transition: {
      duration,
      ease: 'easeOut',
    },
  };
};