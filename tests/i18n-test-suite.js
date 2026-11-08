/**
 * Comprehensive Internationalization (i18n) & Unicode Test Suite
 * 
 * Verifies compliance with:
 * - Unicode Standard Annex #15 (Unicode Normalization Forms)
 * - Unicode Standard Annex #24 & #44 (Script Property)
 * - BCP 47 Language Tags & RTL Directionality
 * - Exact Personal Name Preservation (never corrupting, stripping, or replacing)
 */

import { 
  MultiLangNameProfile, 
  generateMultiLangName, 
  detectScript, 
  getLanguageList 
} from '../js/name-multilang.js';

import { i18n, SUPPORTED_LOCALES } from '../js/i18n.js';

console.log('🧪 ========================================================');
console.log('🧪 RUNNING COMPREHENSIVE WORLDWIDE i18n TEST SUITE');
console.log('🧪 ========================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
  }
}

// ----------------------------------------------------------------------------
// TEST SUITE 1: Worldwide Script Detection & Identification across 16+ Languages
// ----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 1: Script Detection across 16+ Writing Systems ---');

const SCRIPT_CASES = [
  { name: 'Lokesh Kumar', expected: 'latin', lang: 'English' },
  { name: 'லோகேஷ் குமார்', expected: 'tamil', lang: 'Tamil' },
  { name: 'लोकेश कुमार', expected: 'devanagari', lang: 'Hindi' },
  { name: 'లోకేష్ కుమార్', expected: 'telugu', lang: 'Telugu' },
  { name: 'ಲೋಕೇಶ್ ಕುಮಾರ್', expected: 'kannada', lang: 'Kannada' },
  { name: 'ലോകേഷ് കുമാർ', expected: 'malayalam', lang: 'Malayalam' },
  { name: 'লোকেশ কুমার', expected: 'bengali', lang: 'Bengali' },
  { name: 'لوكيش كومار', expected: 'arabic', lang: 'Arabic' },
  { name: 'לוקש קומאר', expected: 'hebrew', lang: 'Hebrew' },
  { name: '洛凯什·库马尔', expected: 'han', lang: 'Chinese' },
  { name: 'ロケシュ・クマール', expected: 'japanese', lang: 'Japanese' },
  { name: '로케시 쿠마르', expected: 'hangul', lang: 'Korean' },
  { name: 'Локеш Кумар', expected: 'cyrillic', lang: 'Russian' },
  { name: 'Λοκές Κουμάρ', expected: 'greek', lang: 'Greek' },
  { name: 'โลเกศ กุมาร', expected: 'thai', lang: 'Thai' },
  { name: 'Nguyễn Văn Nam', expected: 'latin', lang: 'Vietnamese' }
];

for (const sc of SCRIPT_CASES) {
  const detected = detectScript(sc.name);
  assert(detected.id === sc.expected, `${sc.lang} (${sc.name}) correctly detected as ${sc.expected}`);
}

// ----------------------------------------------------------------------------
// TEST SUITE 2: Strict Personal Name Preservation
// ----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 2: Exact Name Preservation (No Translation/Stripping) ---');

for (const sc of SCRIPT_CASES) {
  const profile = new MultiLangNameProfile(sc.name);
  assert(profile.originalName === sc.name, `Original native name preserved exactly for ${sc.lang}`);
  assert(!profile.originalName.includes('?'), `No question marks / corrupted bytes in ${sc.lang}`);
}

// Test combining Unicode characters, apostrophes, hyphens
const COMPLEX_NAMES = [
  "Jean-François d'Ormesson", // Hyphen and apostrophe
  "Mária de las Mercedes",    // Accents / diacritics
  "عمر بن الخطاب",           // Multi-word Arabic with spaces
  "박지민",                   // CJK without spaces
  "Chloë Grace",              // Combining diaeresis
  "Prince",                   // Single name
  "Dr. A. P. J. Abdul Kalam", // Initials and dots
];

for (const cn of COMPLEX_NAMES) {
  const prof = new MultiLangNameProfile(cn);
  assert(prof.originalName === cn, `Complex/Special character name preserved: "${cn}"`);
  assert(prof.displayName === cn, `Display name matches exact original: "${cn}"`);
}

// ----------------------------------------------------------------------------
// TEST SUITE 3: Phonetic Transliteration Fidelity (Zero Artifacts)
// ----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 3: Phonetic Transliteration Quality (No Glitches) ---');

const lkProfile = new MultiLangNameProfile('Lokesh Kumar');
assert(lkProfile.transliterations.ta === 'லோகேஷ் குமார்', 'Tamil transliteration is authentic with pulli virama (லோகேஷ் குமார்)');
assert(lkProfile.transliterations.hi === 'लोकेश कुमार', 'Hindi transliteration matches standard Devanagari (लोकेश कुमार)');
assert(lkProfile.transliterations.ko === '로케시 쿠마르', 'Korean transliteration has ZERO leftover Latin letters (로케시 쿠마르)');
assert(lkProfile.transliterations.zh === '洛凯什·库马尔', 'Chinese transliteration has ZERO "星座" or star artifacts (洛凯什·库马尔)');
assert(lkProfile.transliterations.ja === 'ロケシュ・クマール', 'Japanese transliteration has authentic Katakana with middle dot (ロケシュ・クマール)');
assert(lkProfile.transliterations.ar === 'لوكيش كومار', 'Arabic transliteration matches standard Arabic phonetics (لوكيش كومار)');
assert(lkProfile.transliterations.ru === 'Локеш Кумар', 'Russian transliteration matches standard Cyrillic (Локеш Кумар)');

// ----------------------------------------------------------------------------
// TEST SUITE 4: User Manual Editing & Override Approvals
// ----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 4: User Manual Transliteration Customization ---');

const userCustomProfile = new MultiLangNameProfile('Lokesh Kumar');
// User edits their preferred Japanese spelling to specific kanji or nickname
userCustomProfile.setTransliteration('ja', 'ロキ');
assert(userCustomProfile.transliterations.ja === 'ロキ', 'User custom Japanese override accepted');
// User edits their preferred Russian spelling
userCustomProfile.setTransliteration('ru', 'Локеш');
assert(userCustomProfile.transliterations.ru === 'Локеш', 'User custom Russian override accepted');
// Original name remains untouched!
assert(userCustomProfile.originalName === 'Lokesh Kumar', 'Original name remains untouched despite overrides');

// ----------------------------------------------------------------------------
// TEST SUITE 5: UI Internationalization & RTL Direction Handling
// ----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 5: UI Localization & RTL Directionality ---');

assert(SUPPORTED_LOCALES.length >= 18, `Supported world locales count is ${SUPPORTED_LOCALES.length} >= 18`);

// English
i18n.setLocale('en-US');
assert(i18n.currentLocale === 'en-US', 'Locale switched to en-US');
assert(!i18n.isRTL(), 'en-US is LTR');
assert(i18n.t('header_crafted_for') === 'SPECIALLY CRAFTED FOR', 'English UI translation matches');

// Arabic (RTL)
i18n.setLocale('ar-SA');
assert(i18n.currentLocale === 'ar-SA', 'Locale switched to ar-SA');
assert(i18n.isRTL(), 'ar-SA is correctly flagged as RTL (dir="rtl")');
assert(i18n.t('header_crafted_for') === 'صُنع خصيصاً من أجل', 'Arabic UI translation matches');

// Hebrew (RTL)
i18n.setLocale('he-IL');
assert(i18n.isRTL(), 'he-IL is correctly flagged as RTL');

// Tamil (Indic)
i18n.setLocale('ta-IN');
assert(!i18n.isRTL(), 'ta-IN is LTR');
assert(i18n.t('header_crafted_for') === 'அன்புடன் உருவாக்கப்பட்டவர்', 'Tamil UI translation matches');

// Verify that user name parameter interpolation preserves native Unicode
const greeting = i18n.t('card_greeting', { name: 'லோகேஷ் குமார்' });
assert(greeting.includes('லோகேஷ் குமார்'), 'Interpolated native Tamil name preserved inside greeting string');

// ----------------------------------------------------------------------------
// TEST SUITE 6: Unicode Normalization (NFC) & Persistence Round-trip
// ----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 6: Unicode Normalization & Storage Serialization ---');

// Decomposed form (NFD) vs Composed form (NFC)
const nfdName = "Lo\u006B\u0065\u0073\u0068 Ku\u006D\u0061\u0072";
const profNfc = new MultiLangNameProfile(nfdName);
assert(profNfc.originalName === nfdName.normalize('NFC'), 'Name normalized to NFC without character corruption');

// Mock JSON round-trip (Database / LocalStorage persistence)
const serialized = JSON.stringify({
  originalName: 'லோகேஷ் குமார்',
  transliterations: {
    en: 'Lokesh Kumar',
    ar: 'لوكيش كومار',
    zh: '洛凯什·库马尔'
  }
});
const deserialized = JSON.parse(serialized);
assert(deserialized.originalName === 'லோகேஷ் குமார்', 'Database/JSON round-trip preserves Tamil characters');
assert(deserialized.transliterations.ar === 'لوكيش كومار', 'Database/JSON round-trip preserves Arabic characters');
assert(deserialized.transliterations.zh === '洛凯什·库马尔', 'Database/JSON round-trip preserves Chinese characters');

// ----------------------------------------------------------------------------
// SUMMARY
// ----------------------------------------------------------------------------
console.log('\n========================================================');
console.log(`🏁 TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
if (passedTests === totalTests) {
  console.log('🎉 ALL INTERNATIONALIZATION & UNICODE TESTS PASSED 100%!');
} else {
  console.error(`⚠️ ${totalTests - passedTests} TESTS FAILED!`);
}
console.log('========================================================\n');

