import api from './api'

export const questionService = {
  getQuestions: (params) => {
    return api.get('/com/get-questions', { params })
  },
  
  getQuestionById: (id) => {
    return api.get(`/com/get-question/${id}`)
  },
  
  createQuestion: (data) => {
    return api.post('/questions', data)
  },
  
  updateQuestion: (id, data) => {
    return api.put(`/questions/${id}`, data)
  },
  
  deleteQuestion: (id) => {
    return api.delete(`/questions/${id}`)
  },
  getMockInterviewQuestions: (params) => {
    return api.get('/com/mock-interviews', { params })
  },
}

