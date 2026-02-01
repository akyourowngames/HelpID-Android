import React from 'react';
import { Apple, Smartphone, Shield, Wifi, Zap, Lock, QrCode, Download, Play } from 'lucide-react';

export const ProductPage: React.FC = () => {
  return (
    <div className="pt-32 pb-20 animate-fade-in-up min-h-screen">
       
       {/* Hero Section */}
       <section className="px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 mb-24">
          <div className="md:w-1/2">
             <div className="inline-block px-4 py-1 rounded-full border border-gray-200 bg-white text-xs font-semibold uppercase tracking-wider mb-6 text-brand-black/70">
                v2.0 Now Available
             </div>
             <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter leading-[0.95] mb-8 text-brand-black">
                Security in <br/> your pocket.
             </h1>
             <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-md">
                The companion app that speaks for you. Set up your medical profile, emergency contacts, and lock screen widgets in seconds.
             </p>
             <div className="flex flex-wrap gap-4">
                <button 
                    className="flex items-center gap-3 bg-brand-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-black group"
                    aria-label="Download on the App Store"
                >
                    <Apple className="w-6 h-6 fill-current" />
                    <div className="text-left leading-tight">
                        <div className="text-[10px] uppercase opacity-70 font-semibold tracking-wide">Download on the</div>
                        <div className="text-sm font-bold group-hover:underline">App Store</div>
                    </div>
                </button>
                <button 
                    className="flex items-center gap-3 bg-white border border-gray-200 text-brand-black px-8 py-4 rounded-full font-medium hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-black group"
                    aria-label="Get it on Google Play"
                >
                    <Smartphone className="w-6 h-6" />
                    <div className="text-left leading-tight">
                        <div className="text-[10px] uppercase opacity-70 font-semibold tracking-wide">Get it on</div>
                        <div className="text-sm font-bold group-hover:underline">Google Play</div>
                    </div>
                </button>
             </div>
          </div>
          
          <div className="md:w-1/2 relative flex justify-center">
             <div className="absolute inset-0 bg-brand-yellow blur-[120px] opacity-20 rounded-full w-2/3 h-2/3 m-auto"></div>
             
             {/* CSS-Only Phone Mockup */}
             <div className="relative z-10 w-[300px] h-[600px] bg-brand-black rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden ring-1 ring-white/10 rotate-[-5deg] hover:rotate-0 transition-transform duration-700 ease-out">
                {/* Screen */}
                <div className="w-full h-full bg-[#FDFBF7] relative overflow-hidden flex flex-col">
                   {/* Notch */}
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-xl z-20"></div>
                   
                   {/* Status Bar */}
                   <div className="px-6 pt-3 flex justify-between text-[10px] font-bold text-gray-400">
                        <span>9:41</span>
                        <div className="flex gap-1">
                            <Wifi className="w-3 h-3" />
                            <div className="w-4 h-3 bg-gray-400 rounded-sm" />
                        </div>
                   </div>

                   {/* App Content */}
                   <div className="p-6 pt-8 flex-1 flex flex-col">
                      <div className="flex justify-between items-center mb-8">
                         <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                             <img src="https://picsum.photos/100/100?random=user" alt="User avatar" className="w-full h-full object-cover" />
                         </div>
                         <div className="w-10 h-10 rounded-full border-2 border-red-100 bg-red-50 flex items-center justify-center animate-pulse">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                         </div>
                      </div>
                      
                      <h3 className="text-3xl font-bold mb-1 text-brand-black leading-tight">Sarah<br/>Connor</h3>
                      <p className="text-sm text-gray-400 mb-6">ID: #8392-AX</p>

                      <div className="space-y-3">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                            <div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Blood Type</div>
                                <div className="text-xl font-bold text-brand-black">O+ Positive</div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                <span className="font-bold text-xs">Drop</span>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Medical Conditions</div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs font-bold">Asthma</span>
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs font-bold">Diabetes</span>
                            </div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                            <div className="text-[10px] text-red-400 uppercase tracking-wider font-bold mb-1">Allergies</div>
                            <div className="text-lg font-bold text-red-900">Penicillin, Peanuts</div>
                        </div>
                      </div>

                      {/* Slider */}
                      <div className="mt-auto bg-brand-black text-white p-2 rounded-[1.5rem] flex items-center relative overflow-hidden">
                         <div className="absolute inset-y-1 left-1 w-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <Zap className="w-5 h-5 text-black fill-black" />
                         </div>
                         <div className="w-full text-center font-bold text-sm pl-10">Slide to Call 112</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </section>

       {/* Functionality Video Section */}
       <section className="px-6 md:px-12 max-w-7xl mx-auto mb-32">
           <div className="relative w-full rounded-[2.5rem] overflow-hidden bg-black aspect-video md:aspect-[2.35/1] group shadow-2xl">
               <video 
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-opacity duration-700"
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  poster="https://images.unsplash.com/photo-1555421689-d68471e189f2?auto=format&fit=crop&q=80"
               >
                  {/* Using a stock video that resembles phone interaction/scanning */}
                  <source src="https://videos.pexels.com/video-files/4325413/4325413-hd_1920_1080_30fps.mp4" type="video/mp4" />
               </video>

               <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
                    <div className="bg-white/10 backdrop-blur-xl p-5 rounded-full mb-6 border border-white/20 group-hover:scale-110 transition-transform duration-500">
                        <QrCode className="w-10 h-10 text-brand-yellow" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-medium text-white mb-6 tracking-tight">
                        Tap. Scan. Help.
                    </h2>
                    <p className="text-lg md:text-xl text-gray-200 max-w-xl leading-relaxed">
                        Access vital info in seconds via NFC or QR code. No passcode required.
                    </p>
               </div>
           </div>
       </section>

       {/* Features Grid */}
       <section className="px-6 md:px-12 max-w-7xl mx-auto mb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Card 1 */}
             <div className="bg-white rounded-[2rem] p-8 border border-gray-100 flex flex-col justify-between min-h-[300px] group hover:border-brand-black/10 transition-colors">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-yellow transition-colors">
                    <Wifi className="w-6 h-6 text-brand-black" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold mb-2">100% Offline</h3>
                    <p className="text-gray-500 leading-relaxed">Your data lives on your device. Access medical records without signal or internet connection.</p>
                </div>
             </div>

             {/* Card 2 */}
             <div className="bg-brand-black text-white rounded-[2rem] p-8 flex flex-col justify-between min-h-[300px] md:col-span-2 relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Privacy First Architecture</h3>
                    <p className="text-gray-400 leading-relaxed max-w-lg">
                        We don't track you. Your health data is encrypted locally and only shared when you trigger emergency mode or via NFC tap.
                    </p>
                </div>
                {/* Abstract graphic */}
                <div className="absolute right-0 bottom-0 opacity-20 group-hover:opacity-30 transition-opacity">
                    <Shield className="w-64 h-64 translate-x-12 translate-y-12" />
                </div>
             </div>
             
             {/* Card 3 */}
             <div className="bg-[#E0F2F1] rounded-[2rem] p-8 flex flex-col justify-center items-center text-center min-h-[300px] md:col-span-1">
                 <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
                     <QrCode className="w-24 h-24 text-brand-black" />
                 </div>
                 <h3 className="text-xl font-bold mb-1">Instant Share</h3>
                 <p className="text-sm text-gray-600">Strangers can scan to help.</p>
             </div>

             {/* Card 4 */}
             <div className="bg-white rounded-[2rem] p-8 border border-gray-100 md:col-span-2 flex flex-col md:flex-row items-center gap-8 group hover:border-brand-black/10 transition-colors">
                 <div className="flex-1">
                     <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-yellow transition-colors">
                        <Download className="w-6 h-6 text-brand-black" />
                     </div>
                     <h3 className="text-2xl font-bold mb-2">Widget Support</h3>
                     <p className="text-gray-500 leading-relaxed">Add emergency shortcuts directly to your lock screen for even faster access.</p>
                 </div>
                 <div className="flex gap-2 opacity-50 grayscale group-hover:grayscale-0 transition-all">
                     <div className="w-24 h-24 bg-gray-100 rounded-2xl border-2 border-gray-200"></div>
                     <div className="w-24 h-24 bg-gray-200 rounded-2xl border-2 border-gray-300"></div>
                     <div className="w-24 h-24 bg-brand-yellow/20 rounded-2xl border-2 border-brand-yellow"></div>
                 </div>
             </div>

          </div>
       </section>

       {/* Download CTA Bottom */}
       <section className="px-4 mb-20">
           <div className="bg-brand-yellow rounded-[3rem] max-w-5xl mx-auto py-24 px-6 text-center relative overflow-hidden">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_white_0%,_transparent_70%)] opacity-30 pointer-events-none"></div>
               
               <div className="relative z-10">
                   <h2 className="text-4xl md:text-6xl font-medium tracking-tight mb-8">Ready to feel safer?</h2>
                   <p className="text-xl mb-12 max-w-2xl mx-auto opacity-80">Download Helper ID today and join thousands of users who are prepared for the unexpected.</p>
                   
                   <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                        <button className="bg-brand-black text-white px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl">
                            Download Now
                        </button>
                        <span className="text-sm font-medium opacity-60">Available for iOS & Android</span>
                   </div>
               </div>
           </div>
       </section>

    </div>
  );
};