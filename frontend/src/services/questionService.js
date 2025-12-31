import api from './api'

export const questionService = {
  getQuestions: (params) => {
    return api.get('/questions', { params })
  },
  
  getQuestionById: (id) => {
    return api.get(`/questions/${id}`)
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
}

