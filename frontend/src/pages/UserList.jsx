import { useState, useEffect } from 'react'
import { Table, Button, Space, Tag, message, Popconfirm, Input } from 'antd'
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { adminService } from '../services/adminService'
import { useIsMobile } from '../utils/device'

const { Search } = Input

function UserList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    loadUsers()
  }, [pagination.current, pagination.pageSize])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await adminService.getAllUsers({
        page: pagination.current,
        size: pagination.pageSize,
        keyword: keyword || undefined,
      })
      if (res.code === 200) {
        setUsers(res.data.records || [])
        setPagination(prev => ({
          ...prev,
          total: res.data.total || 0,
        }))
      }
    } catch (error) {
      message.error('加载用户列表失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    loadUsers()
  }

  const handleUserStatus = async (user) => {
    try {
      const res = await adminService.updateUser({ id: user.id, status: user.status === 'NEW' ? 'OK' : 'NEW' })
      if (res.code === 200) {
        message.success('已更新用户状态')
        loadUsers()
      } else {
        message.error(res.message || '操作失败')
      }
    } catch (error) {
      message.error('操作失败')
      console.error(error)
    }
  }

  const getRoleTag = (userRole) => {
    const roleMap = {
      'ADMIN': { color: 'orange', text: '管理员' },
      'USER': { color: 'blue', text: '普通用户' },
    }
    const roleInfo = roleMap[userRole] || { color: 'default', text: userRole }
    return <Tag color={roleInfo.color}>{roleInfo.text}</Tag>
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => text || '-',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => getRoleTag(role),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'NEW' ? 'red' : 'green'}>
          {status === 'NEW' ? '待审核' : '正常'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 300,
      render: (_, record) => {
        // 如果是是普通用户且状态为NEW，则可点击审核通过将其状态改为OK，如果是普通用户且状态为OK则可以点击取消审核将其状态改为NEW，如果是管理员则不能进行任何操作无按钮
        if (record.role === 'USER') {
          if (record.status === 'NEW') {
            return (
              <Space size="small">
                <Popconfirm
                  title="确定要审核通过该用户吗？"
                  onConfirm={() => handleUserStatus(record)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button
                    type="link"
                    success
                    icon={<CheckCircleOutlined />}
                  >
                    审核通过
                  </Button>
                </Popconfirm>
              </Space>
            )
          } else if (record.status === 'OK') {
            return (
              <Space size="small">
                <Popconfirm
                  title="确定要取消审核该用户吗？"
                  onConfirm={() => handleUserStatus(record)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button
                    type="link"
                    danger
                    icon={<CloseCircleOutlined />}
                  >
                    取消审核
                  </Button>
                </Popconfirm>
              </Space>
            )
          }
        } else if (record.role === 'ADMIN') {
          return null
        }
      },
    },
  ]

  const isMobile = useIsMobile();

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: isMobile ? '100%' : '300px' }}>
        <Space>
          <Search
            placeholder="搜索用户名或邮箱"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={handleSearch}
            // 搜索框靠右对齐
            allowClear  
            enterButton={<SearchOutlined />}
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => {
            setPagination({
              ...pagination,
              current: page,
              pageSize: pageSize,
            })
          },
        }}
      />
    </div>
  )
}

export default UserList
