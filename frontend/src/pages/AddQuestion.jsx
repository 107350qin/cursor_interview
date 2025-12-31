import { Form, Input, Select, Button, Card, message, Tag, AutoComplete, Row, Col } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { questionService } from '../services/questionService'
import { categoryService } from '../services/categoryService'
import { PlusOutlined, CloseOutlined } from '@ant-design/icons'

const { TextArea } = Input
const { Option } = Select

function AddQuestion() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [categoryInputValue, setCategoryInputValue] = useState('')

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

  // 处理分类选择（从下拉列表选择已有分类）
  const handleCategorySelect = (value) => {
    const category = categories.find(cat => cat.name === value)
    if (category) {
      setCategoryInputValue(category.name)
      form.setFieldValue('categoryId', category.id)
    }
  }

  // 处理分类输入变化
  const handleCategoryChange = (value) => {
    setCategoryInputValue(value)
    
    // 如果输入框被清空，也清空表单值
    if (!value) {
      form.setFieldValue('categoryId', undefined)
      return
    }

    // 检查输入的内容是否完全匹配已有分类
    const exactMatch = categories.find(cat => cat.name === value)
    if (exactMatch) {
      // 如果完全匹配，立即设置分类ID
      form.setFieldValue('categoryId', exactMatch.id)
    } else {
      // 如果不匹配，先清空分类ID，等待用户确认（失去焦点时创建）
      form.setFieldValue('categoryId', undefined)
    }
  }

  // 处理分类输入失去焦点（仅确认选择，不创建新分类）
  const handleCategoryBlur = () => {
    const value = categoryInputValue?.trim()
    if (!value) {
      form.setFieldValue('categoryId', undefined)
      return
    }

    // 检查是否是已有的分类
    const existingCategory = categories.find(cat => cat.name === value)
    
    if (existingCategory) {
      // 如果找到已有分类，直接设置ID
      form.setFieldValue('categoryId', existingCategory.id)
    }
    // 如果是新分类，不在这里创建，等到提交问题时再创建
  }

  const onFinish = async (values) => {
    try {
      setLoading(true)
      
      // 准备问题数据
      const questionData = {
        ...values
      }
      
      // 处理分类：如果有 categoryId 则使用，否则传递 categoryName（新分类）
      if (values.categoryId) {
        // 如果已有 categoryId，直接使用
        questionData.categoryId = values.categoryId
      } else if (categoryInputValue?.trim()) {
        // 如果没有 categoryId 但输入了分类名称，传递 categoryName，后端会处理
        const categoryName = categoryInputValue.trim()
        const existingCategory = categories.find(cat => cat.name === categoryName)
        
        if (existingCategory) {
          // 如果找到已有分类，使用已有分类的ID
          questionData.categoryId = existingCategory.id
        } else {
          // 如果是新分类，传递分类名称，后端会创建
          questionData.categoryName = categoryName
          questionData.categoryId = null // 确保不传递 categoryId
        }
      }
      
      const res = await questionService.createQuestion(questionData)
      if (res.code === 200) {
        message.success('题目创建成功，等待审核')
        // 如果创建了新分类，刷新分类列表
        if (questionData.categoryName) {
          loadCategories()
        }
        navigate('/')
      } else {
        message.error(res.message || '创建失败')
      }
    } catch (error) {
      message.error('创建失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
      <Card title="添加题目" bodyStyle={{ padding: '20px' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          size="middle"
        >
          <Form.Item
            name="title"
            label="题目"
            rules={[{ required: true, message: '请输入题目!' }]}
            style={{ marginBottom: '16px' }}
          >
            <Input placeholder="请输入题目" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="分类"
                rules={[
                  {
                    validator: () => {
                      // 如果输入框有内容，验证通过（无论是已有分类还是新分类）
                      if (categoryInputValue?.trim()) {
                        return Promise.resolve()
                      }
                      // 如果输入框为空，验证失败
                      return Promise.reject(new Error('请选择或输入分类!'))
                    }
                  }
                ]}
                style={{ marginBottom: '16px' }}
              >
                <AutoComplete
                  value={categoryInputValue}
                  options={categories.map(cat => ({
                    value: cat.name,
                    label: cat.name
                  }))}
                  placeholder="请选择或输入分类名称"
                  allowClear
                  filterOption={(inputValue, option) =>
                    option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  }
                  onSelect={handleCategorySelect}
                  onChange={handleCategoryChange}
                  onBlur={handleCategoryBlur}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="difficulty"
                label="难度"
                rules={[{ required: true, message: '请选择难度!' }]}
                style={{ marginBottom: '16px' }}
              >
                <Select placeholder="请选择难度">
                  <Option value="EASY">简单</Option>
                  <Option value="MEDIUM">中等</Option>
                  <Option value="HARD">困难</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="标签"
            rules={[{ required: true, message: '请至少添加一个标签!' }]}
            style={{ marginBottom: '16px' }}
          >
            <div>
              {/* 已添加的标签 */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                {tags.map((tag) => (
                  <Tag 
                    key={tag} 
                    closable 
                    color="blue"
                    onClose={() => {
                      const newTags = tags.filter(t => t !== tag);
                      setTags(newTags);
                      form.setFieldValue('tags', newTags.join(','));
                    }}
                    style={{
                      borderRadius: '12px',
                      padding: '4px 12px',
                      fontSize: '14px',
                      backgroundColor: '#e6f7ff',
                      borderColor: '#91d5ff',
                      color: '#1890ff',
                    }}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
              
              {/* 标签输入框 */}
              <Input 
                value={inputValue}
                placeholder="请输入标签，按回车键添加"
                style={{
                  borderRadius: '4px',
                  borderColor: '#d9d9d9',
                }}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = inputValue.trim();
                    if (value && !tags.includes(value) && value.length <= 20 && tags.length < 5) {
                      const newTags = [...tags, value];
                      setTags(newTags);
                      form.setFieldValue('tags', newTags.join(','));
                      setInputValue('');
                    }
                  }
                }}
              />
              
              {/* 提示信息 */}
              <div style={{ marginTop: '8px', color: '#8c8c8c', fontSize: '12px' }}>
                提示：输入标签后按回车键添加，最多添加5个标签
              </div>
            </div>
          </Form.Item>

          <Form.Item
            name="analysis"
            label="解析"
            style={{ marginBottom: '16px' }}
          >
            <TextArea rows={4} placeholder="请输入题目解析（可选）" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading} block>
              提交
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default AddQuestion

