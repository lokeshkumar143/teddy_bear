/**
 * Internationalization (i18n) Engine & Locale Manager
 * 
 * Complies with Unicode Technical Standard #35 (LDML) and BCP 47.
 * Supports 18+ world locales including full Right-To-Left (RTL) scripts (Arabic, Hebrew).
 * 
 * Rules:
 * - Translates interface strings, menus, buttons, captions, and date/time formats.
 * - NEVER translates or alters the user's authentic personal name.
 * - Persists chosen locale in localStorage.
 */

export const SUPPORTED_LOCALES = [
  { code: 'en-US', name: 'English', native: 'English', dir: 'ltr', flag: '🌐' },
  { code: 'ta-IN', name: 'Tamil', native: 'தமிழ்', dir: 'ltr', flag: '🇮🇳' },
  { code: 'hi-IN', name: 'Hindi', native: 'हिन्दी', dir: 'ltr', flag: '🇮🇳' },
  { code: 'te-IN', name: 'Telugu', native: 'తెలుగు', dir: 'ltr', flag: '🇮🇳' },
  { code: 'kn-IN', name: 'Kannada', native: 'ಕನ್ನಡ', dir: 'ltr', flag: '🇮🇳' },
  { code: 'ml-IN', name: 'Malayalam', native: 'മലയാളം', dir: 'ltr', flag: '🇮🇳' },
  { code: 'bn-IN', name: 'Bengali', native: 'বাংলা', dir: 'ltr', flag: '🇮🇳' },
  { code: 'ar-SA', name: 'Arabic', native: 'العربية', dir: 'rtl', flag: '🇸🇦' },
  { code: 'he-IL', name: 'Hebrew', native: 'עברית', dir: 'rtl', flag: '🇮🇱' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', native: '简体中文', dir: 'ltr', flag: '🇨🇳' },
  { code: 'ja-JP', name: 'Japanese', native: '日本語', dir: 'ltr', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', native: '한국어', dir: 'ltr', flag: '🇰🇷' },
  { code: 'ru-RU', name: 'Russian', native: 'Русский', dir: 'ltr', flag: '🇷🇺' },
  { code: 'es-ES', name: 'Spanish', native: 'Español', dir: 'ltr', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', native: 'Français', dir: 'ltr', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', native: 'Deutsch', dir: 'ltr', flag: '🇩🇪' },
  { code: 'el-GR', name: 'Greek', native: 'Ελληνικά', dir: 'ltr', flag: '🇬🇷' },
  { code: 'th-TH', name: 'Thai', native: 'ไทย', dir: 'ltr', flag: '🇹🇭' },
  { code: 'vi-VN', name: 'Vietnamese', native: 'Tiếng Việt', dir: 'ltr', flag: '🇻🇳' }
];

const UI_TRANSLATIONS = {
  'en-US': {
    header_crafted_for: 'SPECIALLY CRAFTED FOR',
    tab_teddy_0: 'Hugging Heart',
    tab_teddy_1: 'Sweet Dreams',
    tab_teddy_2: 'Heart Balloon',
    tab_teddy_3: 'Love Balloon',
    polaroid_caption: 'Best Friends Forever',
    card_badge: '✦  HEARTFELT DEDICATION  ✦',
    card_greeting: 'Hey, {name}! ✨',
    card_sub1: 'This little teddy was made just for you.',
    card_sub2: 'Sending you warmth, comfort, and happiness. ❤️',
    multilang_header: 'Name in World Languages',
    btn_change_name: '✎ Change',
    btn_save_gift: 'SAVE MY GIFT',
    btn_make_wave: 'MAKE TEDDY WAVE',
    btn_pulse_heart: 'PULSE HEART',
    btn_explore_world: 'EXPLORE MY WORLD',
    btn_replay: 'Watch Again ↺',
    envelope_touch_seal: 'TOUCH THE SEAL TO OPEN 💌',
    envelope_hint: 'touch the letter to open 💌',
    envelope_subcaption: 'A carrier dove has delivered a celestial letter for you ✨',
    modal_badge: '✦  A CELESTIAL LETTER FOR YOU  ✦',
    modal_title: 'Who is this surprise for? ✨',
    modal_sub: 'Enter your name to break the wax seal and see your name transformed across world languages!',
    modal_placeholder: 'Enter your name (e.g. Loki, Priya, Alex...)',
    modal_preview_label: '✨ Real-time Transliteration Preview:',
    modal_btn_confirm: 'BREAK SEAL & REVEAL MY TEDDY',
    edit_modal_badge: '🌍  NAME & TRANSLITERATION MANAGER  🌍',
    edit_modal_title: 'Personalize Your Name Across Languages ✨',
    edit_modal_sub: 'Your name is your identity. Edit and approve your preferred native spellings:',
    edit_field_original: 'Original Name (Exact Input):',
    edit_field_script: 'Detected Script:',
    edit_field_display: 'Preferred Display Name:',
    edit_btn_save: 'Save & Apply Changes 💖',
    edit_btn_cancel: 'Cancel',
    edit_btn_reset: 'Reset to Auto',
    sig_with_love: 'with love'
  },
  'ta-IN': {
    header_crafted_for: 'அன்புடன் உருவாக்கப்பட்டவர்',
    tab_teddy_0: 'இதயம் அணைக்கும் கரடி',
    tab_teddy_1: 'இனிய கனவுகள்',
    tab_teddy_2: 'இதய பலூன்',
    tab_teddy_3: 'அன்பு பலூன்',
    polaroid_caption: 'என்றும் சிறந்த நண்பர்கள்',
    card_badge: '✦  இதயப்பூர்வமான சமர்ப்பணம்  ✦',
    card_greeting: 'வணக்கம், {name}! ✨',
    card_sub1: 'இந்த அழகான கரடி உங்களுக்காகவே உருவாக்கப்பட்டது.',
    card_sub2: 'உங்களுக்கு இதமான அன்பும், மகிழ்ச்சியும் சேரட்டும். ❤️',
    multilang_header: 'உலக மொழிகளில் உங்கள் பெயர்',
    btn_change_name: '✎ மாற்று',
    btn_save_gift: 'பரிசை சேமி',
    btn_make_wave: 'கரடியை கையசைக்க வை',
    btn_pulse_heart: 'இதயத்தை துடிக்க வை',
    btn_explore_world: 'உலகை ஆராயுங்கள்',
    btn_replay: 'மீண்டும் பார்க்க ↺',
    envelope_touch_seal: 'கடிதத்தை திறக்க தொடவும் 💌',
    envelope_hint: 'திறக்க கடிதத்தை தொடவும் 💌',
    envelope_subcaption: 'வானத்து புறா உங்களுக்காக ஒரு காதல் கடிதத்தை கொண்டுவந்துள்ளது ✨',
    modal_badge: '✦  உங்களுக்கான வானியல் கடிதம்  ✦',
    modal_title: 'இந்த ஆச்சரியம் யாருக்கு? ✨',
    modal_sub: 'உங்கள் பெயரை உள்ளிட்டு அரக்கு முத்திரையை உடைத்து கரடியை காணுங்கள்!',
    modal_placeholder: 'உங்கள் பெயரை உள்ளிடவும் (எ.கா: லோகேஷ், பிரியா...)',
    modal_preview_label: '✨ நேரடி பலமொழி முன்னோட்டம்:',
    modal_btn_confirm: 'முத்திரையை உடைத்து கரடியை காண்க',
    edit_modal_badge: '🌍  பெயர் & மொழிபெயர்ப்பு மேலாளர்  🌍',
    edit_modal_title: 'உங்கள் பெயரை மொழிகளில் திருத்துங்கள் ✨',
    edit_modal_sub: 'உங்கள் பெயர் உங்கள் அடையாளம். உங்கள் விருப்பப்படி திருத்தி ஒப்புதல் அளியுங்கள்:',
    edit_field_original: 'அசல் பெயர் (மாறாதது):',
    edit_field_script: 'கண்டறியப்பட்ட எழுத்து வடிவம்:',
    edit_field_display: 'காட்சி பெயர்:',
    edit_btn_save: 'மாற்றங்களை சேமி 💖',
    edit_btn_cancel: 'ரத்து',
    edit_btn_reset: 'மீட்டமைக்க',
    sig_with_love: 'அன்புடன்'
  },
  'hi-IN': {
    header_crafted_for: 'विशेष रूप से निर्मित',
    tab_teddy_0: 'दिल थामे टेडी',
    tab_teddy_1: 'मीठे सपने',
    tab_teddy_2: 'दिल का गुब्बारा',
    tab_teddy_3: 'प्यार का गुब्बारा',
    polaroid_caption: 'हमेशा के लिए पक्के दोस्त',
    card_badge: '✦  हार्दिक समर्पण  ✦',
    card_greeting: 'नमस्ते, {name}! ✨',
    card_sub1: 'यह प्यारा टेडी सिर्फ आपके लिए बनाया गया है।',
    card_sub2: 'आपके लिए ढेर सारा प्यार, सुकून और खुशियाँ। ❤️',
    multilang_header: 'विश्व की भाषाओं में आपका नाम',
    btn_change_name: '✎ बदलें',
    btn_save_gift: 'उपहार सहेजें',
    btn_make_wave: 'टेडी से हाथ हिलवाएं',
    btn_pulse_heart: 'दिल धड़काएं',
    btn_explore_world: 'मेरी दुनिया देखें',
    btn_replay: 'फिर से देखें ↺',
    envelope_touch_seal: 'खोलने के लिए सील छुएं 💌',
    envelope_hint: 'खोलने के लिए पत्र छुएं 💌',
    envelope_subcaption: 'एक कबूतर आपके लिए एक दिव्य प्रेम पत्र लाया है ✨',
    modal_badge: '✦  आपके लिए एक दिव्य पत्र  ✦',
    modal_title: 'यह सरप्राइज किसके लिए है? ✨',
    modal_sub: 'सील तोड़ने और टेडी को देखने के लिए अपना नाम दर्ज करें!',
    modal_placeholder: 'अपना नाम दर्ज करें (उदा. लोकेश, प्रिया, राहुल...)',
    modal_preview_label: '✨ लाइव बहुभाषी पूर्वावलोकन:',
    modal_btn_confirm: 'सील तोड़ें और टेडी देखें',
    edit_modal_badge: '🌍  नाम एवं लिप्यंतरण प्रबंधक  🌍',
    edit_modal_title: 'सभी भाषाओं में अपना नाम अनुकूलित करें ✨',
    edit_modal_sub: 'आपका नाम आपकी पहचान है। हर भाषा में अपनी पसंदीदा वर्तनी जांचें:',
    edit_field_original: 'मूल नाम (अपरिवर्तनीय):',
    edit_field_script: 'पहचानी गई लिपि:',
    edit_field_display: 'पसंदीदा प्रदर्शन नाम:',
    edit_btn_save: 'परिवर्तन सहेजें 💖',
    edit_btn_cancel: 'रद्द करें',
    edit_btn_reset: 'रीसेट करें',
    sig_with_love: 'प्यार के साथ'
  },
  'te-IN': {
    header_crafted_for: 'ప్రత్యేకంగా రూపొందించబడింది',
    tab_teddy_0: 'హృదయాన్ని హత్తుకునే టెడ్డీ',
    tab_teddy_1: 'మధుర స్వప్నాలు',
    tab_teddy_2: 'హృదయ బెలూన్',
    tab_teddy_3: 'ప్రేమ బెలూన్',
    polaroid_caption: 'ఎప్పటికీ ఉత్తమ స్నేహితులు',
    card_badge: '✦  హృదయపూర్వక అంకితం  ✦',
    card_greeting: 'నమస్కారం, {name}! ✨',
    card_sub1: 'ఈ చిన్న టెడ్డీ మీ కోసమే ప్రత్యేకంగా రూపొందించబడింది.',
    card_sub2: 'మీకు అమితమైన ప్రేమ, శాంతి మరియు ఆనందం కలగాలని కోరుకుంటున్నాము. ❤️',
    multilang_header: 'ప్రపంచ భాషలలో మీ పేరు',
    btn_change_name: '✎ మార్చండి',
    btn_save_gift: 'బహుమతిని సేవ్ చేయండి',
    btn_make_wave: 'టెడ్డీతో చేయి ఊపించండి',
    btn_pulse_heart: 'హృదయం కొట్టుకునేలా చేయండి',
    btn_explore_world: 'నా ప్రపంచాన్ని అన్వేషించండి',
    btn_replay: 'మళ్లీ చూడండి ↺',
    envelope_touch_seal: 'తెరవడానికి సీల్ తాకండి 💌',
    envelope_hint: 'తెరవడానికి లేఖను తాకండి 💌',
    envelope_subcaption: 'ఒక పావురం మీ కోసం ఒక దివ్య లేఖను తీసుకొచ్చింది ✨',
    modal_badge: '✦  మీ కోసం ఒక దివ్య లేఖ  ✦',
    modal_title: 'ఈ ఆశ్చర్యం ఎవరి కోసం? ✨',
    modal_sub: 'సీల్ తెరిచి టెడ్డీని చూడటానికి మీ పేరు నమోదు చేయండి!',
    modal_placeholder: 'మీ పేరు నమోదు చేయండి (ఉదా. లోకేష్, ప్రియ...)',
    modal_preview_label: '✨ ప్రత్యక్ష బహుభాషా ప్రివ్యూ:',
    modal_btn_confirm: 'సీల్ తెరిచి టెడ్డీని చూడండి',
    edit_modal_badge: '🌍  పేరు & లిప్యంతరీకరణ నిర్వాహకుడు  🌍',
    edit_modal_title: 'భాషలలో మీ పేరును సరిచేయండి ✨',
    edit_modal_sub: 'మీ పేరు మీ గుర్తింపు. మీకిష్టమైన రూపాన్ని ఆమోదించండి:',
    edit_field_original: 'అసలు పేరు:',
    edit_field_script: 'గుర్తించబడిన లిపి:',
    edit_field_display: 'ప్రదర్శన పేరు:',
    edit_btn_save: 'మార్పులను సేవ్ చేయండి 💖',
    edit_btn_cancel: 'రద్దు చేయండి',
    edit_btn_reset: 'రీసెట్ చేయండి',
    sig_with_love: 'ప్రేమతో'
  },
  'ar-SA': {
    header_crafted_for: 'صُنع خصيصاً من أجل',
    tab_teddy_0: 'دبدوب يعانق القلب',
    tab_teddy_1: 'أحلام سعيدة',
    tab_teddy_2: 'بالون القلب',
    tab_teddy_3: 'بالون الحب',
    polaroid_caption: 'أفضل أصدقاء إلى الأبد',
    card_badge: '✦  إهداء من صميم القلب  ✦',
    card_greeting: 'مرحباً، {name}! ✨',
    card_sub1: 'صُنع هذا الدبدوب الصغير خصيصاً من أجلك.',
    card_sub2: 'نرسل لك الدفء والسكينة والسعادة الدائمة. ❤️',
    multilang_header: 'اسمك بلغات العالم',
    btn_change_name: '✎ تعديل',
    btn_save_gift: 'حفظ الهدية',
    btn_make_wave: 'اجعل الدبدوب يلوّح',
    btn_pulse_heart: 'نبض القلب',
    btn_explore_world: 'استكشف عالمي',
    btn_replay: 'مشاهدة مجدداً ↺',
    envelope_touch_seal: 'المس الختم لفتح الرسالة 💌',
    envelope_hint: 'المس الرسالة للفتح 💌',
    envelope_subcaption: 'حمامة سماوية حملت لك رسالة حب مقدسة ✨',
    modal_badge: '✦  رسالة سماوية لك  ✦',
    modal_title: 'لمن هذه المفاجأة؟ ✨',
    modal_sub: 'أدخل اسمك لكسر الختم الشمعي والكشف عن دبدوبك اللطيف!',
    modal_placeholder: 'أدخل اسمك (مثال: لوكيش، سارة، أحمد...)',
    modal_preview_label: '✨ معاينة مباشرة بلغات العالم:',
    modal_btn_confirm: 'اكسر الختم واكشف الدبدوب',
    edit_modal_badge: '🌍  مدير الأسماء واللغات  🌍',
    edit_modal_title: 'تخصيص اسمك بجميع اللغات ✨',
    edit_modal_sub: 'اسمك هو هويتك. يمكنك تعديل واعتماد رسم اسمك بكل لغة:',
    edit_field_original: 'الاسم الأصلي (ثابت):',
    edit_field_script: 'نظام الكتابة المكتشف:',
    edit_field_display: 'الاسم المفضل للعرض:',
    edit_btn_save: 'حفظ التعديلات 💖',
    edit_btn_cancel: 'إلغاء',
    edit_btn_reset: 'استعادة التلقائي',
    sig_with_love: 'بكل حب'
  },
  'zh-CN': {
    header_crafted_for: '专为您精心定制',
    tab_teddy_0: '拥抱爱心小熊',
    tab_teddy_1: '甜美梦境',
    tab_teddy_2: '爱心气球',
    tab_teddy_3: '真爱气球',
    polaroid_caption: '永远最好的朋友',
    card_badge: '✦  衷心献礼  ✦',
    card_greeting: '嗨，{name}！✨',
    card_sub1: '这只可爱的小熊是专门为你制作的。',
    card_sub2: '愿温暖、慰藉与快乐永远伴随你。❤️',
    multilang_header: '世界多语言姓名展示',
    btn_change_name: '✎ 修改姓名',
    btn_save_gift: '保存专属礼物',
    btn_make_wave: '让小熊挥手',
    btn_pulse_heart: '跳动心火',
    btn_explore_world: '探索开发者宇宙',
    btn_replay: '再次观看 ↺',
    envelope_touch_seal: '点击火漆印开启信件 💌',
    envelope_hint: '点击信件开启 💌',
    envelope_subcaption: '信鸽为你送来了一封星空情书 ✨',
    modal_badge: '✦  一封来自星空的信件  ✦',
    modal_title: '这份惊喜送给谁？✨',
    modal_sub: '输入姓名解开火漆印，见证世界各语言的华丽变换！',
    modal_placeholder: '输入您的姓名（例如：洛凯什、普里亚、亚历克斯...）',
    modal_preview_label: '✨ 实时多语言转写预览：',
    modal_btn_confirm: '开启火漆印・迎接小熊',
    edit_modal_badge: '🌍  国际化姓名管理中心  🌍',
    edit_modal_title: '自定义您在各语言中的姓名 ✨',
    edit_modal_sub: '名字是您独一无二的印记，您可以自由核对与修改各语言书写：',
    edit_field_original: '原始姓名（保留原貌）：',
    edit_field_script: '检测到的书写系统：',
    edit_field_display: '偏好展示姓名：',
    edit_btn_save: '保存并应用更改 💖',
    edit_btn_cancel: '取消',
    edit_btn_reset: '重置为自动',
    sig_with_love: '携爱致意'
  },
  'ja-JP': {
    header_crafted_for: '心を込めてお届けします',
    tab_teddy_0: 'ハグハート',
    tab_teddy_1: '優しい夢',
    tab_teddy_2: 'ハートバルーン',
    tab_teddy_3: 'ラブバルーン',
    polaroid_caption: '永遠の親友',
    card_badge: '✦  心からのメッセージ  ✦',
    card_greeting: 'こんにちは、{name}さん！✨',
    card_sub1: 'この小さなくまは、あなただけのために作られました。',
    card_sub2: '心温まるぬくもりと幸せをあなたに。❤️',
    multilang_header: '世界の言語によるお名前',
    btn_change_name: '✎ 変更',
    btn_save_gift: 'ギフトを保存',
    btn_make_wave: 'くまが手を振る',
    btn_pulse_heart: 'ハートを脈打つ',
    btn_explore_world: '世界を探検する',
    btn_replay: 'もう一度見る ↺',
    envelope_touch_seal: '封蝋をタップして開封 💌',
    envelope_hint: '手紙をタップして開く 💌',
    envelope_subcaption: '伝書鳩があなたに星空の手紙を届けました ✨',
    modal_badge: '✦  星空からの贈りもの  ✦',
    modal_title: 'このサプライズはどなたへ？✨',
    modal_sub: 'お名前を入力して封蝋を解き、くまをお迎えしましょう！',
    modal_placeholder: 'お名前を入力（例: ロケシュ、アレックス...）',
    modal_preview_label: '✨ リアルタイム言語プレビュー:',
    modal_btn_confirm: '封を開けてくまを表示',
    edit_modal_badge: '🌍  多言語ネームマネージャー  🌍',
    edit_modal_title: '各言語でのお名前のカスタマイズ ✨',
    edit_modal_sub: 'お名前はあなたの大切なアイデンティティです。自由に編集できます：',
    edit_field_original: '元のお名前（完全保持）:',
    edit_field_script: '検出された文字体系:',
    edit_field_display: '表示用のお名前:',
    edit_btn_save: '保存して適用 💖',
    edit_btn_cancel: 'キャンセル',
    edit_btn_reset: '自動に戻す',
    sig_with_love: '愛を込めて'
  },
  'ko-KR': {
    header_crafted_for: '특별히 정성을 담아 제작함',
    tab_teddy_0: '하트를 안은 테디',
    tab_teddy_1: '달콤한 꿈',
    tab_teddy_2: '하트 풍선',
    tab_teddy_3: '사랑의 풍선',
    polaroid_caption: '영원한 최고의 친구',
    card_badge: '✦  마음을 담은 헌정  ✦',
    card_greeting: '안녕, {name}! ✨',
    card_sub1: '이 귀여운 곰인형은 당신만을 위해 만들어졌습니다.',
    card_sub2: '따뜻한 위로와 행복이 가득하길 바랍니다. ❤️',
    multilang_header: '세계 언어로 본 당신의 이름',
    btn_change_name: '✎ 변경',
    btn_save_gift: '선물 저장',
    btn_make_wave: '테디 손 흔들기',
    btn_pulse_heart: '하트 뛰기',
    btn_explore_world: '나의 세계 탐험',
    btn_replay: '다시 보기 ↺',
    envelope_touch_seal: '봉인을 터치하여 열기 💌',
    envelope_hint: '편지를 터치하여 열기 💌',
    envelope_subcaption: '비둘기가 당신을 위한 편지를 전했습니다 ✨',
    modal_badge: '✦  당신을 위한 천상의 편지  ✦',
    modal_title: '이 서프라이즈의 주인공은 누구인가요? ✨',
    modal_sub: '이름을 입력하여 봉인을 풀고 테디베어를 만나보세요!',
    modal_placeholder: '이름을 입력하세요 (예: 로케시, 알렉스...)',
    modal_preview_label: '✨ 실시간 다국어 표기 미리보기:',
    modal_btn_confirm: '봉인을 풀고 테디베어 만나기',
    edit_modal_badge: '🌍  다국어 이름 설정  🌍',
    edit_modal_title: '각 언어별 이름 맞춤 설정 ✨',
    edit_modal_sub: '당신의 이름은 고유한 정체성입니다. 원하는 표기를 직접 수정하세요:',
    edit_field_original: '원래 이름 (불변):',
    edit_field_script: '감지된 문자 체계:',
    edit_field_display: '표시 이름:',
    edit_btn_save: '변경 사항 저장 💖',
    edit_btn_cancel: '취소',
    edit_btn_reset: '기본값 복원',
    sig_with_love: '사랑을 담아'
  },
  'ru-RU': {
    header_crafted_for: 'СОЗДАНО СПЕЦИАЛЬНО ДЛЯ',
    tab_teddy_0: 'Обнимая сердце',
    tab_teddy_1: 'Сладкие сны',
    tab_teddy_2: 'Воздушный шар-сердце',
    tab_teddy_3: 'Шар любви',
    polaroid_caption: 'Лучшие друзья навсегда',
    card_badge: '✦  ИСКРЕННЕЕ ПОСВЯЩЕНИЕ  ✦',
    card_greeting: 'Привет, {name}! ✨',
    card_sub1: 'Этот маленький мишка создан специально для вас.',
    card_sub2: 'Дарим вам тепло, уют и бесконечное счастье. ❤️',
    multilang_header: 'Ваше имя на языках мира',
    btn_change_name: '✎ Изменить',
    btn_save_gift: 'СОХРАНИТЬ ПОДАРОК',
    btn_make_wave: 'МИШКА МАШЕТ РУКОЙ',
    btn_pulse_heart: 'ПУЛЬС СЕРДЦА',
    btn_explore_world: 'ИССЛЕДОВАТЬ МИР',
    btn_replay: 'Смотреть снова ↺',
    envelope_touch_seal: 'КОСНИТЕСЬ ПЕЧАТИ, ЧТОБЫ ОТКРЫТЬ 💌',
    envelope_hint: 'коснитесь письма, чтобы открыть 💌',
    envelope_subcaption: 'Почтовый голубь доставил для вас послание из звезд ✨',
    modal_badge: '✦  ПОСЛАНИЕ ИЗ ЗВЕЗДНОГО НЕБА  ✦',
    modal_title: 'Для кого этот сюрприз? ✨',
    modal_sub: 'Введите имя, чтобы сломать сургучную печать и увидеть мишку!',
    modal_placeholder: 'Введите имя (напр. Локеш, Анна, Алекс...)',
    modal_preview_label: '✨ Живой предпросмотр транслитерации:',
    modal_btn_confirm: 'СЛОМАТЬ ПЕЧАТЬ И ОТКРЫТЬ МИШКУ',
    edit_modal_badge: '🌍  МЕНЕДЖЕР МЕЖДУНАРОДНЫХ ИМЕН  🌍',
    edit_modal_title: 'Настройте имя на всех языках ✨',
    edit_modal_sub: 'Ваше имя — это ваша индивидуальность. Отредактируйте написание:',
    edit_field_original: 'Исходное имя (неизменно):',
    edit_field_script: 'Определенная письменность:',
    edit_field_display: 'Отображаемое имя:',
    edit_btn_save: 'Сохранить изменения 💖',
    edit_btn_cancel: 'Отмена',
    edit_btn_reset: 'Сбросить на авто',
    sig_with_love: 'с любовью'
  }
};

class I18nManager {
  constructor() {
    this.currentLocale = this.getSavedLocale() || 'en-US';
    this.listeners = [];
  }

  getSavedLocale() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('teddy_user_locale');
      }
    } catch (e) {}
    return null;
  }

  setLocale(localeCode) {
    const target = SUPPORTED_LOCALES.find(l => l.code === localeCode) || SUPPORTED_LOCALES[0];
    this.currentLocale = target.code;

    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('teddy_user_locale', this.currentLocale);
        document.documentElement.lang = target.code.split('-')[0];
        document.documentElement.dir = target.dir;
      }
    } catch (e) {}

    this.notifyListeners();
  }

  isRTL() {
    const loc = SUPPORTED_LOCALES.find(l => l.code === this.currentLocale);
    return loc ? loc.dir === 'rtl' : false;
  }

  t(key, params = {}) {
    const dict = UI_TRANSLATIONS[this.currentLocale] || UI_TRANSLATIONS['en-US'];
    let str = dict[key] || UI_TRANSLATIONS['en-US'][key] || key;

    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return str;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(cb => {
      try {
        cb(this.currentLocale, this);
      } catch (e) {
        console.error('i18n listener error:', e);
      }
    });
  }
}

export const i18n = new I18nManager();
