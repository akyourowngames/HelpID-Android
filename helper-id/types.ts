export interface FAQItem {
  question: string;
  answer: string;
}

export interface FeatureCardProps {
  title?: string;
  description?: string;
  image: string;
  badge?: string;
  size?: 'small' | 'medium' | 'large';
  video?: boolean;
  className?: string;
}

export enum SectionType {
  HERO = 'HERO',
  TEXT_FOCUS = 'TEXT_FOCUS',
  GRID = 'GRID',
  FAQ = 'FAQ',
}