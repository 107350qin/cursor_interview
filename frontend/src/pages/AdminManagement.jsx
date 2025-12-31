import { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Form, Input, Select, Tag, message, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined, StopOutlined, CheckCircleOutlined, KeyOutlined } from '@ant-design/icons'
import { adminService } from '../services/adminService'
import { useAuthStore } from '../store/authStore'
import { hasPermission } from '../utils/permission'

const { Option } = Select

function AdminManagement() {
  const { userId, role, permissions } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [currentRole, setCurrentRole] = useState('')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()
  
  const isSuperAdmin = role === 'SUPER_ADMIN'
  const canModifyUser = permissions?.canModifyUser || false
  const canBanUser = permissions?.canBanUser || false
  const canDeleteUser = permissions?.canDeleteUser || false
  const canResetPassword = permissions?.canResetPassword || false

  useEffect(() => {
    loadUsers(currentRole)
  }, [pagination.current, pagination.pageSize, currentRole])

  const loadUsers = async (role = 'ADMIN') => {
    setLoading(true)
    try {
      const res = await adminService.getAllUsers({
        page: pagination.current,
        size: pagination.pageSize,
        role: role || undefined, // 如果role为空，则显示所有用户
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

  const handleEdit = (user) => {
    setEditingUser(user)
    form.setFieldsValue({
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    })
    setEditModalVisible(true)
  }

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields()
        const res = await adminService.updateUser(editingUser.id, values)
        if (res.code === 200) {
          message.success('更新成功')
          setEditModalVisible(false)
          form.resetFields()
          loadUsers(currentRole)
        } else {
          message.error(res.message || '更新失败')
        }
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (userId) => {
    try {
      const res = await adminService.deleteUser(userId)
      if (res.code === 200) {
        message.success('删除成功')
        loadUsers(currentRole)
      } else {
        message.error(res.message || '删除失败')
      }
    } catch (error) {
      message.error('删除失败')
      console.error(error)
    }
  }

  const handleBanOrUnban = async (user) => {
    try {
      const newStatus = user.status === 1 ? 0 : 1
      const res = await adminService.banOrUnbanUser(user.id, newStatus)
      if (res.code === 200) {
        message.success(newStatus === 1 ? '已封禁' : '已解禁')
        loadUsers(currentRole)
      } else {
        message.error(res.message || '操作失败')
      }
    } catch (error) {
      message.error('操作失败')
      console.error(error)
    }
  }

  const handleResetPassword = (user) => {
    setEditingUser(user)
    passwordForm.resetFields()
    setPasswordModalVisible(true)
  }

  const handlePasswordReset = async () => {
    try {
      const values = await passwordForm.validateFields()
      const res = await adminService.resetUserPassword(editingUser.id, values.newPassword)
      if (res.code === 200) {
        message.success('密码重置成功')
        setPasswordModalVisible(false)
        passwordForm.resetFields()
      } else {
        message.error(res.message || '密码重置失败')
      }
    } catch (error) {
      console.error(error)
    }
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
      render: (role) => {
        const colorMap = {
          USER: 'default',
          ADMIN: 'blue',
          SUPER_ADMIN: 'red',
        }
        return <Tag color={colorMap[role]}>{role}</Tag>
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
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
        const isAdminOrSuperAdmin = record.role === 'ADMIN' || record.role === 'SUPER_ADMIN'
        
        // 使用按钮权限控制显示（支持新旧格式）
        const canEditThisUser = (hasPermission('system:user:edit:button') || hasPermission('button.user.edit')) && canModifyUser && (!isCurrentUser || isSuperAdmin) && (isSuperAdmin || !isAdminOrSuperAdmin)
        const canBanThisUser = (hasPermission('system:user:ban:button') || hasPermission('button.user.ban')) && canBanUser && (!isCurrentUser || !isSuperAdmin) && (isSuperAdmin || (record.role === 'USER'))
        const canDeleteThisUser = (hasPermission('system:user:delete:button') || hasPermission('button.user.delete')) && canDeleteUser && !isCurrentUser && isSuperAdmin
        const canResetPasswordThisUser = (hasPermission('system:user:resetPassword:button') || hasPermission('button.user.resetPassword')) && canResetPassword && isSuperAdmin
        
        return (
          <Space size="small">
            {canEditThisUser && (
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                编辑
              </Button>
            )}
            {canResetPasswordThisUser && (
              <Button
                type="link"
                icon={<KeyOutlined />}
                onClick={() => handleResetPassword(record)}
              >
                重置密码
              </Button>
            )}
            {canBanThisUser && (
              <Button
                type="link"
                danger={record.status === 0}
                icon={record.status === 1 ? <CheckCircleOutlined /> : <StopOutlined />}
                onClick={() => handleBanOrUnban(record)}
              >
                {record.status === 1 ? '解禁' : '封禁'}
              </Button>
            )}
            {canDeleteThisUser && (
              <Popconfirm
                title="确定要删除这个用户吗？"
                onConfirm={() => handleDelete(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                >
                  删除
                </Button>
              </Popconfirm>
            )}
          </Space>
        )
      },
    },
  ]

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {isSuperAdmin && (
        <div style={{ marginBottom: '16px' }}>
          <Space>
            <Button 
              type={currentRole === 'USER' ? 'primary' : 'default'}
              onClick={() => {
                setCurrentRole('USER')
                setPagination(prev => ({ ...prev, current: 1 }))
              }}
            >
              显示普通用户
            </Button>
            <Button 
              type={currentRole === 'ADMIN' ? 'primary' : 'default'}
              onClick={() => {
                setCurrentRole('ADMIN')
                setPagination(prev => ({ ...prev, current: 1 }))
              }}
            >
              显示管理员
            </Button>
            <Button 
              type={currentRole === 'SUPER_ADMIN' ? 'primary' : 'default'}
              onClick={() => {
                setCurrentRole('SUPER_ADMIN')
                setPagination(prev => ({ ...prev, current: 1 }))
              }}
            >
              显示超级管理员
            </Button>
            <Button 
              type={currentRole === '' ? 'primary' : 'default'}
              onClick={() => {
                setCurrentRole('')
                setPagination(prev => ({ ...prev, current: 1 }))
              }}
            >
              显示所有用户
            </Button>
          </Space>
        </div>
      )}

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

      {/* 编辑用户模态框 */}
      <Modal
        title="编辑用户"
        open={editModalVisible}
        onOk={handleUpdate}
        onCancel={() => {
          setEditModalVisible(false)
          form.resetFields()
        }}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="手机号"
            name="phone"
          >
            <Input />
          </Form.Item>
          {isSuperAdmin && editingUser?.id !== userId && (
            <>
              <Form.Item
                label="角色"
                name="role"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select>
                  <Option value="USER">普通用户</Option>
                  <Option value="ADMIN">管理员</Option>
                  <Option value="SUPER_ADMIN">超级管理员</Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="状态"
                name="status"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select>
                  <Option value={0}>正常</Option>
                  <Option value={1}>封禁</Option>
                </Select>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      {/* 重置密码模态框 */}
      <Modal
        title="重置密码"
        open={passwordModalVisible}
        onOk={handlePasswordReset}
        onCancel={() => {
          setPasswordModalVisible(false)
          passwordForm.resetFields()
        }}
        okText="确定"
        cancelText="取消"
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少6位' },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AdminManagement

