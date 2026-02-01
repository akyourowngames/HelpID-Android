import { FAQItem } from './types';

export const APP_NAME = "HELPER ID";
export const ROBOT_NAME = "Helper ID";

export const FAQS: FAQItem[] = [
  {
    question: `What is ${ROBOT_NAME}?`,
    answer: `${ROBOT_NAME} is a personal emergency assistance app that helps people get the right help at the right time when they are unable to speak or act.`
  },
  {
    question: `Why is ${ROBOT_NAME} important?`,
    answer: "Emergencies create panic and confusion. Often, people around don’t know who you are or whom to contact. Helper ID bridges this gap by making emergency details accessible, fast, and reliable."
  },
  {
    question: `How does it work when my phone is locked?`,
    answer: "The information can be accessed even when the phone is locked using NFC tap, QR scan, or emergency mode, allowing strangers or responders to help immediately."
  },
  {
    question: `What information does it provide?`,
    answer: "It provides instant access to critical information such as your name and identity, blood group, medical conditions, and emergency contacts."
  },
  {
    question: `Does it call emergency services?`,
    answer: "Yes, Helper ID allows for direct emergency calling (112) to ensure professional help is contacted without delay."
  },
  {
    question: `Is my data private?`,
    answer: "Helper ID is built with a privacy‑first, offline‑ready, and user‑controlled approach. You decide what information is shared."
  }
];

export const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Privacy', href: '#privacy' },
  { label: 'About', href: '#about' },
];