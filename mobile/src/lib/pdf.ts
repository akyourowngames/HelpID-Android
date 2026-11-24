import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { UserProfile } from '../types';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildHtml(profile: UserProfile): string {
  const list = (items: string[]) =>
    items.length
      ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
      : '<p class="muted">None listed</p>';

  const contacts = profile.emergencyContacts.length
    ? `<table>${profile.emergencyContacts
        .map(
          (c) =>
            `<tr><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.phone)}</td></tr>`,
        )
        .join('')}</table>`
    : '<p class="muted">No contacts</p>';

  return `<!doctype html>
<html><head><meta charset="utf-8" />
<style>
  @page { margin: 32px; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1c1b1a; }
  .eyebrow { letter-spacing: 2px; font-size: 10px; color: #c62828; font-weight: 700; }
  h1 { font-size: 28px; margin: 4px 0 2px; }
  .sub { color: #6e6a67; font-size: 12px; margin-bottom: 24px; }
  .badge { display: inline-block; background: #c62828; color: #fff; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 13px; }
  h2 { font-size: 12px; letter-spacing: 1.4px; text-transform: uppercase; color: #6e6a67; margin: 24px 0 8px; border-top: 1px solid #e8e3de; padding-top: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  td { padding: 6px 0; border-bottom: 1px solid #f0ece7; }
  td:last-child { text-align: right; color: #3d3936; }
  ul { padding-left: 18px; font-size: 13px; }
  li { margin-bottom: 4px; }
  .muted { color: #9a948f; font-size: 12px; }
  .footer { margin-top: 32px; font-size: 10px; color: #9a948f; }
</style></head>
<body>
  <div class="eyebrow">EMERGENCY MEDICAL PROFILE</div>
  <h1>${escapeHtml(profile.name || 'Unnamed profile')}</h1>
  <div class="sub">Generated ${new Date().toLocaleString()}</div>
  <span class="badge">${escapeHtml(profile.bloodGroup || 'Blood group not set')}</span>
  <h2>Personal</h2>
  <table>
    <tr><td>Emergency ID</td><td>${escapeHtml(profile.userId)}</td></tr>
    <tr><td>Address</td><td>${escapeHtml(profile.address || 'Not provided')}</td></tr>
  </table>
  <h2>Allergies</h2>
  ${list(profile.allergies)}
  <h2>Medical conditions</h2>
  ${list(profile.medicalNotes)}
  <h2>Emergency contacts</h2>
  ${contacts}
  <div class="footer">HelpID supports responders. It does not replace emergency services.</div>
</body></html>`;
}

export async function exportProfilePdf(profile: UserProfile): Promise<boolean> {
  try {
    const { uri } = await Print.printToFileAsync({ html: buildHtml(profile) });
    if (Platform.OS === 'web') return true;
    const available = await Sharing.isAvailableAsync();
    if (!available) return false;
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'HelpID emergency profile',
      UTI: 'com.adobe.pdf',
    });
    return true;
  } catch {
    return false;
  }
}
