import { useState, useEffect } from 'react'
import { Table, Card, Button, Space, Modal, Descriptions, Tag, message, Input, Select } from 'antd'
import { CheckOutlined, CloseOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'

const { Search } = Input
const { Option } = Select

function QuestionReview() {
  const { role } = useAuthStore()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState(0)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [selectedRows, setSelectedRows] = useState([])

  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'

  useEffect(() => {
    if (isAdmin) {
      loadAllQuestions()
    }
  }, [pagination.current, pagination.pageSize, statusFilter])

  const loadAllQuestions = async () => {
    setLoading(true)
    try {
      const res = await api.get('/questions', {
        params: {
          page: pagination.current,
          size: pagination.pageSize,
          keyword: keyword || undefined,
          status: statusFilter !== null ? statusFilter : undefined,
          forReview: true,
        }
      })
      if (res.code === 200) {
        setQuestions(res.data.records || [])
        setPagination(prev => ({
          ...prev,
          total: res.data.total || 0,
        }))
      }
    } catch (error) {
      message.error('加载题目列表失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    loadAllQuestions()
  }

  const handleStatusChange = (value) => {
    setStatusFilter(value)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleViewDetail = (question) => {
    setSelectedQuestion(question)
    setDetailModalVisible(true)
  }

  // 通用的审核方法，支持单个ID或ID数组
  const reviewQuestion = async (questionIdOrIds, status, showMessage = true) => {
    try {
      // 统一转换为数组格式
      const questionIds = Array.isArray(questionIdOrIds) ? questionIdOrIds : [questionIdOrIds]

      const res = await api.put(`/admin/questions/review`, {
        questionIds,
        status
      })

      if (res.code === 200) {
        if (showMessage) {
          const messageText = status === 1 ? '题目审核通过' : '题目审核拒绝'
          const countText = questionIds.length > 1 ? ` (${questionIds.length}题)` : ''
          message.success(messageText + countText)
        }
        return true
      } else {
        if (showMessage) {
          message.error(res.message || '审核失败')
        }
        return false
      }
    } catch (error) {
      if (showMessage) {
        message.error('审核失败')
      }
      console.error(error)
      return false
    }
  }

  const handleApprove = async (question) => {
    const success = await reviewQuestion(question.id, 1)
    if (success) {
      loadAllQuestions()
    }
  }

  const handleReject = async (question) => {
    const success = await reviewQuestion(question.id, 2)
    if (success) {
      loadAllQuestions()
    }
  }

  // 批量通过
  const handleBatchApprove = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要审核的题目')
      return
    }

    try {
      setLoading(true)
      const success = await reviewQuestion(selectedRowKeys, 1)
      if (success) {
        loadAllQuestions()
        setSelectedRowKeys([]) // 清空选择
        setSelectedRows([])
      }
    } catch (error) {
      message.error('批量审核失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // 批量拒绝
  const handleBatchReject = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要审核的题目')
      return
    }

    try {
      setLoading(true)
      const success = await reviewQuestion(selectedRowKeys, 2)
      if (success) {
        loadAllQuestions()
        setSelectedRowKeys([]) // 清空选择
        setSelectedRows([])
      }
    } catch (error) {
      message.error('批量审核失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusTag = (status) => {
    const statusMap = {
      0: { color: 'gold', text: '待审核' },
      1: { color: 'green', text: '已通过' },
      2: { color: 'red', text: '已拒绝' },
    }
    const statusInfo = statusMap[status] || { color: 'default', text: status }
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
  }

  const getDifficultyTag = (difficulty) => {
    const difficultyMap = {
      'EASY': { color: 'green', text: '简单' },
      'MEDIUM': { color: 'orange', text: '中等' },
      'HARD': { color: 'red', text: '困难' },
    }
    const diffInfo = difficultyMap[difficulty] || { color: 'default', text: difficulty }
    return <Tag color={diffInfo.color}>{diffInfo.text}</Tag>
  }

  // 表格多选配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys, newSelectedRows) => {
      setSelectedRowKeys(newSelectedRowKeys)
      setSelectedRows(newSelectedRows)
    },
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '题目标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 100,
      render: (difficulty) => getDifficultyTag(difficulty),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) => {
        if (!tags) return '-'
        const tagList = tags.split(',').filter(t => t.trim())
        return (
          <Space size="small" wrap>
            {tagList.map((tag, index) => (
              <Tag key={index} color="blue">{tag.trim()}</Tag>
            ))}
          </Space>
        )
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (text) => text ? new Date(text).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 300,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" style={{ flexWrap: 'nowrap' }}>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          {record.status === 0 ? (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                style={{ color: '#52c41a', padding: '0 4px' }}
                onClick={async () => {
                  await handleApprove(record.id)
                }}
              >
                点击通过
              </Button>
              <Button
                type="link"
                danger
                icon={<CloseOutlined />}
                style={{ padding: '0 4px' }}
                onClick={async () => {
                  await handleReject(record.id)
                }}
              >
                点击拒绝
              </Button>
            </>
          ) : record.status === 1 ? (
            <Button
              type="link"
              danger
              icon={<CloseOutlined />}
              style={{ padding: '0 4px' }}
              onClick={async () => {
                await handleReject(record.id)
              }}
            >
              点击拒绝
            </Button>
          ) : (
            <Button
              type="link"
              icon={<CheckOutlined />}
              style={{ color: '#52c41a', padding: '0 4px' }}
              onClick={async () => {
                await handleApprove(record.id)
              }}
            >
              点击通过
            </Button>
          )}
        </Space>
      ),
    },
  ]

  if (!isAdmin) {
    return <div>您没有权限访问此页面</div>
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <Card title="题目审核" style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Search
            placeholder="搜索题目标题或标签"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 300 }}
            allowClear
            enterButton={<SearchOutlined />}
          />
          <Select
            placeholder="筛选状态"
            style={{ width: 150 }}
            allowClear
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <Option value={0}>待审核</Option>
            <Option value={1}>已通过</Option>
            <Option value={2}>已拒绝</Option>
          </Select>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <Button
              type="primary"
              onClick={handleBatchApprove}
              disabled={selectedRowKeys.length === 0}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              批量通过({selectedRowKeys.length})
            </Button>
            <Button
              danger
              onClick={handleBatchReject}
              disabled={selectedRowKeys.length === 0}
            >
              批量拒绝({selectedRowKeys.length})
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={questions}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条数据`,
            onChange: (page, pageSize) => {
              setPagination({
                ...pagination,
                current: page,
                pageSize: pageSize,
              })
            },
          }}
          rowSelection={rowSelection}
        />
      </Card>

      {/* 题目详情模态框 */}
      <Modal
        title="题目详情"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false)
          setSelectedQuestion(null)
        }}
        footer={[
          <Button key="close" onClick={() => {
            setDetailModalVisible(false)
            setSelectedQuestion(null)
          }}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedQuestion && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="题目ID">{selectedQuestion.id}</Descriptions.Item>
            <Descriptions.Item label="状态">{getStatusTag(selectedQuestion.status)}</Descriptions.Item>
            <Descriptions.Item label="题目标题">{selectedQuestion.title}</Descriptions.Item>
            <Descriptions.Item label="难度">
              {getDifficultyTag(selectedQuestion.difficulty)}
            </Descriptions.Item>
            <Descriptions.Item label="标签">
              {selectedQuestion.tags ? (
                <Space size="small" wrap>
                  {selectedQuestion.tags.split(',').filter(t => t.trim()).map((tag, index) => (
                    <Tag key={index} color="blue">{tag.trim()}</Tag>
                  ))}
                </Space>
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="题目内容">{selectedQuestion.content || '-'}</Descriptions.Item>
            <Descriptions.Item label="解析">
              {selectedQuestion.analysis || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {selectedQuestion.createTime ? new Date(selectedQuestion.createTime).toLocaleString() : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default QuestionReview

