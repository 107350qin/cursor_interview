import { useState, useEffect } from 'react'
import { Card, Form, Select, InputNumber, Button, List, Typography, Input, Tag, Space, message, Modal } from 'antd'
import { useNavigate } from 'react-router-dom'
import { categoryService } from '../services/categoryService'
import { questionService } from '../services/questionService'

const { TextArea } = Input

const { Title, Paragraph } = Typography
const { Option } = Select

function MockInterview() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [categories, setCategories] = useState([])
  const [questions, setQuestions] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [expandedQuestions, setExpandedQuestions] = useState(new Set())

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
      const categoryNames = values.categoryNames ? values.categoryNames.join(',') : null
      const res = await questionService.getMockInterviewQuestions({
        categoryNames,
        difficulty: values.difficulty,
        questionCount: values.questionCount,
      })
      if (res.code === 200) {
        setQuestions(res.data)
        setExpandedQuestions(new Set()) // 重置展开状态
        setModalVisible(true) // 打开Modal
      } else {
        message.error(res.message || '获取题目失败')
      }
    } catch (error) {
      message.error('获取模拟面试题目失败')
    }
  }

  const toggleQuestionExpand = (questionId) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId)
    } else {
      newExpanded.add(questionId)
    }
    setExpandedQuestions(newExpanded)
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
            name="categoryNames"
            label="选择分类（可多选）"
          >
            <Select mode="multiple" placeholder="请选择分类">
              {categories.map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="difficulty"
            label="难度"
            initialValue=""
          >
            <Select>
              <Option value="">全部</Option>
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
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              开始模拟面试
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title="模拟面试题目"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <List
          dataSource={questions}
          renderItem={(question, index) => (
            <Card
              key={question.id}
              title={`问题 ${index + 1}`}
              style={{ marginBottom: 16, cursor: 'pointer' }}
              onClick={() => toggleQuestionExpand(question.id)}
            >
              <Space>
                <Tag color="blue">{question.categoryName}</Tag>
                <Space>
                  {question.tags && question.tags.split(',').map((tag, idx) => (
                    <Tag key={idx} color="cyan">{tag.trim()}</Tag>
                  ))}
                </Space>
                <Tag color={
                  question.difficulty === 'EASY' ? 'green' :
                    question.difficulty === 'MEDIUM' ? 'orange' : 'red'
                }>
                  {question.difficulty === 'EASY' ? '简单' :
                    question.difficulty === 'MEDIUM' ? '中等' : '困难'}
                </Tag>
              </Space>
              <Paragraph strong style={{ marginTop: 16 }}>题目：</Paragraph>
              <Paragraph>{question.title}</Paragraph>



              {expandedQuestions.has(question.id) && (
                <div style={{ marginTop: 16, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                  <Paragraph strong>答案：</Paragraph>
                  <Paragraph>{question.analysis}</Paragraph>
                </div>
              )}
            </Card>
          )}
        />
      </Modal>
    </div>
  )
}

export default MockInterview

