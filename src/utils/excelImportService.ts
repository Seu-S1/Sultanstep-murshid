import * as XLSX from 'xlsx';
import { Question, ExamModel, SkillType } from '../types';

export interface ParsedQuestionRow {
  rowIndex: number;
  rowNumberInExcel: number;
  questionId: string;
  modelId: string;
  modelTitle: string;
  modelNumber: number;
  questionText: string;
  optA: string;
  optB: string;
  optC: string;
  optD: string;
  correctOption: 'A' | 'B' | 'C' | 'D' | '';
  skill: SkillType;
  passage?: string;
  passageTitle?: string;
  explanation: string;
  imageUrl?: string;
  errors: string[];
  warnings: string[];
  status: 'valid' | 'has_errors' | 'warning';
  isExisting: boolean;
  willUpdate: boolean;
}

export interface SheetParseResult {
  sheetName: string;
  fileName: string;
  totalRows: number;
  headersDetected: Record<string, string>;
  questions: ParsedQuestionRow[];
  stats: {
    totalDetected: number;
    recognizedAnswersCount: number;
    missingAnswersCount: number;
    validCount: number;
    errorCount: number;
    warningCount: number;
    newCount: number;
    existingCount: number;
    updateCount: number;
    flaggedRows: number[];
  };
  detectedModels: { id: string; number: number; title: string; count: number }[];
  detectedPassagesCount: number;
}

// Comprehensive & Flexible Header Matchers
const HEADER_PATTERNS: Record<string, string[]> = {
  questionId: [
    'questionid',
    'question_id',
    'id',
    'qid',
    'معرف_السؤال',
    'معرف السؤال',
    'معرفالسؤال',
    'كود_السؤال',
    'كود السؤال',
    'رقم_السؤال',
    'رقم السؤال',
  ],
  model: [
    'model',
    'modelid',
    'model_id',
    'النموذج',
    'النموذج_رقم',
    'رقم_النموذج',
    'رقم النموذج',
    'اسم_النموذج',
    'اسم النموذج',
    'step',
    'step_model',
  ],
  question: [
    'question',
    'questiontext',
    'question_text',
    'السؤال',
    'نص_السؤال',
    'نص السؤال',
    'نصالسؤال',
    'منطوق_السؤال',
    'منطوق السؤال',
    'q',
    'stem',
  ],
  optionA: [
    'optiona',
    'option_a',
    'opta',
    'opt_a',
    'a',
    'a.',
    'a)',
    '(a)',
    'الخيار الأول',
    'الخيار_الأول',
    'الخيار الاول',
    'الخيار_الاول',
    'الخيارالاول',
    'الخيارالأول',
    'خيار أ',
    'خيار_أ',
    'خيار ا',
    'خيار_ا',
    'أ',
    'ا',
    'أ.',
    'ا.',
    'الخيار_أ',
    'الخيار أ',
    'خيار a',
    'خيار_a',
    'option 1',
    'option1',
    'opt1',
    '1',
    '1.',
  ],
  optionB: [
    'optionb',
    'option_b',
    'optb',
    'opt_b',
    'b',
    'b.',
    'b)',
    '(b)',
    'الخيار الثاني',
    'الخيار_الثاني',
    'الخيارالثاني',
    'خيار ب',
    'خيار_ب',
    'ب',
    'ب.',
    'الخيار_ب',
    'الخيار ب',
    'خيار b',
    'خيار_b',
    'option 2',
    'option2',
    'opt2',
    '2',
    '2.',
  ],
  optionC: [
    'optionc',
    'option_c',
    'optc',
    'opt_c',
    'c',
    'c.',
    'c)',
    '(c)',
    'الخيار الثالث',
    'الخيار_الثالث',
    'الخيارالثالث',
    'خيار ج',
    'خيار_ج',
    'ج',
    'ج.',
    'الخيار_ج',
    'الخيار ج',
    'خيار c',
    'خيار_c',
    'option 3',
    'option3',
    'opt3',
    '3',
    '3.',
  ],
  optionD: [
    'optiond',
    'option_d',
    'optd',
    'opt_d',
    'd',
    'd.',
    'd)',
    '(d)',
    'الخيار الرابع',
    'الخيار_الرابع',
    'الخيارالرابع',
    'خيار د',
    'خيار_د',
    'د',
    'د.',
    'الخيار_د',
    'الخيار د',
    'خيار d',
    'خيار_d',
    'option 4',
    'option4',
    'opt4',
    '4',
    '4.',
  ],
  correctAnswer: [
    'correctanswer',
    'correct_answer',
    'correct',
    'answer',
    'correctoption',
    'correct_option',
    'correctopt',
    'الإجابة',
    'الاجابة',
    'الإجابة الصحيحة',
    'الاجابة الصحيحة',
    'الإجابة_الصحيحة',
    'الاجابة_الصحيحة',
    'الإجابةالصحيحة',
    'الاجابةالصحيحة',
    'الحل',
    'حل',
    'الخيار_الصحيح',
    'الخيار الصحيح',
    'رمز_الإجابة',
    'رمز الإجابة',
    'رمز_الاجابة',
    'رمز الاجابة',
    'رمزالإجابة',
    'مفتاح_الإجابة',
    'مفتاح الإجابة',
    'مفتاح_الاجابة',
    'مفتاح الاجابة',
    'مفتاح الحل',
    'مفتاح_الحل',
    'الإجابة_المعتمدة',
    'ans',
    'key',
    'answerkey',
    'answer_key',
    'rightanswer',
    'right_answer',
    'solution',
  ],
  section: [
    'section',
    'skill',
    'القسم',
    'المهارة',
    'نوع_السؤال',
    'نوع السؤال',
    'التصنيف',
    'قسم',
    'مهارة',
    'category',
    'type',
  ],
  passage: [
    'passage',
    'reading_passage',
    'passagetext',
    'passage_text',
    'القطعة',
    'قطعة_القراءة',
    'قطعة القراءة',
    'قطعةالقراءة',
    'نص_القطعة',
    'نص القطعة',
    'text',
  ],
  passageTitle: [
    'passagetitle',
    'passage_title',
    'عنوان_القطعة',
    'عنوان القطعة',
    'عنوانالقطعة',
  ],
  explanation: [
    'explanation',
    'الشرح',
    'التوضيح',
    'التفسير',
    'شرح_الإجابة',
    'شرح الإجابة',
    'شرح_الاجابة',
    'تعليل',
    'شرح',
    'rationale',
  ],
  image: [
    'image',
    'imageurl',
    'image_url',
    'الصورة',
    'رابط_الصورة',
    'رابط الصورة',
    'صورة',
    'ملف_الصورة',
  ],
};

function cleanHeaderStr(str: any): string {
  if (str === undefined || str === null) return '';
  return str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s_\-–—.:/\\()[\]{}]+/g, '');
}

/**
 * Strict two-pass header matcher:
 * Pass 1: Strict Exact match (prevents single-letter patterns from matching substrings)
 * Pass 2: Controlled substring match for long keywords (length >= 4 only)
 */
export function matchHeader(headerStr: any): string | null {
  if (headerStr === undefined || headerStr === null) return null;
  const clean = cleanHeaderStr(headerStr);
  if (!clean) return null;

  // Pass 1: Strict exact match across all patterns
  for (const [key, patterns] of Object.entries(HEADER_PATTERNS)) {
    for (const pat of patterns) {
      if (clean === cleanHeaderStr(pat)) {
        return key;
      }
    }
  }

  // Pass 2: Controlled prefix/contains match for long multi-character patterns (length >= 4)
  for (const [key, patterns] of Object.entries(HEADER_PATTERNS)) {
    for (const pat of patterns) {
      const cleanPat = cleanHeaderStr(pat);
      if (cleanPat.length >= 4) {
        if (clean === cleanPat || clean.startsWith(cleanPat) || clean.endsWith(cleanPat) || clean.includes(cleanPat)) {
          return key;
        }
      }
    }
  }

  return null;
}

/**
 * Normalizes text for safe string comparison between cell answer and options
 */
function cleanAnswerText(val: any): string {
  if (val === undefined || val === null) return '';
  return val
    .toString()
    .trim()
    .toLowerCase()
    .replace(/^["'«»“”\s]+|["'«»“”\s]+$/g, '') // remove surrounding quotes
    .replace(/^(option|choice|خيار|الخيار)?\s*([a-d1-4١-٤أ-دإآا])\s*[.:)\-_]+\s*/i, '') // strip leading letter/number prefix e.g. "A: cold" -> "cold"
    .replace(/[\s\t\r\n]+/g, ' ') // collapse whitespaces
    .replace(/[.,;!?:()]+$/g, '') // remove trailing punctuation
    .trim();
}

/**
 * Normalizes Arabic characters for robust comparison
 */
function normalizeArabicChars(text: string): string {
  return text
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ئ/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/[\u064B-\u065F]/g, '') // remove Arabic harakat (tashkeel)
    .replace(/[\u0660-\u0669]/g, (c) => String(c.charCodeAt(0) - 0x0660)); // convert Eastern Arabic digits
}

/**
 * Robust, highly flexible and safe Correct Answer Normalizer.
 * Supports:
 * 1. Standard letters: A, B, C, D (and lowercase a, b, c, d)
 * 2. Numbers: 1, 2, 3, 4 (and Eastern Arabic numerals: ١, ٢, ٣, ٤)
 * 3. Arabic letters: أ, ب, ج, د (and variations: ا, إ, آ)
 * 4. Prefixes & labels:
 *    - "A: cold", "A) cold", "A. cold", "A - cold"
 *    - "1: cold", "1) cold", "1. cold", "1 - cold"
 *    - "أ: بارد", "أ) بارد", "أ. بارد", "أ - بارد"
 *    - "Option A", "Choice B", "الخيار أ", "الخيار الأول", "الإجابة ج", "رمز د", "الحل: أ"
 * 5. Full Option Text Matching:
 *    - If cell contains the exact text of one of the options (e.g. correctAnswer: "cold", optA: "cold" -> 'A')
 *    - Trims extra whitespace, surrounding quotes ("cold", 'cold', “cold”, «cold»), and trailing punctuation.
 *    - Arabic normalization (removes tashkeel/harakat, unifies alifs and taa marbouta).
 *    - Safe: only matches if unique or exact, never wild partial substring matching.
 */
export function normalizeCorrectAnswer(
  val: any,
  optA: string = '',
  optB: string = '',
  optC: string = '',
  optD: string = ''
): 'A' | 'B' | 'C' | 'D' | null {
  if (val === undefined || val === null) return null;

  const rawStr = val.toString().trim();
  if (!rawStr) return null;

  // Clean string removing common enclosing marks and quotes
  const cleanStr = rawStr
    .replace(/^["'«»“”()[\]{}]+|["'«»“”()[\]{}]+$/g, '')
    .trim();

  if (!cleanStr) return null;

  // Strip common leading labels like "الإجابة:", "الخيار:", "الحل:", "مفتاح:", "Answer:", "Option:", "Key:"
  const strippedLabel = cleanStr
    .replace(/^(الإجابة|الاجابة|الخيار|خيار|الحل|حل|رمز|مفتاح|مفتاح_الإجابة|answer|option|choice|key|ans)[\s.:)\-_=]+/i, '')
    .trim();

  // Helper for single symbol evaluation
  const evaluateToken = (token: string): 'A' | 'B' | 'C' | 'D' | null => {
    const t = token
      .replace(/^["'«»“”()[\]{}]+|["'«»“”()[\]{}]+$/g, '')
      .replace(/[.:)\-_#]+$/, '')
      .trim();
    const upper = t.toUpperCase();

    // A / 1 / ١ / أ / ا / إ / آ
    if (
      upper === 'A' ||
      upper === '1' ||
      upper === '١' ||
      t === 'أ' ||
      t === 'ا' ||
      t === 'إ' ||
      t === 'آ' ||
      upper === 'OPTIONA' ||
      upper === 'CHOICEA' ||
      upper === 'OPTA' ||
      t.includes('الخيار الأول') ||
      t.includes('الخيار الاول') ||
      t.includes('خيار أ') ||
      t.includes('الخيار أ') ||
      t.includes('الإجابة أ') ||
      t.includes('الاجابة أ') ||
      t === 'خيار 1' ||
      t === 'الخيار 1'
    ) {
      return 'A';
    }

    // B / 2 / ٢ / ب
    if (
      upper === 'B' ||
      upper === '2' ||
      upper === '٢' ||
      t === 'ب' ||
      upper === 'OPTIONB' ||
      upper === 'CHOICEB' ||
      upper === 'OPTB' ||
      t.includes('الخيار الثاني') ||
      t.includes('خيار ب') ||
      t.includes('الخيار ب') ||
      t.includes('الإجابة ب') ||
      t.includes('الاجابة ب') ||
      t === 'خيار 2' ||
      t === 'الخيار 2'
    ) {
      return 'B';
    }

    // C / 3 / ٣ / ج
    if (
      upper === 'C' ||
      upper === '3' ||
      upper === '٣' ||
      t === 'ج' ||
      upper === 'OPTIONC' ||
      upper === 'CHOICEC' ||
      upper === 'OPTC' ||
      t.includes('الخيار الثالث') ||
      t.includes('خيار ج') ||
      t.includes('الخيار ج') ||
      t.includes('الإجابة ج') ||
      t.includes('الاجابة ج') ||
      t === 'خيار 3' ||
      t === 'الخيار 3'
    ) {
      return 'C';
    }

    // D / 4 / ٤ / د
    if (
      upper === 'D' ||
      upper === '4' ||
      upper === '٤' ||
      t === 'د' ||
      upper === 'OPTIOND' ||
      upper === 'CHOICED' ||
      upper === 'OPTD' ||
      t.includes('الخيار الرابع') ||
      t.includes('خيار د') ||
      t.includes('الخيار د') ||
      t.includes('الإجابة د') ||
      t.includes('الاجابة د') ||
      t === 'خيار 4' ||
      t === 'الخيار 4'
    ) {
      return 'D';
    }

    return null;
  };

  // 1. Direct match on stripped label (e.g. "A", "أ", "1", "الإجابة: د")
  const directMatch = evaluateToken(strippedLabel) || evaluateToken(cleanStr);
  if (directMatch) return directMatch;

  // 2. Prefix pattern match: "A: cold", "B) warm", "1 - heat", "أ. fire"
  const prefixRegex = /^([A-Da-d1-4١-٤أ-دإآا])\s*([.:)\-_/\\#]+|\s+)\s*(.*)$/;
  const pMatch = strippedLabel.match(prefixRegex) || cleanStr.match(prefixRegex);
  if (pMatch) {
    const pfxSymbol = evaluateToken(pMatch[1]);
    if (pfxSymbol) return pfxSymbol;
  }

  // 3. Full Text Matching with Option texts:
  // When the cell contains the full answer text, e.g. "cold"
  const cleanTarget = cleanAnswerText(cleanStr);
  if (cleanTarget.length > 0) {
    const textA = cleanAnswerText(optA);
    const textB = cleanAnswerText(optB);
    const textC = cleanAnswerText(optC);
    const textD = cleanAnswerText(optD);

    // 3a. Exact match (case-insensitive, trimmed)
    if (textA && cleanTarget === textA) return 'A';
    if (textB && cleanTarget === textB) return 'B';
    if (textC && cleanTarget === textC) return 'C';
    if (textD && cleanTarget === textD) return 'D';

    // 3b. Normalized Arabic characters match (unifies alifs, taa marbouta, removes harakat)
    const normTarget = normalizeArabicChars(cleanTarget);
    if (normTarget.length > 0) {
      const normA = normalizeArabicChars(textA);
      const normB = normalizeArabicChars(textB);
      const normC = normalizeArabicChars(textC);
      const normD = normalizeArabicChars(textD);

      if (normA && normTarget === normA) return 'A';
      if (normB && normTarget === normB) return 'B';
      if (normC && normTarget === normC) return 'C';
      if (normD && normTarget === normD) return 'D';
    }

    // 3c. Safe prefix-stripped option matching (if options themselves had "A: cold" in Excel)
    const stripOptionPrefix = (str: string) =>
      str.replace(/^(option|choice|خيار|الخيار)?\s*([a-d1-4١-٤أ-دإآا])\s*[.:)\-_]+\s*/i, '').trim();

    const pureA = stripOptionPrefix(textA);
    const pureB = stripOptionPrefix(textB);
    const pureC = stripOptionPrefix(textC);
    const pureD = stripOptionPrefix(textD);

    if (pureA && cleanTarget === pureA) return 'A';
    if (pureB && cleanTarget === pureB) return 'B';
    if (pureC && cleanTarget === pureC) return 'C';
    if (pureD && cleanTarget === pureD) return 'D';
  }

  return null;
}

// Normalize skill/section
function normalizeSkill(val: any): { skill: SkillType; warning?: string } {
  if (!val) return { skill: 'grammar', warning: 'لم يتم تحديد القسم، تم اعتماده تلقائياً كـ Grammar.' };
  const s = val.toString().trim().toLowerCase();

  if (s.includes('gram') || s.includes('قواعد') || s.includes('تركيب')) {
    return { skill: 'grammar' };
  }
  if (s.includes('read') || s.includes('قراء') || s.includes('فهم المقروء') || s.includes('استيعاب')) {
    return { skill: 'reading' };
  }
  if (s.includes('listen') || s.includes('استماع') || s.includes('سماع') || s.includes('صوت')) {
    return { skill: 'listening' };
  }
  if (s.includes('vocab') || s.includes('مفرد') || s.includes('كلمات') || s.includes('معاني')) {
    return { skill: 'vocabulary' };
  }

  return { skill: 'grammar', warning: `القسم "${val}" غير معياري، تم اعتماده كـ Grammar.` };
}

// Extract model number & ID
function normalizeModel(val: any, defaultModelId: string): { modelId: string; modelNumber: number; modelTitle: string } {
  if (!val) {
    const num = parseInt(defaultModelId.replace(/\D/g, '')) || 51;
    return {
      modelId: defaultModelId,
      modelNumber: num,
      modelTitle: `نموذج STEP ${num}`,
    };
  }

  const str = val.toString().trim();
  const digits = str.replace(/\D/g, '');
  const num = digits ? parseInt(digits, 10) : 51;
  const modelId = `step-${num < 10 ? `0${num}` : num}`;

  return {
    modelId,
    modelNumber: num,
    modelTitle: `نموذج STEP ${num}`,
  };
}

/**
 * Main Excel parsing engine
 */
export async function parseExcelWorkbook(
  file: File,
  existingQuestions: Question[],
  defaultModelId: string = 'step-51'
): Promise<{ workbook: XLSX.WorkBook; sheetNames: string[]; parseSheet: (sheetName: string) => SheetParseResult }> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellDates: true,
    cellText: true,
  });

  const sheetNames = workbook.SheetNames;

  const parseSheet = (sheetName: string): SheetParseResult => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      throw new Error(`تعذر العثور على الورقة "${sheetName}" في الملف.`);
    }

    // Convert sheet to 2D array of rows
    const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: '',
      blankrows: false,
    });

    if (rawRows.length === 0) {
      return {
        sheetName,
        fileName: file.name,
        totalRows: 0,
        headersDetected: {},
        questions: [],
        stats: {
          totalDetected: 0,
          recognizedAnswersCount: 0,
          missingAnswersCount: 0,
          validCount: 0,
          errorCount: 0,
          warningCount: 0,
          newCount: 0,
          existingCount: 0,
          updateCount: 0,
          flaggedRows: [],
        },
        detectedModels: [],
        detectedPassagesCount: 0,
      };
    }

    // Find the header row (Search first 10 rows for recognizable headers)
    let headerRowIdx = -1;
    let headerColMap: Record<string, number> = {};
    const headersDetectedLabels: Record<string, string> = {};

    for (let r = 0; r < Math.min(10, rawRows.length); r++) {
      const row = rawRows[r];
      if (!Array.isArray(row)) continue;

      const tempMap: Record<string, number> = {};
      let matchedCount = 0;

      row.forEach((cellVal, colIdx) => {
        const field = matchHeader(cellVal);
        if (field && tempMap[field] === undefined) {
          tempMap[field] = colIdx;
          matchedCount++;
        }
      });

      // If we found at least 2 key fields (like question + optionA), this is our header row
      if (matchedCount >= 2 && (tempMap.question !== undefined || tempMap.optionA !== undefined)) {
        headerRowIdx = r;
        headerColMap = tempMap;
        row.forEach((val, idx) => {
          const f = matchHeader(val);
          if (f) headersDetectedLabels[f] = String(val).trim();
        });
        break;
      }
    }

    // Fallback: If no header found, assume row 0 is header or default column order
    if (headerRowIdx === -1) {
      headerRowIdx = 0;
      // Default standard order fallback
      headerColMap = {
        questionId: 0,
        model: 1,
        question: 2,
        optionA: 3,
        optionB: 4,
        optionC: 5,
        optionD: 6,
        correctAnswer: 7,
        section: 8,
        passage: 9,
        explanation: 10,
        image: 11,
      };
    }

    const existingById = new Map<string, Question>();
    const existingByText = new Map<string, Question>();
    existingQuestions.forEach((q) => {
      existingById.set(q.id.trim(), q);
      existingByText.set(q.questionText.trim().toLowerCase(), q);
    });

    const parsedQuestions: ParsedQuestionRow[] = [];
    const modelsCountMap = new Map<string, { id: string; number: number; title: string; count: number }>();
    const uniquePassages = new Set<string>();

    let validCount = 0;
    let errorCount = 0;
    let warningCount = 0;
    let newCount = 0;
    let existingCount = 0;
    let updateCount = 0;
    let recognizedAnswersCount = 0;
    let missingAnswersCount = 0;
    const flaggedRows: number[] = [];

    // Process data rows
    for (let r = headerRowIdx + 1; r < rawRows.length; r++) {
      const row = rawRows[r];
      if (!row || row.length === 0) continue;

      const getColVal = (field: string): string => {
        const colIdx = headerColMap[field];
        if (colIdx === undefined || colIdx >= row.length) return '';
        const val = row[colIdx];
        if (val === undefined || val === null) return '';
        return String(val).trim();
      };

      const qText = getColVal('question');
      const optA = getColVal('optionA');
      const optB = getColVal('optionB');
      const optC = getColVal('optionC');
      const optD = getColVal('optionD');
      const rawAns = getColVal('correctAnswer');
      const rawSection = getColVal('section');
      const rawModel = getColVal('model');
      const rawPassage = getColVal('passage');
      const rawPassageTitle = getColVal('passageTitle');
      const rawExplanation = getColVal('explanation');
      const rawImage = getColVal('image');
      let rawId = getColVal('questionId');

      // Skip completely blank rows
      if (!qText && !optA && !optB && !optC && !optD) continue;

      const questionSeqNumber = parsedQuestions.length + 1;
      const errors: string[] = [];
      const warnings: string[] = [];

      // 1. Validate Question Text
      if (!qText) {
        errors.push('نص السؤال فارغ أو غير مقروء.');
      }

      // 2. Validate Options
      if (!optA) errors.push('الخيار A فارغ.');
      if (!optB) errors.push('الخيار B فارغ.');
      if (!optC) errors.push('الخيار C فارغ.');
      if (!optD) errors.push('الخيار D فارغ.');

      // 3. Validate & Normalize Correct Answer
      const normalizedAns = normalizeCorrectAnswer(rawAns, optA, optB, optC, optD);
      if (normalizedAns) {
        recognizedAnswersCount++;
      } else {
        missingAnswersCount++;
        flaggedRows.push(questionSeqNumber);
        errors.push(
          rawAns
            ? `لم يتم التعرف على الإجابة "${rawAns}" (تحتاج مراجعة وتحديد الخيار الصحيح).`
            : 'الإجابة الصحيحة غير محددة (تحتاج مراجعة).'
        );
      }

      // 4. Normalize Skill/Section
      const { skill, warning: skillWarn } = normalizeSkill(rawSection);
      if (skillWarn) warnings.push(skillWarn);

      // 5. Normalize Model
      const modelInfo = normalizeModel(rawModel, defaultModelId);

      // Track Model
      if (!modelsCountMap.has(modelInfo.modelId)) {
        modelsCountMap.set(modelInfo.modelId, {
          id: modelInfo.modelId,
          number: modelInfo.modelNumber,
          title: modelInfo.modelTitle,
          count: 0,
        });
      }
      modelsCountMap.get(modelInfo.modelId)!.count++;

      // Track Passage
      if (rawPassage) {
        uniquePassages.add(rawPassage.trim().slice(0, 100));
      }

      // 6. Generate or verify questionId
      if (!rawId) {
        // Generate deterministic ID based on model and sequential index
        rawId = `q-${modelInfo.modelId}-${r - headerRowIdx}`;
      }

      // 7. Check duplicates & updates against DB
      const existingMatch = existingById.get(rawId) || existingByText.get(qText.toLowerCase());
      const isExisting = !!existingMatch;
      let willUpdate = false;

      if (isExisting && existingMatch) {
        existingCount++;
        // Check if content has changed
        const hasContentChange =
          existingMatch.questionText !== qText ||
          existingMatch.correctOption !== normalizedAns ||
          existingMatch.options[0]?.text !== optA ||
          existingMatch.options[1]?.text !== optB ||
          existingMatch.options[2]?.text !== optC ||
          existingMatch.options[3]?.text !== optD ||
          existingMatch.explanation !== rawExplanation;

        if (hasContentChange) {
          willUpdate = true;
          updateCount++;
          warnings.push(`سيتم تحديث بيانات السؤال القائم (ID: ${existingMatch.id}).`);
        }
      } else {
        newCount++;
      }

      const hasErrors = errors.length > 0;
      if (hasErrors) {
        errorCount++;
      } else {
        validCount++;
      }

      if (warnings.length > 0 && !hasErrors) {
        warningCount++;
      }

      parsedQuestions.push({
        rowIndex: parsedQuestions.length,
        rowNumberInExcel: r + 1,
        questionId: rawId,
        modelId: modelInfo.modelId,
        modelTitle: modelInfo.modelTitle,
        modelNumber: modelInfo.modelNumber,
        questionText: qText,
        optA,
        optB,
        optC,
        optD,
        correctOption: normalizedAns || '',
        skill,
        passage: rawPassage || undefined,
        passageTitle: rawPassageTitle || undefined,
        explanation: rawExplanation || 'شرح تفصيلي للسؤال لتوضيح الإجابة الصحيحة.',
        imageUrl: rawImage || undefined,
        errors,
        warnings,
        status: hasErrors ? 'has_errors' : warnings.length > 0 ? 'warning' : 'valid',
        isExisting,
        willUpdate,
      });
    }

    return {
      sheetName,
      fileName: file.name,
      totalRows: rawRows.length,
      headersDetected: headersDetectedLabels,
      questions: parsedQuestions,
      stats: {
        totalDetected: parsedQuestions.length,
        recognizedAnswersCount,
        missingAnswersCount,
        validCount,
        errorCount,
        warningCount,
        newCount,
        existingCount,
        updateCount,
        flaggedRows,
      },
      detectedModels: Array.from(modelsCountMap.values()),
      detectedPassagesCount: uniquePassages.size,
    };
  };

  return {
    workbook,
    sheetNames,
    parseSheet,
  };
}

/**
 * Downloads a standard, beautifully formatted Excel Template (.xlsx) for STEP questions
 */
export function downloadExcelTemplate(): void {
  const sampleRows = [
    {
      questionId: 'q-step-51-01',
      model: '51',
      question: 'Had the flight attendants known about the turbulence, they ________ the beverage service earlier.',
      optionA: 'would delay',
      optionB: 'would have delayed',
      optionC: 'will delay',
      optionD: 'have delayed',
      correctAnswer: 'B',
      section: 'grammar',
      passage: '',
      explanation: 'حالة شرطية ثالثة Third Conditional: Had + S + V3 يتبعها would have + V3',
      image: '',
    },
    {
      questionId: 'q-step-51-02',
      model: '51',
      question: 'The scientific journal editorial was commended for its ________ peer-review standards.',
      optionA: 'lax',
      optionB: 'rigorous',
      optionC: 'casual',
      optionD: 'negligent',
      correctAnswer: 'B',
      section: 'vocabulary',
      passage: '',
      explanation: 'المعنى السياقي لكلمة rigorous هو صارم ودقيق أكاديمياً.',
      image: '',
    },
    {
      questionId: 'q-step-51-03',
      model: '51',
      question: 'According to paragraph 1, what is the primary consequence of rising sea temperatures on coral reefs?',
      optionA: 'Increased biodiversity in shallow waters',
      optionB: 'Widespread coral bleaching and loss of symbiotic algae',
      optionC: 'Rapid expansion of reef boundaries northwards',
      optionD: 'Complete cessation of ocean currents',
      correctAnswer: 'B',
      section: 'reading',
      passage:
        'Coral reefs are among the most biodiverse ecosystems on Earth, often termed the rainforests of the sea. However, rising sea surface temperatures have triggered widespread coral bleaching events. When water temperatures exceed normal thresholds for extended periods, corals expel the symbiotic algae (zooxanthellae) living in their tissues, turning them completely white. Without these photosynthetic organisms, corals lose their primary source of nutrition and become vulnerable to mortality.',
      explanation: 'الفقرة الأولى تنص صراحة على أن ارتفاع درجات الحرارة يسبب طرد الطحالب التكافلية مما يؤدي لابيضاض المرجان.',
      image: '',
    },
    {
      questionId: 'q-step-51-04',
      model: '51',
      question: 'Scarcely ________ when the thunderstorm erupted over the outdoor stadium.',
      optionA: 'the match had begun',
      optionB: 'had the match begun',
      optionC: 'did the match begin',
      optionD: 'the match began',
      correctAnswer: 'B',
      section: 'grammar',
      passage: '',
      explanation: 'قاعدة القلب والتقديم Inversion بعد Scarcely: Scarcely had + Subject + V3.',
      image: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows);

  // Set friendly column widths
  worksheet['!cols'] = [
    { wch: 18 }, // questionId
    { wch: 8 },  // model
    { wch: 55 }, // question
    { wch: 25 }, // optionA
    { wch: 25 }, // optionB
    { wch: 25 }, // optionC
    { wch: 25 }, // optionD
    { wch: 14 }, // correctAnswer
    { wch: 14 }, // section
    { wch: 45 }, // passage
    { wch: 45 }, // explanation
    { wch: 25 }, // image
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'STEP_Questions_Template');

  XLSX.writeFile(workbook, 'قالب_استيراد_أسئلة_STEP_المعتمد.xlsx');
}
