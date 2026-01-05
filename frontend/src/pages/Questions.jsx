import { useEffect, useState } from 'react'
import { Table, Tag, Typography, Button, Space, Modal, Pagination, message, Form, Input, Select, AutoComplete, Row, Col, Descriptions } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { questionService } from '../services/questionService'
import { categoryService } from '../services/categoryService'
import { useAuthStore } from '../store/authStore'
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { useIsMobile } from '../utils/device'

const { TextArea } = Input

const { Column } = Table

function Questions() {
  const location = useLocation()
  const { isAuthenticated, userId, role } = useAuthStore()
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  // 筛选条件状态
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState(null)


  const [questionDetailShow, setQuestionDetailShow] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null)

  // 编辑模态框状态
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [editForm] = Form.useForm()
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [categoryInputValue, setCategoryInputValue] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  // 删除问题
  const deleteQuestion = async (id) => {
    // 确认是否要删除，使用antd的确认弹窗
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这道题目吗？',
      okText: '确定',
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await questionService.deleteQuestion(id)
          if (res.code === 200) {
            message.success('删除成功')
            loadQuestions() // 重新加载问题列表
          } else {
            message.error(res.message || '删除失败')
          }
        } catch (error) {
          console.error('删除问题失败:', error)
          message.error('删除失败')
        }
      },
      onCancel: () => {
        // 取消删除，不做任何操作
      }
    })
  }

  // 加载分类数据
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

  // 加载问题详情用于编辑
  const loadQuestionForEdit = async (id) => {
    try {
      setEditLoading(true)
      const res = await questionService.getQuestionById(id)
      if (res.code === 200) {
        const questionData = res.data

        // 设置表单值
        editForm.setFieldsValue({
          title: questionData.title,
          difficulty: questionData.difficulty,
          analysis: questionData.analysis,
          categoryName: questionData.categoryName,
          tags: questionData.tags || '',
        })

        // 设置分类输入值
        setCategoryInputValue(questionData.categoryName || '')

        // 设置标签
        if (questionData.tags) {
          const questionTags = questionData.tags.split(',')
          setTags(questionTags)
          editForm.setFieldValue('tags', questionTags.join(','))
        }
      }
    } catch (error) {
      console.error('加载题目失败:', error)
      message.error('加载题目失败')
      setIsEditModalVisible(false)
    } finally {
      setEditLoading(false)
    }
  }

  // 处理分类选择
  const handleCategorySelect = (value) => {
    const category = categories.find(cat => cat === value)
    if (category) {
      setCategoryInputValue(category.name)
      editForm.setFieldValue('categoryId', category.id)
    }
  }

  // 处理分类输入变化
  const handleCategoryChange = (value) => {
    setCategoryInputValue(value)

    // 如果输入框被清空，也清空表单值
    if (!value) {
      editForm.setFieldValue('categoryId', undefined)
      return
    }

    // 检查输入的内容是否完全匹配已有分类
    const exactMatch = categories.find(cat => cat === value)
    if (exactMatch) {
      // 如果完全匹配，立即设置分类ID
      editForm.setFieldValue('categoryId', exactMatch.id)
    } else {
      // 如果不匹配，先清空分类ID，等待用户确认
      editForm.setFieldValue('categoryId', undefined)
    }
  }

  // 处理分类输入失去焦点
  const handleCategoryBlur = () => {
    const value = categoryInputValue?.trim()
    if (!value) {
      editForm.setFieldValue('categoryId', undefined)
      return
    }

    // 检查是否是已有的分类
    const existingCategory = categories.find(cat => cat === value)

    if (existingCategory) {
      // 如果找到已有分类，直接设置ID
      editForm.setFieldValue('categoryId', existingCategory.id)
    }
  }

  // 提交编辑表单
  const handleEditSubmit = async (values) => {
    try {
      setEditLoading(true)

      // 准备问题数据
      const questionData = {
        ...values
      }

      // 处理分类
      if (values.categoryId) {
        questionData.categoryId = values.categoryId
      } else if (categoryInputValue?.trim()) {
        const categoryName = categoryInputValue.trim()
        const existingCategory = categories.find(cat => cat === categoryName)

        if (existingCategory) {
          questionData.categoryId = existingCategory.id
        } else {
          questionData.categoryName = categoryName
          questionData.categoryId = null
        }
      }

      const res = await questionService.updateQuestion(selectedQuestion.id, questionData)
      if (res.code === 200) {
        message.success('题目更新成功')
        setIsEditModalVisible(false)
        loadQuestions() // 重新加载问题列表
      } else {
        message.error(res.message || '更新失败')
      }
    } catch (error) {
      message.error('更新失败，请检查网络连接')
    } finally {
      setEditLoading(false)
    }
  }

  // 打开编辑模态框
  const showEditModal = async (record) => {
    setSelectedQuestion(record)
    await loadCategories()
    await loadQuestionForEdit(record.id)
    setIsEditModalVisible(true)
  }

  // 处理 URL 查询参数
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const categoryFromUrl = params.get('category')
    if (categoryFromUrl) {
      setSelectedCategory(decodeURIComponent(categoryFromUrl))
      setCurrentPage(1) // 重置到第一页
    }
  }, [location.search])

  useEffect(() => {
    loadQuestions()
    loadCategories()
  }, [currentPage, pageSize, sortBy, selectedCategory, selectedDifficulty])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      const res = await questionService.getQuestions({
        page: currentPage,
        size: pageSize,
        sortBy: sortBy,
        keyword: searchKeyword,
        categoryName: selectedCategory,
        difficulty: selectedDifficulty,
      })
      if (res.code === 200) {
        setQuestions(res.data.records)
        setTotal(res.data.total)
      }
    } catch (error) {
      console.error('加载题目失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty) => {
    const colors = {
      EASY: 'green',
      MEDIUM: 'orange',
      HARD: 'red',
    }
    return colors[difficulty] || 'default'
  }

  const handlePageChange = (page, size) => {
    setCurrentPage(page)
    setPageSize(size)
  }

  // 使用公共的移动设备检测Hook
  const isMobile = useIsMobile();

  return (
    <div style={{ padding: '10px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 筛选条件 */}
      <div style={{
        display: 'flex',
        gap: '16px', // 子组件之间的间距（替代栅格的 gutter，更简洁）
        flexWrap: 'wrap', // 移动端屏幕较小时自动换行，避免挤压
        alignItems: 'center', // 垂直方向居中对齐
        padding: '8px 0', // 可选：添加上下内边距，优化视觉
      }}> 
        {/* 搜索框：设置 flex: 1 或固定宽度，自适应剩余空间 */}
        <div style={{ width: isMobile ? '100%' : '300px' }}>
          <Input.Search
            placeholder="搜索题目"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={() => {
              setCurrentPage(1);
              loadQuestions();
            }}
            allowClear
            size={isMobile ? 'small' : 'middle'}
            enterButton={<SearchOutlined />}
          />
        </div>

        {/* 分类选择框：设置固定宽度或 flex 分配 */}
        <div style={{ width: isMobile ? '100%' : '180px', minWidth: '120px' }}>
          <Select
            placeholder="选择分类"
            value={selectedCategory}
            onChange={setSelectedCategory}
            allowClear
            size={isMobile ? 'small' : 'middle'}
            style={{ width: '100%' }}
          >
            {categories.map((category) => (
              <Select.Option key={category} value={category}>
                {category}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* 难度选择框：与分类选择框宽度一致 */}
        <div style={{ width: isMobile ? '100%' : '180px', minWidth: '120px' }}>
          <Select
            placeholder="选择难度"
            value={selectedDifficulty}
            onChange={setSelectedDifficulty}
            allowClear
            size={isMobile ? 'small' : 'middle'}
            style={{ width: '100%' }}
          >
            <Select.Option value="EASY">简单</Select.Option>
            <Select.Option value="MEDIUM">中等</Select.Option>
            <Select.Option value="HARD">困难</Select.Option>
          </Select>
        </div>
      </div>

      {/* 题目列表 */}
      <Table
        dataSource={questions}
        rowKey="id"
        loading={loading}
        pagination={false} // 关闭内置分页，使用外部分页组件
        scroll={{ x: true }}
        bordered={!isMobile}
        size={isMobile ? 'small' : 'middle'}
      >
        <Column
          title="题目"
          dataIndex="title"
          key="title"
          maxWidth={isMobile ? 200 : 400}
          ellipsis
          render={(text, record) => (
            <a onClick={() => {
              setSelectedQuestion(record)
              setQuestionDetailShow(true)
            }}>
              {text}
            </a>
          )}
          width={isMobile ? 150 : undefined}
        />
        <Column
          title="分类"
          dataIndex="categoryName"
          key="categoryName"
          width={isMobile ? 80 : 120}
          ellipsis
          render={(text) => (
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {text}
            </span>
          )}
        />
        <Column
          title="难度"
          dataIndex="difficulty"
          key="difficulty"
          width={isMobile ? 70 : 100}
          render={(difficulty) => (
            <Tag color={getDifficultyColor(difficulty)} style={{ margin: 0 }}>
              {difficulty === 'EASY' ? '简单' :
               difficulty === 'MEDIUM' ? '中等' :
               difficulty === 'HARD' ? '困难' :
               difficulty}
            </Tag>
          )}
        />
        {!isMobile && (
          <Column
            title="标签"
            dataIndex="tags"
            key="tags"
            width={200}
            ellipsis
            render={(tags) => (
              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <Space>
                  {tags && tags.split(',').map((tag, index) => (
                    <Tag key={index} color="blue" style={{ whiteSpace: 'nowrap', margin: 0 }}>
                      {tag.trim()}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
          />
        )}
        <Column
          title="时间"
          dataIndex="createTime"
          key="createTime"
          width={isMobile ? 120 : 180}
          ellipsis
          render={(time) => (
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: isMobile ? '12px' : '14px' }}>
              {new Date(time).toLocaleString()}
            </span>
          )}
        />

        {/* 操作列 - 仅对问题所有者或管理员显示 */}
        {isAuthenticated && (
          <Column
            title="操作"
            key="action"
            width={isMobile ? 100 : 120}
            align="center"
            render={(text, record) => {
              const isOwner = userId && userId === record.userId;
              const canOperate = isOwner || isAdmin;

              if (!canOperate) return null;

              return (
                // 只有问题所有者或管理员才能编辑或删除
                <Space size="small">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    size={isMobile ? 'small' : 'middle'}
                    onClick={() => showEditModal(record)}
                  >
                    编辑
                  </Button>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size={isMobile ? 'small' : 'middle'}
                    onClick={() => deleteQuestion(record.id)}
                  >
                    删除
                  </Button>
                </Space>
              );
            }}
          />
        )}
      </Table>

      {/* 分页组件 */}
      <div style={{ marginTop: '15px', textAlign: isMobile ? 'center' : 'right' }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={handlePageChange}
          showSizeChanger={!isMobile}
          pageSizeOptions={['10', '20', '50', '100']}
          showTotal={(total) => `共 ${total} 条记录`}
          size={isMobile ? 'small' : 'middle'}
          style={{ margin: '0 auto', display: isMobile ? 'inline-block' : 'block' }}
        />
      </div>

      <Modal
        title="问题详情"
        open={questionDetailShow}
        onCancel={() => setQuestionDetailShow(false)}
        footer={null}
        width={isMobile ? '90%' : 600}
      >
        <div>
          {selectedQuestion && (
            <Descriptions column={isMobile ? 1 : 2} bordered size="middle">
              <Descriptions.Item label="问题" span={isMobile ? 2 : 2}>
                {selectedQuestion.title}
              </Descriptions.Item>
              <Descriptions.Item label="解析" span={isMobile ? 2 : 2}>
                {selectedQuestion.analysis || '无'}
              </Descriptions.Item>
            </Descriptions>
          )}
        </div>
      </Modal>

      {/* 编辑问题弹窗 */}
      <Modal
        title="编辑问题"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={isMobile ? '90%' : 600}
      >
        <div>
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditSubmit}
            initialValues={selectedQuestion}
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
                      value: cat,
                      label: cat
                    }))}
                    placeholder="请选择或输入分类名称"
                    allowClear
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
                    <Select.Option value="EASY">简单</Select.Option>
                    <Select.Option value="MEDIUM">中等</Select.Option>
                    <Select.Option value="HARD">困难</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="tags"
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
                        editForm.setFieldValue('tags', newTags.join(','));
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
                        editForm.setFieldValue('tags', newTags.join(','));
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
              <Button type="primary" htmlType="submit" loading={editLoading} block>
                保存
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  )
}

export default Questions