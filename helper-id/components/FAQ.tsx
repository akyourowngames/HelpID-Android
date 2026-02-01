import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { FAQS } from '../constants';

const AccordionItem: React.FC<{ question: string; answer: string; id: string }> = ({ question, answer, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = `faq-content-${id}`;
  const buttonId = `faq-button-${id}`;

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button 
        id={buttonId}
        className="w-full py-8 flex items-center justify-between text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span className="text-xl md:text-2xl font-medium text-brand-black group-hover:text-gray-600 transition-colors">
          {question}
        </span>
        <span className={`p-2 rounded-full border border-gray-200 transition-all duration-300 ${isOpen ? 'bg-brand-black text-white rotate-180' : 'bg-transparent'}`}>
           {isOpen ? <Minus className="w-5 h-5" aria-hidden="true" /> : <Plus className="w-5 h-5" aria-hidden="true" />}
        </span>
      </button>
      <div 
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-8' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-lg text-gray-600 leading-relaxed md:w-3/4">
          {answer}
        </p>
      </div>
    </div>
  );
};

export const FAQ: React.FC = () => {
  return (
    <section className="py-24 px-4 md:px-12 bg-white rounded-t-[3rem] mt-12 shadow-sm" aria-labelledby="faq-heading">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:gap-32">
        <div className="md:w-1/3">
          <h2 id="faq-heading" className="text-3xl font-medium tracking-tight sticky top-32">Frequently asked questions</h2>
        </div>
        <div className="md:w-2/3">
          {FAQS.map((faq, index) => (
            <AccordionItem key={index} id={`faq-${index}`} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
};