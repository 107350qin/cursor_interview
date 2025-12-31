import api from './api'

export const categoryService = {
  getAllCategories: () => {
    return api.get('/categories')
  },
  
  getCategoryById: (id) => {
    return api.get(`/categories/${id}`)
  },
  
  createCategory: (category) => {
    return api.post('/categories', category)
  },
}

