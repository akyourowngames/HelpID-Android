import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, Phone, MapPin, Droplet, AlertTriangle, FileText, ExternalLink } from 'lucide-react';

type EmergencyContact = { name: string; phone: string };

type Profile = {
  name: string;
  bloodGroup: string;
  allergies: string[];
  emergencyContacts: EmergencyContact[];
  address: string;
  medicalNotes: string[];
};

function setNoIndexMeta() {
  const name = 'robots';
  const content = 'noindex,nofollow,noarchive';
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export const EmergencyProfilePage: React.FC = () => {
  const { publicKey } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t') || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const deepLinkUrl = useMemo(() => {
    const key = publicKey || '';
    // Android intent fallback (opens app if installed; otherwise stays on web)
    return `intent://e/${encodeURIComponent(key)}#Intent;scheme=helpid;package=com.helpid.app;end`;
  }, [publicKey]);

  useEffect(() => {
    setNoIndexMeta();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError(null);
        setProfile(null);

        if (!publicKey || !token) {
          throw new Error('Invalid link');
        }

        const res = await fetch(`/api/profile?key=${encodeURIComponent(publicKey)}&t=${encodeURIComponent(token)}`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json?.error || 'Failed to load profile');
        }

        if (!cancelled) {
          setProfile(json?.profile || null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Something went wrong');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [publicKey, token]);

  return (
    <div className="min-h-screen bg-brand-bg font-sans text-brand-black selection:bg-brand-yellow selection:text-brand-black">
      <div className="pt-10 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-8">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-gray-100 shadow-sm hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </a>

            <a
              href={deepLinkUrl}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-black text-white hover:bg-gray-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-black"
            >
              Open in app
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="bg-brand-black text-white rounded-[2rem] p-8 relative overflow-hidden shadow-2xl mb-8">
            <div className="absolute right-0 top-0 w-72 h-72 bg-brand-yellow/10 rounded-full blur-[80px]" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <ShieldAlert className="w-7 h-7 text-brand-yellow" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider font-semibold text-gray-300">Emergency Profile</div>
                <div className="text-3xl md:text-4xl font-medium tracking-tight">Helper ID</div>
                <div className="text-sm text-gray-300 mt-1 break-all">Key: {publicKey}</div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
              <div className="text-gray-500">Loading emergency details…</div>
            </div>
          )}

          {!loading && error && (
            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
              <div className="text-red-600 font-semibold mb-2">Unable to show details</div>
              <div className="text-gray-600">{error}</div>
              <div className="mt-6 text-sm text-gray-500">This link may have expired (tokens expire after a few hours).</div>
            </div>
          )}

          {!loading && !error && profile && (
            <div className="space-y-6">
              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Name</div>
                <div className="text-3xl font-bold text-brand-black mt-1">{profile.name || '—'}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Blood Group</div>
                    <div className="text-2xl font-bold text-brand-black mt-1">{profile.bloodGroup || '—'}</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                    <Droplet className="w-6 h-6 text-red-500" />
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div className="text-[10px] text-red-400 uppercase tracking-wider font-bold">Allergies</div>
                  </div>
                  {profile.allergies?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.allergies.map((a, i) => (
                        <span key={`${a}-${i}`} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-100">
                          {a}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500">—</div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Phone className="w-5 h-5 text-brand-black" />
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Emergency Contacts</div>
                </div>
                {profile.emergencyContacts?.length ? (
                  <div className="space-y-3">
                    {profile.emergencyContacts.map((c, i) => (
                      <div key={`${c.phone}-${i}`} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <div>
                          <div className="font-bold">{c.name || 'Contact'}</div>
                          <div className="text-sm text-gray-600">{c.phone || '—'}</div>
                        </div>
                        {c.phone ? (
                          <a
                            href={`tel:${c.phone}`}
                            className="px-4 py-2 rounded-full bg-brand-black text-white text-sm font-semibold hover:bg-gray-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-black"
                          >
                            Call
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">—</div>
                )}
              </div>

              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-brand-black" />
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Address</div>
                </div>
                <div className="text-gray-700 whitespace-pre-wrap">{profile.address || '—'}</div>
              </div>

              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-brand-black" />
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Extra Medical Info</div>
                </div>
                {profile.medicalNotes?.length ? (
                  <ul className="space-y-2 list-disc pl-6 text-gray-700">
                    {profile.medicalNotes.map((n, i) => (
                      <li key={`${i}-${n}`}>{n}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-500">—</div>
                )}
              </div>

              <div className="text-xs text-gray-500 text-center">
                This page is intentionally not indexed. Access requires a time-limited token.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
