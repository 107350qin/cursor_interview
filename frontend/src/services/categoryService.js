import api from './api'

export const categoryService = {
  getAllCategories: () => {
    return api.get('/com/get-categories')
  },
  getCategoryStatistic: () => {
    return api.get('/com/get-category-statistic')
  }
}

