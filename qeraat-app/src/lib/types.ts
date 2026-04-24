export interface QuranSora {
  sora: number;      // PK
  sora_name: string;
}

export interface BookQuran {
  aya_index: number; // PK
  sora: number;      // FK -> QuranSora.sora
  aya: number;
  text: string;
}

export interface Qareemaster {
  qkey: string;       // PK, e.g., 'Q1'
  name: string;
}

export interface Tagsmaster {
  tag: string;        // PK
  description: string;
}

export interface ShawahidEntry {
  id: number;         // PK
  aya_indices: string; // Comma separated list of aya_indices
  text: string;
}

export interface QuranData {
  aya_index: number;
  id: number;
  sora: number;
  aya: number;
  sub_sno?: number;
  sub_subject?: string;
  sub_subject1?: string;
  reading?: string;
  readingresult?: string;
  resultnew?: string;
  count_words?: number;
  qarees?: string;
  qareesrest?: string;
  
  // Qira'at boolean flags (stored as text '1' or NULL in DB, maybe? Or integer 1/0)
  // Documentation says: "Q1-Q10 (TEXT) ... NULL or 1"
  Q1?: string; Q2?: string; Q3?: string; Q4?: string; Q5?: string;
  Q6?: string; Q7?: string; Q8?: string; Q9?: string; Q10?: string;

  // R1_1 to R10_2
  R1_1?: string; R1_2?: string;
  R2_1?: string; R2_2?: string;
  R3_1?: string; R3_2?: string;
  R4_1?: string; R4_2?: string;
  R5_1?: string; R5_2?: string;
  R6_1?: string; R6_2?: string;
  R7_1?: string; R7_2?: string;
  R8_1?: string; R8_2?: string;
  R9_1?: string; R9_2?: string;
  R10_1?: string; R10_2?: string;

  tags?: string;        // Comma separated tags
  shawahid?: string;
  
  page_number1?: number;
  page_number2?: number;
  page_shmrly?: number;
  
  x?: number; y?: number; width?: number;
  x2?: number; y2?: number; width2?: number;

  wordsno?: number;
  wordindex?: number;
  root?: string;
  rasaya?: number; // 0 or 1
  Done?: number;
}
