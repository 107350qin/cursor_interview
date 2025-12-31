import { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Descriptions, Tag, message, Popconfirm, Input } from 'antd'
import { EyeOutlined, UserOutlined, UserDeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { adminService } from '../../services/adminService'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'

const { Search } = Input

function UserList() {
  const { userId, role } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [keyword, setKeyword] = useState('')
  const [currentRole, setCurrentRole] = useState('')
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  
  const isSuperAdmin = role === 'SUPER_ADMIN'

  useEffect(() => {
    loadUsers(currentRole)
  }, [pagination.current, pagination.pageSize, currentRole])

  const loadUsers = async (roleFilter = '') => {
    setLoading(true)
    try {
      const res = await adminService.getAllUsers({
        page: pagination.current,
        size: pagination.pageSize,
        role: roleFilter || undefined,
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
    loadUsers(currentRole)
  }

  const handleViewDetail = (user) => {
    setSelectedUser(user)
    setDetailModalVisible(true)
  }

  const handlePromoteToAdmin = async (user) => {
    try {
      const res = await adminService.updateUser(user.id, { role: 'ADMIN' })
      if (res.code === 200) {
        message.success('已提升为管理员')
        loadUsers(currentRole)
      } else {
        message.error(res.message || '操作失败')
      }
    } catch (error) {
      message.error('操作失败')
      console.error(error)
    }
  }

  const handleRemoveAdmin = async (user) => {
    try {
      const res = await adminService.updateUser(user.id, { role: 'USER' })
      if (res.code === 200) {
        message.success('已取消管理员权限')
        loadUsers(currentRole)
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
      'SUPER_ADMIN': { color: 'red', text: '超级管理员' },
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
        <Tag color={status === 1 ? 'red' : 'green'}>
          {status === 1 ? '已封禁' : '正常'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (text) => text ? new Date(text).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 300,
      render: (_, record) => {
        const isCurrentUser = record.id === userId
        const isAdmin = record.role === 'ADMIN'
        const isUser = record.role === 'USER'
        const isSuperAdminUser = record.role === 'SUPER_ADMIN'
        
        return (
          <Space size="small">
            {isSuperAdmin && (
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record)}
              >
                查看详情
              </Button>
            )}
            {isSuperAdmin && !isCurrentUser && !isSuperAdminUser && isUser && (
              <Popconfirm
                title="确定要提升该用户为管理员吗？"
                onConfirm={() => handlePromoteToAdmin(record)}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="link"
                  icon={<UserOutlined />}
                >
                  提升为管理员
                </Button>
              </Popconfirm>
            )}
            {isSuperAdmin && !isCurrentUser && !isSuperAdminUser && isAdmin && (
              <Popconfirm
                title="确定要取消该用户的管理员权限吗？"
                onConfirm={() => handleRemoveAdmin(record)}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="link"
                  danger
                  icon={<UserDeleteOutlined />}
                >
                  取消管理员权限
                </Button>
              </Popconfirm>
            )}
          </Space>
        )
      },
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Search
            placeholder="搜索用户名或邮箱"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 300 }}
            allowClear
            enterButton={<SearchOutlined />}
          />
          {isSuperAdmin && (
            <>
              <Button 
                type={currentRole === 'USER' ? 'primary' : 'default'}
                onClick={() => {
                  setCurrentRole('USER')
                  setPagination(prev => ({ ...prev, current: 1 }))
                }}
              >
                普通用户
              </Button>
              <Button 
                type={currentRole === 'ADMIN' ? 'primary' : 'default'}
                onClick={() => {
                  setCurrentRole('ADMIN')
                  setPagination(prev => ({ ...prev, current: 1 }))
                }}
              >
                管理员
              </Button>
              <Button 
                type={currentRole === 'SUPER_ADMIN' ? 'primary' : 'default'}
                onClick={() => {
                  setCurrentRole('SUPER_ADMIN')
                  setPagination(prev => ({ ...prev, current: 1 }))
                }}
              >
                超级管理员
              </Button>
              <Button 
                type={currentRole === '' ? 'primary' : 'default'}
                onClick={() => {
                  setCurrentRole('')
                  setPagination(prev => ({ ...prev, current: 1 }))
                }}
              >
                全部
              </Button>
            </>
          )}
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

      {/* 用户详情模态框 */}
      <Modal
        title="用户详情"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false)
          setSelectedUser(null)
        }}
        footer={[
          <Button key="close" onClick={() => {
            setDetailModalVisible(false)
            setSelectedUser(null)
          }}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {selectedUser && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="用户ID">{selectedUser.id}</Descriptions.Item>
            <Descriptions.Item label="用户名">{selectedUser.username}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{selectedUser.email}</Descriptions.Item>
            <Descriptions.Item label="手机号">{selectedUser.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="角色">
              {getRoleTag(selectedUser.role)}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={selectedUser.status === 1 ? 'red' : 'green'}>
                {selectedUser.status === 1 ? '已封禁' : '正常'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {selectedUser.createTime ? new Date(selectedUser.createTime).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {selectedUser.updateTime ? new Date(selectedUser.updateTime).toLocaleString() : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default UserList
