export interface QuranSora {
  sora: number;      // PK
  sora_name: string;
  sora_name_tshkeel?: string;
  sora_type?: string;
  ayat_number?: number;
}

export interface BookQuran {
  aya_index: number; // PK
  sora: number;      // FK -> QuranSora.sora
  aya: number;
  text: string;
  text_full?: string;
  textU?: string;
}

export interface Qareemaster {
  id?: number;
  qkey: string;       // PK, e.g., 'Q1', 'R1_1', 'R1_2'
  name: string;
  groups?: string;
}

export interface Tagsmaster {
  id?: number;
  tag: string;        // PK
  description: string;
  qarees?: string;
  category?: string;
  srt?: number;
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
  
  // Qira'at boolean flags (NULL or 1)
  Q1?: string | number; Q2?: string | number; Q3?: string | number;
  Q4?: string | number; Q5?: string | number; Q6?: string | number;
  Q7?: string | number; Q8?: string | number; Q9?: string | number;
  Q10?: string | number;

  // R1_1 to R10_2
  R1_1?: string | number; R1_2?: string | number;
  R2_1?: string | number; R2_2?: string | number;
  R3_1?: string | number; R3_2?: string | number;
  R4_1?: string | number; R4_2?: string | number;
  R5_1?: string | number; R5_2?: string | number;
  R6_1?: string | number; R6_2?: string | number;
  R7_1?: string | number; R7_2?: string | number;
  R8_1?: string | number; R8_2?: string | number;
  R9_1?: string | number; R9_2?: string | number;
  R10_1?: string | number; R10_2?: string | number;

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

  // Joined fields (added at query time)
  sora_name?: string;
}

export interface SearchOptions {
  wholeWord?: boolean;
  includeTags?: string[];
  excludeTags?: string[];
  includeQarees?: string[];   // e.g. ['Q1', 'Q3']
  excludeHafsa?: boolean;     // ifnull(r5_2,0)<>1
  limit?: number;
  offset?: number;
}
