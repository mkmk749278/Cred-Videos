/**
 * Doorstep-defense short: the ElevenLabs Telugu narration (public/audio/shorts/doorstep_vo_telugu.mp3, 67.16 s),
 * one entry per spoken phrase. s/e are seconds in the mp3, taken from the pauses in the audio
 * (ffmpeg silencedetect −38 dB / 0.18 s) and cross-checked against a Whisper pass.
 * Every visual beat in DoorstepShort.tsx keys off these, never off hand-typed frames.
 */
export type Line = {id: string; s: number; e: number; te: string; en: string};

export const VO_SECONDS = 67.16;

export const LINES: Line[] = [
  {id: 'knock', s: 0.0, e: 2.5, te: 'రికవరీ ఏజెంట్ మీ ఇంటి తలుపు తడుతున్నాడా?', en: 'Is a recovery agent knocking on your door?'},
  {id: 'wait', s: 2.98, e: 3.52, te: 'ఒక్క నిమిషం…', en: 'One minute…'},
  {id: 'dont', s: 4.02, e: 5.47, te: 'డోర్ అస్సలు ఓపెన్ చేయకండి!', en: "Don't open the door at all!"},
  {id: 'mistake', s: 6.0, e: 8.85, te: 'చాలామంది భయంతో చేసే బిగ్గెస్ట్ మిస్టేక్ ఏంటో తెలుసా?', en: 'Know the biggest mistake people make out of fear?'},
  {id: 'letin', s: 9.29, e: 12.22, te: 'వాడు బయట నిలబడి అరుస్తుంటే కంగారుపడి ఇంట్లోకి రానివ్వడం!', en: 'Panicking and letting him in while he shouts outside!'},
  {id: 'rule', s: 12.7, e: 16.36, te: 'అసలు మీ పర్మిషన్ లేకుండా ఎవర్నీ ఇంట్లోకి రానివ్వాల్సిన రూలే లేదు.', en: 'No rule says you must let anyone in without your permission.'},
  {id: 'ask2', s: 16.87, e: 21.21, te: 'వాడు ఎంత గట్టిగా మాట్లాడినా, డోర్ దగ్గరే ఆపి జస్ట్ ఈ రెండు విషయాలు అడగండి:', en: 'However loud he gets, stop him at the door and ask just two things:'},
  {id: 'n1', s: 21.59, e: 22.09, te: 'నెంబర్ వన్:', en: 'Number one:'},
  {id: 'id', s: 22.55, e: 24.49, te: 'మీ అఫీషియల్ బ్యాంక్ ఐడీ కార్డు చూపించండి.', en: 'Show me your official bank ID card.'},
  {id: 'n2', s: 24.97, e: 25.52, te: 'నెంబర్ టూ:', en: 'Number two:'},
  {id: 'letter', s: 25.96, e: 29.54, te: 'నా స్పెసిఫిక్ అకౌంట్ కోసం బ్యాంక్ ఇచ్చిన రిటన్ ఆథరైజేషన్ లెటర్ ఎక్కడ?', en: 'Where is the written authorization letter the bank gave for my account?'},
  {id: 'trust', s: 30.63, e: 31.09, te: 'ట్రస్ట్ మీ…', en: 'Trust me…'},
  {id: 'ninety', s: 31.45, e: 35.44, te: 'తొంబై శాతం లోకల్ ఏజెంట్ల దగ్గర ఈ ఆథరైజేషన్ లెటర్ అస్సలు ఉండదు!', en: '90% of local agents simply won\'t have this letter!'},
  {id: 'most', s: 35.91, e: 36.99, te: 'అండ్ మోస్ట్ ఇంపార్టెంట్:', en: 'And most important:'},
  {id: 'cash', s: 37.32, e: 39.58, te: 'ఎవరి చేతికీ ఒక్క రూపాయి క్యాష్ ఇవ్వొద్దు.', en: "Don't hand anyone even one rupee in cash."},
  {id: 'sign', s: 39.88, e: 41.39, te: 'ఏ పేపర్ మీద సైన్ చేయొద్దు.', en: "Don't sign any paper."},
  {id: 'threat', s: 41.86, e: 43.04, te: 'వాడు బెదిరించాలని చూస్తే?', en: 'If he tries to threaten you?'},
  {id: 'argue', s: 43.51, e: 44.54, te: 'అస్సలు వాదించకండి.', en: "Don't argue at all."},
  {id: 'call', s: 44.86, e: 47.62, te: 'జస్ట్ ఫోన్ తీసి ఒకటి ఒకటి రెండుకి కాల్ చేయండి.', en: 'Just pick up the phone and call 112.'},
  {id: 'rbi', s: 48.16, e: 50.52, te: 'కానీ అసలు RBI రూల్స్ ప్రకారం', en: 'But under the actual RBI rules,'},
  {id: 'silent', s: 50.6, e: 52.53, te: 'వీళ్ళని లీగల్‌గా ఎలా సైలెంట్ చేయాలి?', en: 'how do you legally silence them?'},
  {id: 'stop', s: 52.91, e: 55.8, te: 'రికవరీ కాల్స్‌కి శాశ్వతంగా ఫుల్‌స్టాప్ ఎలా పెట్టాలి?', en: 'How do you put a permanent full stop to recovery calls?'},
  {id: 'full', s: 56.24, e: 60.93, te: 'కంప్లీట్ ప్రాసెస్ మన ఛానల్‌లోని ఫుల్ వీడియోలో స్టెప్ బై స్టెప్ క్లియర్‌గా చూపించాను.', en: "I've shown the complete process step by step in the full video on our channel."},
  {id: 'link', s: 61.25, e: 64.17, te: 'వెంటనే కింద ఉన్న లింక్ క్లిక్ చేసి ఫుల్ వీడియో చూసేయండి.', en: 'Click the link below right now and watch the full video.'},
  {id: 'save', s: 64.51, e: 66.79, te: 'అండ్ ఈ వీడియోని తప్పకుండా సేవ్ చేసుకోండి!', en: 'And be sure to save this video!'},
];

export const L = Object.fromEntries(LINES.map((l) => [l.id, l])) as Record<string, Line>;
