import { useState, useEffect } from 'react'
import { Card, Form, Select, InputNumber, Button, List, Typography, Input, Tag, Space, message, Modal } from 'antd'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { categoryService } from '../services/categoryService'

const { TextArea } = Input

const { Title, Paragraph } = Typography
const { Option } = Select

function MockInterview() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [categories, setCategories] = useState([])
  const [mockInterview, setMockInterview] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const res = await categoryService.getAllCategories()
      if (res.code === 200) {
        setCategories(res.data)
      }
    } catch (error) {
      console.error('加载分类失败:', error)
    }
  }

  const handleStart = async (values) => {
    try {
      const categoryIds = values.categoryIds ? values.categoryIds.join(',') : null
      const res = await api.post('/mock-interviews', null, {
        params: {
          categoryIds,
          difficulty: values.difficulty,
          questionCount: values.questionCount,
        }
      })
      if (res.code === 200) {
        setMockInterview(res.data)
        loadQuestions(res.data.id)
      } else {
        message.error(res.message || '创建失败')
      }
    } catch (error) {
      message.error('创建模拟面试失败')
    }
  }

  const loadQuestions = async (mockInterviewId) => {
    try {
      const res = await api.get(`/mock-interviews/${mockInterviewId}/questions`)
      if (res.code === 200) {
        setQuestions(res.data)
      }
    } catch (error) {
      message.error('加载题目失败')
    }
  }

  const handleSubmit = async () => {
    if (!mockInterview) return

    try {
      setSubmitting(true)
      const answerList = questions.map((q, index) => ({
        id: index + 1, // 这里应该使用实际的MockInterviewQuestion ID
        userAnswer: answers[q.id] || '',
        answerTime: 0, // 实际应该记录答题时间
      }))

      const res = await api.post(`/mock-interviews/${mockInterview.id}/submit`, answerList)
      if (res.code === 200) {
        Modal.success({
          title: '提交成功',
          content: `您的得分: ${res.data.score} 分`,
          onOk: () => {
            setMockInterview(null)
            setQuestions([])
            setAnswers({})
            form.resetFields()
          }
        })
      }
    } catch (error) {
      message.error('提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (mockInterview && questions.length > 0) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <Card
          title="模拟面试"
          extra={
            <Button type="primary" onClick={handleSubmit} loading={submitting}>
              提交答案
            </Button>
          }
        >
          <List
            dataSource={questions}
            renderItem={(item, index) => (
              <List.Item>
                <Card style={{ width: '100%' }}>
                  <Title level={4}>题目 {index + 1}</Title>
                  <Paragraph>{item.content}</Paragraph>
                  <TextArea
                    rows={4}
                    placeholder="请输入您的答案"
                    value={answers[item.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [item.id]: e.target.value })}
                  />
                </Card>
              </List.Item>
            )}
          />
        </Card>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Card title="创建模拟面试">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleStart}
        >
          <Form.Item
            name="categoryIds"
            label="选择分类（可多选）"
          >
            <Select mode="multiple" placeholder="请选择分类">
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="difficulty"
            label="难度"
            initialValue="ALL"
          >
            <Select>
              <Option value="ALL">全部</Option>
              <Option value="EASY">简单</Option>
              <Option value="MEDIUM">中等</Option>
              <Option value="HARD">困难</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="questionCount"
            label="题目数量"
            rules={[{ required: true, message: '请输入题目数量!' }]}
            initialValue={10}
          >
            <InputNumber min={1} max={50} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              开始模拟面试
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default MockInterview

