import { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Form, Input, Select, message, Popconfirm, Tag, Tree, Checkbox } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons'
import api from '../../services/api'

const { Option } = Select

function RoleConfig() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [permissionModalVisible, setPermissionModalVisible] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [permissions, setPermissions] = useState([])
  const [checkedKeys, setCheckedKeys] = useState([])
  const [expandedKeys, setExpandedKeys] = useState([])
  const [form] = Form.useForm()

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    setLoading(true)
    try {
      const res = await api.get('/super-admin/roles')
      if (res.code === 200) {
        setRoles(res.data || [])
      }
    } catch (error) {
      message.error('加载角色列表失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  
  // 加载权限列表
  const loadPermissions = async () => {
    try {
      const res = await api.get('/super-admin/permissions')
      if (res.code === 200) {
        const perms = res.data || []
        setPermissions(perms)
      }
    } catch (error) {
      message.error('加载权限列表失败')
      console.error(error)
    }
  }
  
  // 将权限转换为树形结构
  const convertToTreeData = (permissions) => {
    const menuPerms = permissions.filter(p => p.permType === 1)
    const buttonPerms = permissions.filter(p => p.permType === 2)
    const apiPerms = permissions.filter(p => p.permType === 3)
    
    const map = new Map()
    const tree = []
    
    // 先创建所有菜单节点
    menuPerms.forEach(perm => {
      map.set(perm.id, {
        title: perm.permName,
        key: perm.id.toString(),
        value: perm.id,
        children: [],
        ...perm
      })
    })
    
    // 构建菜单树形结构
    map.forEach(node => {
      if (node.parentId === 0 || !map.has(node.parentId)) {
        tree.push(node)
      } else {
        const parent = map.get(node.parentId)
        if (parent.children) {
          parent.children.push(node)
        } else {
          parent.children = [node]
        }
      }
    })
    
    // 添加按钮权限作为菜单的子节点
    buttonPerms.forEach(perm => {
      // 尝试找到对应的父菜单
      const parentId = perm.parentId
      if (map.has(parentId)) {
        const parent = map.get(parentId)
        if (parent.children) {
          parent.children.push({
            title: perm.permName,
            key: perm.id.toString(),
            value: perm.id,
            children: [],
            ...perm
          })
        }
      }
    })
    
    // 添加接口权限作为菜单的子节点
    apiPerms.forEach(perm => {
      // 尝试找到对应的父菜单
      const parentId = perm.parentId
      if (map.has(parentId)) {
        const parent = map.get(parentId)
        if (parent.children) {
          parent.children.push({
            title: perm.permName,
            key: perm.id.toString(),
            value: perm.id,
            children: [],
            ...perm
          })
        }
      }
    })
    
    return tree
  }
  
  // 打开权限分配模态框
  const handlePermissionAssign = (role) => {
    setEditingRole(role)
    loadPermissions()
    // 加载角色已有的权限
    api.get(`/super-admin/roles/${role.id}/permissions`)
      .then(res => {
        if (res.code === 200) {
          const permIds = res.data || []
          setCheckedKeys(permIds.map(id => id.toString()))
        }
      })
      .catch(error => {
        console.error('加载角色权限失败', error)
      })
    setPermissionModalVisible(true)
  }
  
  // 保存角色权限
  const handleSavePermissions = async () => {
    try {
      const res = await api.post(`/super-admin/roles/${editingRole.id}/permissions`, {
        permissionIds: checkedKeys.map(key => parseInt(key))
      })
      if (res.code === 200) {
        message.success('权限分配成功')
        setPermissionModalVisible(false)
      } else {
        message.error(res.message || '权限分配失败')
      }
    } catch (error) {
      message.error('权限分配失败')
      console.error(error)
    }
  }

  const handleAdd = () => {
    setEditingRole(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (role) => {
    setEditingRole(role)
    form.setFieldsValue({
      roleName: role.roleName,
      roleCode: role.roleCode,
      description: role.description,
      status: role.status,
    })
    setModalVisible(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      if (editingRole) {
        // 更新角色
        const res = await api.put(`/super-admin/roles/${editingRole.id}`, values)
        if (res.code === 200) {
          message.success('角色更新成功')
          setModalVisible(false)
          form.resetFields()
          loadRoles()
        } else {
          message.error(res.message || '更新失败')
        }
      } else {
        // 创建角色
        const res = await api.post('/super-admin/roles', values)
        if (res.code === 200) {
          message.success('角色创建成功')
          setModalVisible(false)
          form.resetFields()
          loadRoles()
        } else {
          message.error(res.message || '创建失败')
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (roleId) => {
    try {
      const res = await api.delete(`/super-admin/roles/${roleId}`)
      if (res.code === 200) {
        message.success('角色删除成功')
        loadRoles()
      } else {
        message.error(res.message || '删除失败')
      }
    } catch (error) {
      message.error('删除失败')
      console.error(error)
    }
  }

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的角色')
      return
    }
    // 过滤掉系统内置角色
    const systemRoles = ['SUPER_ADMIN', 'ADMIN', 'USER']
    const rolesToDelete = roles.filter(r => selectedRowKeys.includes(r.id))
    const hasSystemRole = rolesToDelete.some(r => systemRoles.includes(r.roleCode))
    
    if (hasSystemRole) {
      message.error('不能删除系统内置角色')
      return
    }
    
    try {
      const res = await api.delete('/super-admin/roles/batch', {
        data: { roleIds: selectedRowKeys }
      })
      if (res.code === 200) {
        message.success(`成功删除 ${selectedRowKeys.length} 个角色`)
        setSelectedRowKeys([])
        loadRoles()
      } else {
        message.error(res.message || '批量删除失败')
      }
    } catch (error) {
      message.error('批量删除失败')
      console.error(error)
    }
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => {
      setSelectedRowKeys(keys)
    },
    getCheckboxProps: (record) => ({
      disabled: ['SUPER_ADMIN', 'ADMIN', 'USER'].includes(record.roleCode),
    }),
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '角色名称',
      dataIndex: 'roleName',
      key: 'roleName',
    },
    {
      title: '角色编码',
      dataIndex: 'roleCode',
      key: 'roleCode',
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
        title: '操作',
        key: 'action',
        width: 250,
        render: (_, record) => (
          <Space size="small">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
            <Button
              type="link"
              icon={<KeyOutlined />}
              onClick={() => handlePermissionAssign(record)}
            >
              权限分配
            </Button>
            {record.roleCode !== 'SUPER_ADMIN' && record.roleCode !== 'ADMIN' && record.roleCode !== 'USER' && (
              <Popconfirm
                title="确定要删除这个角色吗？"
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
        ),
      },
  ]

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加角色
          </Button>
          {selectedRowKeys.length > 0 ? (
            <Popconfirm
              title={`确定要删除选中的 ${selectedRowKeys.length} 个角色吗？`}
              onConfirm={handleBatchDelete}
              okText="确定"
              cancelText="取消"
            >
              <Button danger icon={<DeleteOutlined />}>
                批量删除 ({selectedRowKeys.length})
              </Button>
            </Popconfirm>
          ) : (
            <Button danger icon={<DeleteOutlined />} disabled>
              批量删除
            </Button>
          )}
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={roles}
        rowKey="id"
        loading={loading}
        pagination={false}
        rowSelection={rowSelection}
      />

      <Modal
        title={editingRole ? '编辑角色' : '添加角色'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="角色名称"
            name="roleName"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="如：运营管理员" />
          </Form.Item>
          <Form.Item
            label="角色编码"
            name="roleCode"
            rules={[
              { required: true, message: '请输入角色编码' },
              { pattern: /^[A-Z_]+$/, message: '角色编码只能包含大写字母和下划线' }
            ]}
          >
            <Input placeholder="如：OPERATOR" disabled={!!editingRole} />
          </Form.Item>
          <Form.Item
            label="描述"
            name="description"
          >
            <Input.TextArea rows={3} placeholder="角色描述" />
          </Form.Item>
          {editingRole && (
            <Form.Item
              label="状态"
              name="status"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select>
                <Option value={1}>正常</Option>
                <Option value={0}>禁用</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* 权限分配模态框 */}
      <Modal
        title={`为角色 ${editingRole?.roleName} 分配权限`}
        open={permissionModalVisible}
        onOk={handleSavePermissions}
        onCancel={() => {
          setPermissionModalVisible(false)
        }}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Tree
          checkable
          treeData={convertToTreeData(permissions)}
          checkedKeys={checkedKeys}
          expandedKeys={expandedKeys}
          onCheckedKeysChange={(keys) => setCheckedKeys(keys)}
          onExpand={(keys) => setExpandedKeys(keys)}
          defaultExpandAll
          style={{ maxHeight: '500px', overflowY: 'auto' }}
        />
      </Modal>
    </div>
  )
}

export default RoleConfig

