export interface SurveyPayload {
  survey_id: string;
  survey_name: string;
  survey_from: string;
  survey_to: string;
  survey_status: "1" | "0";
 }

export interface SurveyQuestionPayload {
  survey_id: string;
  survey_qid: number;
  survey_seq: number;
  survey_question: string;
  survey_context: string;
}

export type AnswerValue = string | number | string[] | null;


export interface SurveySubmitPayload {
  answers: {
    survey_qid: string;
    answer: AnswerValue; // or string if your API only accepts string
  }[];
}