import { Card, Typography, Space, Row, Col } from 'antd'
import { BookOutlined, PlusOutlined, EditOutlined, HeartOutlined, StarOutlined, CommentOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

function HomePage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 网站介绍主题 */}
        <Card 
          style={{ 
            marginBottom: '24px', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff'
          }}
        >
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Title level={1} style={{ color: '#fff', marginBottom: '20px', fontSize: '36px' }}>
              面试题学习平台
            </Title>
            <Paragraph style={{ color: '#fff', fontSize: '18px', lineHeight: '1.8', maxWidth: '800px', margin: '0 auto' }}>
              专业的面试题学习平台，汇集海量优质面试题目，涵盖Java、Spring、MySQL、Redis等主流技术栈。
              通过系统化的学习和练习，帮助您快速提升技术能力，轻松应对各种技术面试挑战。
            </Paragraph>
            <Space size="large" style={{ marginTop: '30px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>1000+</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>精选题目</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>50+</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>技术分类</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>模拟面试</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>实战演练</div>
              </div>
            </Space>
          </div>
        </Card>

        {/* 用户功能介绍模块 */}
        <Card 
          style={{ 
            marginBottom: '24px',
            borderRadius: '12px',
          }}
        >
          <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>
            您可以在这里做什么？
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={8}>
              <Card
                hoverable
                style={{ 
                  textAlign: 'center', 
                  height: '100%',
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0'
                }}
                bodyStyle={{ padding: '30px 20px' }}
              >
                <BookOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                <Title level={4} style={{ marginBottom: '12px' }}>浏览学习</Title>
                <Paragraph type="secondary" style={{ margin: 0 }}>
                  浏览海量精选面试题目，按分类、难度筛选，系统化学习各类技术知识点
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card
                hoverable
                style={{ 
                  textAlign: 'center', 
                  height: '100%',
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0'
                }}
                bodyStyle={{ padding: '30px 20px' }}
              >
                <PlusOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                <Title level={4} style={{ marginBottom: '12px' }}>分享题目</Title>
                <Paragraph type="secondary" style={{ margin: 0 }}>
                  分享您遇到的面试题目，帮助其他开发者学习，共同构建知识社区
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card
                hoverable
                style={{ 
                  textAlign: 'center', 
                  height: '100%',
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0'
                }}
                bodyStyle={{ padding: '30px 20px' }}
              >
                <EditOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
                <Title level={4} style={{ marginBottom: '12px' }}>模拟面试</Title>
                <Paragraph type="secondary" style={{ margin: 0 }}>
                  通过模拟面试功能，随机抽取题目进行练习，提升实战能力和面试技巧
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card
                hoverable
                style={{ 
                  textAlign: 'center', 
                  height: '100%',
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0'
                }}
                bodyStyle={{ padding: '30px 20px' }}
              >
                <HeartOutlined style={{ fontSize: '48px', color: '#f5222d', marginBottom: '16px' }} />
                <Title level={4} style={{ marginBottom: '12px' }}>点赞收藏</Title>
                <Paragraph type="secondary" style={{ margin: 0 }}>
                  为优质题目点赞，收藏重要内容，方便随时回顾和复习
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card
                hoverable
                style={{ 
                  textAlign: 'center', 
                  height: '100%',
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0'
                }}
                bodyStyle={{ padding: '30px 20px' }}
              >
                <StarOutlined style={{ fontSize: '48px', color: '#722ed1', marginBottom: '16px' }} />
                <Title level={4} style={{ marginBottom: '12px' }}>个人中心</Title>
                <Paragraph type="secondary" style={{ margin: 0 }}>
                  管理您的个人信息，查看发布的题目、收藏的内容和学习记录
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card
                hoverable
                style={{ 
                  textAlign: 'center', 
                  height: '100%',
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0'
                }}
                bodyStyle={{ padding: '30px 20px' }}
              >
                <CommentOutlined style={{ fontSize: '48px', color: '#13c2c2', marginBottom: '16px' }} />
                <Title level={4} style={{ marginBottom: '12px' }}>互动交流</Title>
                <Paragraph type="secondary" style={{ margin: 0 }}>
                  查看题目解析，参与讨论，与其他开发者交流学习心得和经验
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </Card>
      </Space>
    </div>
  )
}

export default HomePage










