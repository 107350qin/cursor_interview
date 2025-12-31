import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, message, Checkbox, Select, Divider } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'

const { Option } = Select

const ROLE_OPTIONS = [
  { label: '普通用户', value: 'USER' },
  { label: '普通管理员', value: 'ADMIN' },
  { label: '超级管理员', value: 'SUPER_ADMIN' },
]

function PermissionConfig() {
  const { role: currentRole } = useAuthStore()
  const [permissions, setPermissions] = useState([])
  const [selectedRole, setSelectedRole] = useState('ADMIN')
  const [rolePermissions, setRolePermissions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAllPermissions()
    loadRolePermissions(selectedRole)
  }, [])

  useEffect(() => {
    loadRolePermissions(selectedRole)
  }, [selectedRole])

  const loadAllPermissions = async () => {
    try {
      const res = await api.get('/super-admin/permissions')
      if (res.code === 200) {
        setPermissions(res.data || [])
      }
    } catch (error) {
      message.error('加载权限列表失败')
      console.error(error)
    }
  }

  const loadRolePermissions = async (role) => {
    setLoading(true)
    try {
      const res = await api.get(`/super-admin/permissions/role/${role}`)
      if (res.code === 200) {
        const permissionIds = (res.data || []).map(p => p.id)
        setRolePermissions(permissionIds)
      }
    } catch (error) {
      message.error('加载角色权限失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionChange = (permissionId, checked) => {
    if (checked) {
      setRolePermissions([...rolePermissions, permissionId])
    } else {
      setRolePermissions(rolePermissions.filter(id => id !== permissionId))
    }
  }

  const handleSave = async () => {
    try {
      const res = await api.put(`/super-admin/permissions/role/${selectedRole}`, {
        permissionIds: rolePermissions
      })
      if (res.code === 200) {
        message.success('权限配置保存成功')
        loadRolePermissions(selectedRole)
      } else {
        message.error(res.message || '保存失败')
      }
    } catch (error) {
      message.error('保存失败')
      console.error(error)
    }
  }

  const columns = [
    {
      title: '权限代码',
      dataIndex: 'code',
      key: 'code',
      width: 200,
    },
    {
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => (
        <Tag color={type === 'PAGE' ? 'blue' : 'green'}>
          {type === 'PAGE' ? '页面权限' : '接口权限'}
        </Tag>
      ),
    },
    {
      title: '资源路径',
      dataIndex: 'resource',
      key: 'resource',
      ellipsis: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Checkbox
          checked={rolePermissions.includes(record.id)}
          onChange={(e) => handlePermissionChange(record.id, e.target.checked)}
        >
          启用
        </Checkbox>
      ),
    },
  ]

  // 按类型分组权限（兼容新旧格式）
  const pagePermissions = permissions.filter(p => {
    if (p.permType !== undefined) return p.permType === 1
    return p.type === 'PAGE'
  })
  const apiPermissions = permissions.filter(p => {
    if (p.permType !== undefined) return p.permType === 3
    return p.type === 'API'
  })
  const buttonPermissions = permissions.filter(p => {
    if (p.permType !== undefined) return p.permType === 2
    return p.type === 'BUTTON'
  })

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Card
        title="权限配置管理"
        extra={
          <Space>
            <span>选择角色：</span>
            <Select
              value={selectedRole}
              onChange={setSelectedRole}
              style={{ width: 150 }}
            >
              {ROLE_OPTIONS.map(opt => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={loading}
            >
              保存配置
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: '24px' }}>
          <h3>页面权限</h3>
          <Table
            columns={columns}
            dataSource={pagePermissions}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </div>

        <Divider />

        <div style={{ marginBottom: '24px' }}>
          <h3>接口权限</h3>
          <Table
            columns={columns}
            dataSource={apiPermissions}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </div>

        <Divider />

        <div>
          <h3>按钮权限</h3>
          <Table
            columns={columns}
            dataSource={buttonPermissions}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </div>
      </Card>
    </div>
  )
}

export default PermissionConfig

