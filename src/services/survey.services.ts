import api from "./api";
import type { SurveyPayload,SurveyQuestionPayload, SurveySubmitPayload } from "@/types/survey";

export const createSurvey = (payload: SurveyPayload, token: string) => {
  return api.post('/survey/admin/create', payload, {
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
} 

export const allSurvey = (token: string) => {
  return api.get('/survey', {
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
}

export const createQuestion = (id: string, payload: SurveyQuestionPayload, token: string) => {
  return api.post(`/survey/admin/${id}/question`, payload, {
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
}

export const getQuestions = (id:string, token:string) => {
  return api.get(`/survey/${id}/questions`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
}

export const deleteQuestion = (id: string, questionId: number, token: string) => {
  return api.delete(`/survey/admin/${id}/question/${questionId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
}

export const getCurrentSurvey = (token: string) => {
  return api.get('/survey/current', {
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
}

export const updateSurvey = (payload: SurveyPayload, token: string) => {
  const id = payload.survey_id;
  return api.put(`/survey/admin/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
}

export const deleteSurvey = (surveyId: string, token: string) => {
  return api.delete(`/survey/admin/${surveyId}` , {
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
}

export const submitSurvey = (payload: SurveySubmitPayload, surveyId: string, token: string) => {
  return api.post(`/survey/${surveyId}/submit`, {payload},{
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
}

export const checkMemberSurvey = (token: string, id: string) => {
  return api.get(`/survey/check/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
}

export const surveyResult = (id: string, token: string) => {
  return api.get(`/survey/admin/${id}/result`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
}

export const surveyUsers = (token: string) => {
  return api.get(`/survey/admin/survey-users`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
}

export const addSurveyUser = (memberNo: string, token: string) => {
  return api.post(`/survey/admin/survey-user/new`, {memberNo}, {
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
}

export const removeSurveyUser = (memberNo: string, token: string) => {
  return api.delete(`/survey/admin/survey-user/remove?memberNo=${memberNo}`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
}