import React from 'react';

export const TextSection: React.FC = () => {
  return (
    <section className="py-32 px-4 overflow-hidden">
       <div className="max-w-[90%] mx-auto relative">
         <h2 className="text-[10vw] md:text-[8vw] leading-[0.9] font-medium tracking-tight text-center md:text-left text-brand-black">
            <span className="block md:ml-[10%]">Safety.</span>
            <span className="block text-center text-gray-400">Clarity.</span>
            <span className="block text-right md:mr-[10%]">Speed.</span>
         </h2>
       </div>

       <div className="mt-32 max-w-4xl mx-auto text-center px-6">
          <p className="text-2xl md:text-4xl font-medium leading-tight text-brand-black text-balance">
            In emergencies like accidents, fainting, or medical situations, people around often don’t know who you are. <span className="underline decoration-wavy decoration-brand-yellow underline-offset-4">Helper ID</span> bridges this gap by making emergency details accessible, fast, and reliable.
          </p>
       </div>
    </section>
  );
};