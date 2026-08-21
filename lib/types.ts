export interface Student {
  id: number;
  username: string;
  full_name: string;
  student_id: string;
  department: string;
  level: number;
  gpa: number;
  total_hours: number;
}

export interface AvailableCourse {
  code: string;
  name: string;
  credit_hours: number;
  group_type: string;
  eligible: boolean;
  missing_prerequisites: string[];
}

export interface HistoryEntry {
  entry_id: number;
  course_code: string;
  course_name: string | null;
  grade: string;
  semester_taken: string;
  credit_hours: number | null;
}

export interface RecommendedCourse {
  code: string;
  name: string;
  credit_hours: number;
}

export interface LoadRule {
  min_hours: number;
  max_hours: number;
  based_on_gpa: number;
}

export interface CourseIntentResponse {
  intent: string;
  eligible_courses: AvailableCourse[];
  ineligible_courses: {
    code: string;
    name: string | null;
    missing_prerequisites: string[];
  }[];
  recommended_selection: RecommendedCourse[];
  recommended_total_hours: number;
  load_rule_applied: LoadRule;
  notes: string;
  gpa_projection?: unknown;
  prerequisite_info?: unknown;
  gpa_analysis?: unknown;
  clarify?: boolean;
  response?: string;
}

export interface FreeQuestionResponse {
  intent: "free_question";
  ai_answer?: string;
  response?: string;
  model?: string;
  provider?: string;
  grounded_context?: {
    gpa: number;
    total_hours: number;
    level: number;
    history_courses: number;
  };
}

export interface ImageQueryResponse {
  intent: string;
  response: string;
  error?: string;
}

export type ChatResponse =
  | CourseIntentResponse
  | FreeQuestionResponse
  | ImageQueryResponse;

export interface ExtractedEntry {
  course_code: string;
  course_name: string | null;
  grade: string;
  semester_taken: string | null;
  recognized: boolean;
  was_corrected: boolean;
  original_extracted_text?: string | null;
}

export interface TranscriptExtraction {
  extracted_entries: ExtractedEntry[];
  raw_model_output: string;
  model_used: string;
  preprocessing_warning?: string;
}

export interface GraduationStatus {
  graduation_ready: boolean;
  hours_requirement_met: boolean;
  gpa_requirement_met: boolean;
  hours_remaining: number;
  gpa_shortfall: number;
  progress: { total_hours: number; gpa: number; level: number };
}

export interface GraduationPlanTerm {
  term: number;
  courses: { code: string; name: string; credit_hours: number }[];
  term_total_hours: number;
}

export interface GraduationPlan {
  graduation_requirements: unknown;
  terms: GraduationPlanTerm[];
  total_terms: number;
  current_completed_hours: number;
  planned_hours: number;
  projected_total_hours: number;
  target_hours: number;
  remaining_hours_after_plan: number;
  reaches_requirement: boolean;
  termination_reason: string;
  load_rule: LoadRule;
  graduation_status: GraduationStatus;
}