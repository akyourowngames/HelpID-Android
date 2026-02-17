import React from 'react';
import { Link } from 'react-router-dom';

const sections = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'data-collection', title: 'Data We Collect' },
  { id: 'data-use', title: 'How We Use Your Data' },
  { id: 'data-sharing', title: 'Data Sharing' },
  { id: 'data-storage', title: 'Data Storage and Security' },
  { id: 'cookies', title: 'Cookies Policy' },
  { id: 'your-rights', title: 'Your Rights' },
];

export const PrivacyAndCookies: React.FC = () => {
  return (
    <div className="pt-32 pb-20 animate-fade-in-up min-h-screen">
      <section className="px-6 md:px-12 max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <h2 className="text-2xl font-medium tracking-tighter text-brand-black mb-6">
                Privacy & Cookies
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
                <p>This Privacy Policy describes how Helper ID ("we", "us", or "our") collects, uses, and discloses your information in connection with your use of our mobile application (the "App") and related services (the "Service"). Your privacy is critically important to us.</p>
              </div>

              <div id="data-collection" className="animate-reveal [animation-delay:200ms]">
                <h3 className="text-3xl font-medium text-brand-black">2. Data We Collect</h3>
                <p>We collect the following types of information:</p>
                <ul>
                    <li><strong>Personal Information:</strong> When you create an account, we may collect personal information from you, such as your name, email address, and phone number.</li>
                    <li><strong>Emergency Information:</strong> You may choose to provide us with emergency information, such as your emergency contacts, medical conditions, allergies, and medications. This information is stored locally on your device and can also be synced with your private Firebase account for backup.</li>
                    <li><strong>Location Information:</strong> We may collect your device's location information when you use the App's emergency features to send your location to your emergency contacts.</li>
                </ul>
              </div>

              <div id="data-use" className="animate-reveal [animation-delay:300ms]">
                <h3 className="text-3xl font-medium text-brand-black">3. How We Use Your Data</h3>
                <p>We use the information we collect to:</p>
                <ul>
                    <li>Provide and maintain the Service;</li>
                    <li>Allow first responders to access your emergency information in case of an emergency;</li>
                    <li>Send emergency alerts to your contacts, including your location;</li>
                    <li>Communicate with you about your account and our services.</li>
                </ul>
              </div>

              <div id="data-sharing" className="animate-reveal [animation-delay:400ms]">
                  <h3 className="text-3xl font-medium text-brand-black">4. Data Sharing</h3>
                  <p>We do not sell or rent your personal information to third parties. We may share your information in the following limited circumstances:</p>
                  <ul>
                      <li>With your emergency contacts when you use the emergency features of the App.</li>
                      <li>With first responders who may access your information via NFC or QR code.</li>
                      <li>With our third-party service providers, such as Firebase and Google Play Services, to provide the Service.</li>
                      <li>If required by law or in response to a valid request from a law enforcement or government agency.</li>
                  </ul>
              </div>

              <div id="data-storage" className="animate-reveal [animation-delay:500ms]">
                  <h3 className="text-3xl font-medium text-brand-black">5. Data Storage and Security</h3>
                  <p>Your emergency information is stored locally on your device in an encrypted format. You have the option to sync this data with your private, secure Firebase cloud storage for backup and multi-device access. We take reasonable measures to protect your information from unauthorized access, use, or disclosure.</p>
              </div>

              <div id="cookies" className="animate-reveal [animation-delay:600ms]">
                  <h3 className="text-3xl font-medium text-brand-black">6. Cookies Policy</h3>
                  <p>Our website may use "cookies" to enhance user experience. A cookie is a small file placed on your computer's hard drive. You may choose to set your web browser to refuse cookies, or to alert you when cookies are being sent. If you do so, note that some parts of the Site may not function properly.</p>
              </div>

              <div id="your-rights" className="animate-reveal [animation-delay:700ms]">
                  <h3 className="text-3xl font-medium text-brand-black">7. Your Rights</h3>
                  <p>You have the right to access, update, or delete your information at any time through the App. If you have any questions about your privacy rights, please contact us.</p>
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
