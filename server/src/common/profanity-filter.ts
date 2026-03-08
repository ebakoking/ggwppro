const BANNED_WORDS = [
  'amk', 'aq', 'amq', 'amına', 'amına koyayım', 'amınakoyim', 'amınakoyayım',
  'orospu', 'oç', 'orspu', 'orospuçocuğu', 'orospucocugu',
  'piç', 'pic', 'piçlik',
  'sikeyim', 'siktir', 'sikerim', 'siktiğim', 'siktirgit', 'sikim', 'sik',
  'yarrak', 'yarak', 'yarrağ',
  'göt', 'götveren', 'götlek',
  'ananı', 'ananızı', 'anasını',
  'pezevenk', 'puşt', 'ibne',
  'gavat', 'kahpe', 'kaltak', 'kevaşe',
  'manyak', 'gerizekalı', 'salak', 'aptal', 'mal',
  'haysiyetsiz', 'şerefsiz', 'namussuz',
  'bok', 'boktan',
  'dangalak', 'ezik',
  'dalyarak', 'dalyarrak',
  'hassiktir', 'hsktr',
  'yavşak', 'yavşağ',
  'döl', 'dölün',
  'kodumun', 'kodumunun',
];

const pattern = new RegExp(
  BANNED_WORDS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'i',
);

export function containsProfanity(text: string): boolean {
  const normalized = text
    .replace(/[0@]/g, 'o')
    .replace(/[1!|ı]/g, 'i')
    .replace(/[3€]/g, 'e')
    .replace(/[4]/g, 'a')
    .replace(/[5\$]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/\./g, '')
    .replace(/-/g, '')
    .replace(/_/g, '')
    .toLowerCase();
  return pattern.test(normalized);
}

export function censorText(text: string): string {
  return text.replace(pattern, (match) => '*'.repeat(match.length));
}
