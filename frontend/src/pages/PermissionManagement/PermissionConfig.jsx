import { useState, useEffect } from 'react'
import { Tabs, Button, Space, Modal, Form, Input, Tag, message, Popconfirm, Select, Tree, Collapse, Checkbox, Row, Col, Table } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, UnorderedListOutlined, CodeOutlined, LayoutOutlined, SearchOutlined, LinkOutlined } from '@ant-design/icons'
import api from '../../services/api'

const { TabPane } = Tabs
const { Option } = Select

const PERM_TYPE_MAP = {
  1: { label: '菜单权限', color: 'blue' },
  2: { label: '按钮权限', color: 'orange' },
  3: { label: '接口权限', color: 'green' },
}

function PermissionConfig() {

  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('添加权限')
  const [editingPermission, setEditingPermission] = useState(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [currentPermType, setCurrentPermType] = useState(1)
  const [treeData, setTreeData] = useState([])
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  // 接口绑定相关状态
  const [apiBindingModalVisible, setApiBindingModalVisible] = useState(false)
  const [currentPermission, setCurrentPermission] = useState(null)
  const [availableApis, setAvailableApis] = useState([])
  const [selectedApiKeys, setSelectedApiKeys] = useState([])

  useEffect(() => {
    loadPermissions()
  }, [])

  

  // 将所有权限转换为统一树形结构（支持表格）
  const convertToTreeData = (permissions) => {
    const allPerms = [...permissions]
    const map = new Map()
    const tree = []
    
    // 先创建所有权限节点
    allPerms.forEach(perm => {
      map.set(perm.id, {
        ...perm,
        key: perm.id.toString(),
        children: [],
        // 为表格添加额外字段
        permTypeName: PERM_TYPE_MAP[perm.permType]?.label,
        permTypeColor: PERM_TYPE_MAP[perm.permType]?.color,
        resourcePath: perm.permType === 1 ? perm.routePath : 
                      perm.permType === 3 ? `${perm.requestMethod} ${perm.interfacePath}` : '-',
        // 初始化绑定的接口列表
        boundApis: []
      })
    })
    
    // 构建树形结构
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
    
    return tree
  }
  
  // 树状表格的列配置
  const columns = [
    {
      title: '权限名称',
      dataIndex: 'permName',
      key: 'permName',
      width: 200,
      render: (text, record) => (
        <Space>
          {record.permType === 1 && <LayoutOutlined />}
          {record.permType === 2 && <UnorderedListOutlined />}
          {record.permType === 3 && <CodeOutlined />}
          {text}
        </Space>
      )
    },
    {
      title: '权限编码',
      dataIndex: 'permCode',
      key: 'permCode',
      width: 200,
      ellipsis: true
    },
    {
      title: '权限类型',
      dataIndex: 'permTypeName',
      key: 'permTypeName',
      width: 100,
      render: (text, record) => (
        <Tag color={record.permTypeColor}>{text}</Tag>
      )
    },
    {title: '资源路径',
      dataIndex: 'resourcePath',
      key: 'resourcePath',
      width: 250,
      ellipsis: true
    },
    {title: '绑定接口',
      dataIndex: 'boundApis',
      key: 'boundApis',
      width: 200,
      render: (boundApis, record) => {
        if (record.permType === 3) return '-'; // 接口权限不绑定接口
        if (!boundApis || boundApis.length === 0) return '-';
        return boundApis.length > 2 ? (
          <Space>
            {boundApis.slice(0, 2).map(api => (
              <Tag key={api.id} color="blue" size="small">{api.permName}</Tag>
            ))}
            <Tag color="default" size="small">+{boundApis.length - 2}</Tag>
          </Space>
        ) : (
          boundApis.map(api => (
            <Tag key={api.id} color="blue" size="small">{api.permName}</Tag>
          ))
        );
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '正常' : '禁用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {(record.permType === 1 || record.permType === 2) && (
            <Button
              type="link"
              icon={<LinkOutlined />}
              onClick={() => handleBindApi(record)}
            >
              绑定接口
            </Button>
          )}
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个权限吗？"
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
        </Space>
      )
    }
  ]
  
  const loadPermissions = async () => {
    setLoading(true)
    try {
      const res = await api.get('/super-admin/permissions')
      if (res.code === 200) {
        const perms = res.data || []
        setPermissions(perms)
        
        // 处理所有权限为统一树形结构
        const tree = convertToTreeData(perms)
        setTreeData(tree)
      }
    } catch (error) {
      message.error('加载权限列表失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  

  const handleEdit = (permission) => {
    setEditingPermission(permission)
    setCurrentPermType(permission.permType)
    form.setFieldsValue({
      permName: permission.permName,
      permCode: permission.permCode,
      permType: permission.permType,
      parentId: permission.parentId || 0,
      routePath: permission.routePath,
      interfacePath: permission.interfacePath,
      requestMethod: permission.requestMethod,
      description: permission.description,
      status: permission.status,
    })
    // 设置模态框标题，显示具体权限类型
    setModalTitle(`编辑权限`)
    setModalVisible(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      if (editingPermission) {
        // 更新权限
        const res = await api.put(`/super-admin/permissions/${editingPermission.id}`, values)
        if (res.code === 200) {
          message.success('权限更新成功')
          setModalVisible(false)
          form.resetFields()
          loadPermissions()
        } else {
          message.error(res.message || '更新失败')
        }
      } else {
        // 创建权限
        const res = await api.post('/super-admin/permissions', values)
        if (res.code === 200) {
          message.success('权限创建成功')
          setModalVisible(false)
          form.resetFields()
          loadPermissions()
        } else {
          message.error(res.message || '创建失败')
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (permissionId) => {
    try {
      const res = await api.delete(`/super-admin/permissions/${permissionId}`)
      if (res.code === 200) {
        message.success('权限删除成功')
        loadPermissions()
      } else {
        message.error(res.message || '删除失败')
      }
    } catch (error) {
      message.error('删除失败')
      console.error(error)
    }
  }

  const handleBatchDelete = async () => {
    // 使用selectedRowKeys直接删除选择的权限
    const permissionIds = selectedRowKeys
    
    if (permissionIds.length === 0) {
      message.warning('请选择要删除的权限')
      return
    }
    
    try {
      const res = await api.delete('/super-admin/permissions/batch', {
        data: { permissionIds }
      })
      if (res.code === 200) {
        message.success(`成功删除 ${permissionIds.length} 个权限`)
        setSelectedRowKeys([])
        loadPermissions()
      } else {
        message.error(res.message || '批量删除失败')
      }
    } catch (error) {
      message.error('批量删除失败')
      console.error(error)
    }
  }
  
  // 打开接口绑定模态框
  const handleBindApi = (permission) => {
    setCurrentPermission(permission)
    setApiBindingModalVisible(true)
    
    // 过滤出所有接口权限
    const apiPerms = permissions.filter(p => p.permType === 3)
    setAvailableApis(apiPerms)
    
    // 模拟当前已绑定的接口（实际项目中应该从接口获取）
    // 这里简单模拟为权限编码包含相同模块的接口
    const module = permission.permCode.split(':').slice(0, 2).join(':')
    const initialSelectedApis = apiPerms
      .filter(api => api.permCode.startsWith(module))
      .map(api => api.id)
    
    setSelectedApiKeys(initialSelectedApis)
  }
  
  // 保存接口绑定
  const handleSaveApiBinding = () => {
    // 模拟保存接口绑定（实际项目中应该调用接口保存）
    console.log('保存接口绑定:', {
      permissionId: currentPermission.id,
      apiIds: selectedApiKeys
    })
    
    message.success('接口绑定保存成功')
    setApiBindingModalVisible(false)
    setSelectedApiKeys([])
    
    // 重新加载权限列表以更新绑定信息
    loadPermissions()
  }

  

  const getColumns = (permType) => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '权限编码',
      dataIndex: 'permCode',
      key: 'permCode',
      width: 250,
      ellipsis: true,
    },
    {
      title: '权限名称',
      dataIndex: 'permName',
      key: 'permName',
    },
    {
      title: '资源路径',
      key: 'resource',
      width: 250,
      ellipsis: true,
      render: (_, record) => {
        if (permType === 1) {
          return record.routePath || '-'
        } else if (permType === 3) {
          return `${record.requestMethod || 'ALL'} ${record.interfacePath || '-'}`
        }
        return '-'
      },
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
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个权限吗？"
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
        </Space>
      ),
    },
  ]

  // 权限搜索功能
  const handleSearch = (value) => {
    setSearchText(value)
  }
  
  // 过滤树形权限数据
  const filterTreeData = (treeData, searchText) => {
    if (!searchText) return treeData
    
    const filterNode = (node) => {
      // 处理所有权限节点
      const children = node.children ? node.children.map(child => filterNode(child)).filter(Boolean) : []
      const matchesSearch = node.permName?.includes(searchText) || node.permCode?.includes(searchText)
      
      if (matchesSearch || children.length > 0) {
        return {
          ...node,
          children
        }
      }
      return null
    }
    
    return treeData.map(node => filterNode(node)).filter(Boolean)
  }
  
  // 过滤模块权限
  const filterModulePermissions = (modulePermissions, searchText) => {
    if (!searchText) return modulePermissions
    
    const filtered = {}    
    Object.entries(modulePermissions).forEach(([module, perms]) => {
      const filteredPerms = perms.filter(perm => 
        perm.permName.includes(searchText) || perm.permCode.includes(searchText)
      )
      if (filteredPerms.length > 0) {
        filtered[module] = filteredPerms
      }
    })
    
    return filtered
  }
  
  // 一键全选/取消全选
  const handleSelectAll = (checked) => {
    if (checked) {
      // 收集所有实际权限节点的key
      const allKeys = []
      const collectKeys = (nodes) => {
        nodes.forEach(node => {
          // 只收集实际权限节点
          if (!isNaN(Number(node.key))) {
            allKeys.push(node.key)
          }
          if (node.children && node.children.length > 0) {
            collectKeys(node.children)
          }
        })
      }
      collectKeys(treeData)
      setSelectedRowKeys(allKeys)
    } else {
      // 取消全选
      setSelectedRowKeys([])
    }
  }
  
  // 预设权限模板定义
  const permissionTemplates = {
    'admin': {
      name: '管理员模板',
      description: '包含所有权限',
      menuPermissions: true, // 全选菜单权限
      buttonPermissions: true, // 全选按钮权限
      apiPermissions: true // 全选接口权限
    },
    'user': {
      name: '普通用户模板',
      description: '包含基础操作权限',
      menuPermissions: ['system:user:page', 'system:dashboard:page'], // 部分菜单权限
      buttonPermissions: ['system:user:view:button', 'system:user:export:button'], // 部分按钮权限
      apiPermissions: ['system:user:list:api', 'system:dashboard:stats:api'] // 部分接口权限
    }
  }
  
  // 预设权限模板应用
  const handleApplyTemplate = (templateName) => {
    const template = permissionTemplates[templateName]
    if (!template) return
    
    const matchingKeys = []
    
    // 收集所有匹配的权限节点key
    const findMatchingKeys = (nodes) => {
      nodes.forEach(node => {
        // 只检查实际权限节点
        if (!node.isModule && !isNaN(Number(node.key))) {
          const isMenuPerm = node.permType === 1
          const isButtonPerm = node.permType === 2
          const isApiPerm = node.permType === 3
          
          // 检查是否匹配模板
          const matchesTemplate = (
            (isMenuPerm && template.menuPermissions && 
              (template.menuPermissions === true || template.menuPermissions.includes(node.permCode))) ||
            (isButtonPerm && template.buttonPermissions && 
              (template.buttonPermissions === true || template.buttonPermissions.includes(node.permCode))) ||
            (isApiPerm && template.apiPermissions && 
              (template.apiPermissions === true || template.apiPermissions.includes(node.permCode)))
          )
          
          if (matchesTemplate) {
            matchingKeys.push(node.key)
          }
        }
        
        if (node.children && node.children.length > 0) {
          findMatchingKeys(node.children)
        }
      })
    }
    
    findMatchingKeys(treeData)
    setSelectedRowKeys(matchingKeys)
    
    message.success(`已应用${template.name}模板`)
  }
  
  // 打开添加权限模态框，让用户选择权限类型
  const handleAdd = () => {
    setEditingPermission(null)
    form.resetFields()
    form.setFieldsValue({
      permType: 1, // 默认选择菜单权限
      status: 1, // 默认状态为正常
    })
    setCurrentPermType(1) // 更新当前权限类型
    setModalTitle('添加权限')
    setModalVisible(true)
  }
  
  return (
    <div style={{ padding: '16px', background: '#f0f2f5' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加权限
            </Button>
            <Button icon={<CheckOutlined />} onClick={() => handleSelectAll(true)}>
              一键全选
            </Button>
            <Button onClick={() => handleSelectAll(false)}>
              取消全选
            </Button>
            <Select
              defaultValue=""
              placeholder="选择预设模板"
              style={{ width: 150 }}
              onChange={handleApplyTemplate}
            >
              <Option value="admin">管理员模板</Option>
              <Option value="user">普通用户模板</Option>
            </Select>
          </Space>
          <div style={{ width: '300px' }}>
            <Input
              placeholder="搜索权限"
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </div>
        </div>
        
        <Table
          columns={columns}
          dataSource={filterTreeData(treeData, searchText)}
          rowKey="id"
          pagination={false}
          expandable={{
            defaultExpandAllRows: true,
            indentSize: 20
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
            // 只允许选择实际权限节点
            getCheckboxProps: (record) => ({
              disabled: false
            })
          }}
          style={{ maxHeight: '600px', overflowY: 'auto' }}
        />
        
        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title={`确定要删除选中的 ${selectedRowKeys.length} 个权限吗？`}
              onConfirm={handleBatchDelete}
              okText="确定"
              cancelText="取消"
            >
              <Button danger icon={<DeleteOutlined />}>
                批量删除 ({selectedRowKeys.length})
              </Button>
            </Popconfirm>
          )}
        </div>
      </div>

      {/* 添加/编辑权限模态框 */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="权限名称"
            name="permName"
            rules={[{ required: true, message: '请输入权限名称' }]}
          >
            <Input 
              placeholder={
                currentPermType === 1 ? '如：用户管理页面' : 
                currentPermType === 2 ? '如：新增用户按钮' : 
                currentPermType === 3 ? '如：获取用户列表接口' : 
                '请输入权限名称'
              } 
            />
          </Form.Item>
          <Form.Item
            label="权限编码"
            name="permCode"
            rules={[
              { required: true, message: '请输入权限编码' },
              { pattern: /^[a-z:]+$/, message: '权限编码只能包含小写字母和冒号' }
            ]}
          >
            <Input 
              placeholder={
                currentPermType === 1 ? '如：system:user:page' : 
                currentPermType === 2 ? '如：system:user:add:button' : 
                currentPermType === 3 ? '如：system:user:list:api' : 
                '请输入权限编码'
              } 
              disabled={false} 
            />
          </Form.Item>
          <Form.Item
            label="权限类型"
            name="permType"
            rules={[{ required: true, message: '请选择权限类型' }]}
          >
            <Select onChange={(value) => setCurrentPermType(value)}>
              <Option value={1}>菜单权限</Option>
              <Option value={2}>按钮权限</Option>
              <Option value={3}>接口权限</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="父权限ID"
            name="parentId"
          >
            <Input type="number" placeholder="0表示顶级权限" />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.permType !== currentValues.permType}
          >
            {({ getFieldValue }) => {
              const permType = getFieldValue('permType')
              if (permType === 1) {
                return (
                  <Form.Item
                    label="前端路由路径"
                    name="routePath"
                    rules={[{ required: true, message: '请输入前端路由路径' }]}
                  >
                    <Input placeholder="如：/system/user" />
                  </Form.Item>
                )
              } else if (permType === 3) {
                return (
                  <>
                    <Form.Item
                      label="接口路径"
                      name="interfacePath"
                      rules={[{ required: true, message: '请输入接口路径' }]}
                    >
                      <Input placeholder="如：/api/users" />
                    </Form.Item>
                    <Form.Item
                      label="请求方法"
                      name="requestMethod"
                      rules={[{ required: true, message: '请选择请求方法' }]}
                    >
                      <Select>
                        <Option value="GET">GET</Option>
                        <Option value="POST">POST</Option>
                        <Option value="PUT">PUT</Option>
                        <Option value="DELETE">DELETE</Option>
                        <Option value="PATCH">PATCH</Option>
                      </Select>
                    </Form.Item>
                  </>
                )
              }
              return null
            }}
          </Form.Item>
          <Form.Item
            label="描述"
            name="description"
          >
            <Input.TextArea 
              rows={3} 
              placeholder={
                currentPermType === 1 ? '如：用户管理页面权限描述' : 
                currentPermType === 2 ? '如：新增用户按钮权限描述' : 
                currentPermType === 3 ? '如：获取用户列表接口权限描述' : 
                '请输入权限描述'
              } 
            />
          </Form.Item>
          {editingPermission && (
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
      
      {/* 接口绑定模态框 */}
      <Modal
        title={`为${currentPermission?.permName || ''}绑定接口`}
        open={apiBindingModalVisible}
        onOk={handleSaveApiBinding}
        onCancel={() => {
          setApiBindingModalVisible(false)
          setSelectedApiKeys([])
        }}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <Checkbox.Group
            options={availableApis.map(api => ({
              label: (
                <Space>
                  <CodeOutlined />
                  {api.permName}
                  <Tag color="green" size="small">{api.permCode}</Tag>
                  <Tag color="green" size="small">{api.requestMethod}</Tag>
                </Space>
              ),
              value: api.id
            }))}
            value={selectedApiKeys}
            onChange={(keys) => setSelectedApiKeys(keys)}
          />
        </div>
      </Modal>
    </div>
  )
}

export default PermissionConfig
