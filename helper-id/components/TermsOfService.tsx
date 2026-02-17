import React from 'react';
import { Link } from 'react-router-dom';

const sections = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'accounts', title: 'User Accounts' },
  { id: 'content', title: 'User Content' },
  { id: 'services', title: 'Our Services' },
  { id: 'disclaimers', title: 'Disclaimers' },
  { id: 'liability', title: 'Limitation of Liability' },
  { id: 'governing-law', title: 'Governing Law' },
];

export const TermsOfService: React.FC = () => {
  return (
    <div className="pt-32 pb-20 animate-fade-in-up min-h-screen">
      <section className="px-6 md:px-12 max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <h2 className="text-2xl font-medium tracking-tighter text-brand-black mb-6">
                Terms of Service
              </h2>
              <ul className="space-y-3">
                {sections.map(section => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="text-gray-500 hover:text-brand-black transition-colors group">
                      <span className="group-hover:text-brand-yellow transition-colors">#</span> {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="lg:col-span-3 mt-12 lg:mt-0">
            <div className="prose prose-lg lg:prose-xl max-w-none text-gray-700 leading-relaxed space-y-12">
              
              <div id="introduction" className="animate-reveal [animation-delay:100ms]">
                <h3 className="text-3xl font-medium text-brand-black">1. Introduction</h3>
                <p>Welcome to Helper ID. These Terms of Service ("Terms") govern your use of the Helper ID mobile application (the "App") and the related website (the "Site"), collectively the "Service". By using the Service, you agree to these Terms. If you do not agree to these Terms, do not use the Service.</p>
              </div>

              <div id="accounts" className="animate-reveal [animation-delay:200ms]">
                <h3 className="text-3xl font-medium text-brand-black">2. User Accounts</h3>
                <p>To use certain features of the App, you must create an account. You are responsible for maintaining the confidentiality of your account information, including your password, and for all activity that occurs under your account. You agree to notify us immediately of any unauthorized use of your account or password, or any other breach of security.</p>
              </div>

              <div id="content" className="animate-reveal [animation-delay:300ms]">
                <h3 className="text-3xl font-medium text-brand-black">3. User Content</h3>
                <p>You are responsible for the content that you post to the Service, including its legality, reliability, and appropriateness. By posting content to the Service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such content on and through the Service. You retain any and all of your rights to any content you submit, post or display on or through the Service and you are responsible for protecting those rights.</p>
                <p>You represent and warrant that: (i) the content is yours (you own it) or you have the right to use it and grant us the rights and license as provided in these Terms, and (ii) the posting of your content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person.</p>
              </div>

              <div id="services" className="animate-reveal [animation-delay:400ms]">
                <h3 className="text-3xl font-medium text-brand-black">4. Our Services</h3>
                <p>The Service is designed to provide first responders and other authorized individuals with access to your emergency information in the event of an emergency. This may include your name, contacts, and medical information. The Service may also allow you to send SMS messages with your location to your emergency contacts.</p>
                <p>We do not guarantee that the Service will be available at all times, or that it will be free from errors or interruptions. We are not responsible for any delays, delivery failures, or other damage resulting from such problems.</p>
              </div>

              <div id="disclaimers" className="animate-reveal [animation-delay:500ms]">
                <h3 className="text-3xl font-medium text-brand-black">5. Disclaimers</h3>
                <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" AND WITH ALL FAULTS AND DEFECTS WITHOUT WARRANTY OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED UNDER APPLICABLE LAW, HELPER ID, ON ITS OWN BEHALF AND ON BEHALF OF ITS AFFILIATES AND ITS AND THEIR RESPECTIVE LICENSORS AND SERVICE PROVIDERS, EXPRESSLY DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY OR OTHERWISE, WITH RESPECT TO THE SERVICE, INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT, AND WARRANTIES THAT MAY ARISE OUT OF COURSE OF DEALING, COURSE OF PERFORMANCE, USAGE OR TRADE PRACTICE. WITHOUT LIMITATION TO THE FOREGOING, HELPER ID PROVIDES NO WARRANTY OR UNDERTAKING, AND MAKES NO REPRESENTATION OF ANY KIND THAT THE SERVICE WILL MEET YOUR REQUIREMENTS, ACHIEVE ANY INTENDED RESULTS, BE COMPATIBLE OR WORK WITH ANY OTHER SOFTWARE, APPLICATIONS, SYSTEMS OR SERVICES, OPERATE WITHOUT INTERRUPTION, MEET ANY PERFORMANCE OR RELIABILITY STANDARDS OR BE ERROR FREE OR THAT ANY ERRORS OR DEFECTS CAN OR WILL BE CORRECTED.</p>
              </div>
              
              <div id="liability" className="animate-reveal [animation-delay:600ms]">
                  <h3 className="text-3xl font-medium text-brand-black">6. Limitation of Liability</h3>
                  <p>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL HELPER ID OR ITS AFFILIATES, OR ANY OF ITS OR THEIR RESPECTIVE LICENSORS OR SERVICE PROVIDERS, HAVE ANY LIABILITY ARISING FROM OR RELATED TO YOUR USE OF OR INABILITY TO USE THE APP OR THE SERVICES FOR:</p>
                  <ul>
                      <li>PERSONAL INJURY, PROPERTY DAMAGE, LOST PROFITS, COST OF SUBSTITUTE GOODS OR SERVICES, LOSS OF DATA, LOSS OF GOODWILL, BUSINESS INTERRUPTION, COMPUTER FAILURE OR MALFUNCTION, OR ANY OTHER CONSEQUENTIAL, INCIDENTAL, INDIRECT, EXEMPLARY, SPECIAL, OR PUNITIVE DAMAGES.</li>
                      <li>DIRECT DAMAGES IN AMOUNTS THAT IN THE AGGREGATE EXCEED THE AMOUNT ACTUALLY PAID BY YOU FOR THE APP.</li>
                  </ul>
              </div>

              <div id="governing-law" className="animate-reveal [animation-delay:700ms]">
                  <h3 className="text-3xl font-medium text-brand-black">7. Governing Law</h3>
                  <p>These Terms will be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of laws principles.</p>
              </div>

              <p className="pt-8 text-sm text-gray-500 animate-reveal [animation-delay:800ms]">
                Last updated: February 17, 2026
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
