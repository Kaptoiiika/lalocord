import axios from 'axios'

import { __API_URL__ } from '../const/config'

export const apiClient = axios.create({
  baseURL: __API_URL__ || '',
  headers: {},
})
