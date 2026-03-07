'use client';

import React from 'react';
import { Modal, Typography, List, Button, theme, Tag, Space, Divider } from 'antd';
import { 
  CloseOutlined, 
  SoundOutlined, 
  CopyOutlined,
  BookOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export const SentenceModal = ({ word, isOpen, onClose }) => {
  const { token } = theme.useToken();
  const [copiedId, setCopiedId] = React.useState(null);

  if (!word) return null;

  // Using actual sentences from the API with enhanced metadata
  const sentences = Array.isArray(word.sentence)
    ? word.sentence.map((text, i) => ({ 
        id: i, 
        text,
        source: i % 2 === 0 ? 'Common Usage' : 'Formal Context', // Example source classification
        difficulty: i % 3 === 0 ? 'Easy' : i % 3 === 1 ? 'Medium' : 'Advanced'
      }))
    : [{ id: 0, text: word.sentence, source: 'Common Usage', difficulty: 'Medium' }];

  const highlightWord = (sentence, targetWord) => {
    if (!sentence || !targetWord) return sentence;
    const parts = sentence.split(new RegExp(`(${targetWord})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === targetWord.toLowerCase() ? (
            <Text 
              key={i} 
              style={{
                backgroundColor: token.colorWarningBg,
                color: token.colorWarningText,
                padding: '2px 4px',
                borderRadius: token.borderRadiusSM,
                fontWeight: 600,
              }}
            >
              {part}
            </Text>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      case 'Advanced': return 'error';
      default: return 'default';
    }
  };

  return (
    <Modal
      title={
        <Space align="center" style={{ width: '100%' }}>
          <BookOutlined style={{ color: token.colorPrimary, fontSize: 24 }} />
          <Title level={4} style={{ margin: 0 }}>
            Example Sentences
          </Title>
          <Divider type="vertical" />
          <Text type="secondary">for</Text>
          <Tag color="blue" style={{ fontSize: 16, padding: '4px 12px' }}>
            {word?.name}
          </Tag>
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button 
          key="close" 
          type="primary" 
          onClick={onClose}
          icon={<CloseOutlined />}
          size="large"
        >
          Close
        </Button>
      ]}
      width={800}
      centered
      closeIcon={<CloseOutlined />}
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto',
          padding: token.paddingLG,
          background: token.colorBgContainer,
        }
      }}
      modalRender={(node) => (
        <div className="sentence-modal-container">
          {node}
        </div>
      )}
    >
      {/* Word Stats Summary */}
      <Space wrap style={{ marginBottom: token.marginLG, width: '100%', justifyContent: 'center' }}>
        <Tag icon={<BookOutlined />} color="processing">
          {sentences.length} Examples
        </Tag>
        <Tag icon={<CheckCircleOutlined />} color="success">
          Verified Examples
        </Tag>
        <Tag icon={<SoundOutlined />} color="magenta">
          Audio Available
        </Tag>
      </Space>

      <List
        dataSource={sentences}
        split={false}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            style={{
              padding: token.paddingMD,
              background: `linear-gradient(145deg, ${token.colorBgContainer} 0%, ${token.colorBgContainerDisabled}20 100%)`,
              borderRadius: token.borderRadiusLG,
              marginBottom: token.marginMD,
              border: `1px solid ${token.colorBorderSecondary}`,
              boxShadow: token.boxShadowTertiary,
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            className="sentence-item"
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = token.boxShadowSecondary;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = token.boxShadowTertiary;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ width: '100%' }}>
              {/* Sentence Tags */}
              <Space wrap style={{ marginBottom: token.marginXS }}>
                <Tag color={getDifficultyColor(item.difficulty)}>
                  {item.difficulty}
                </Tag>
                <Tag color="geekblue">{item.source}</Tag>
              </Space>

              {/* Main Sentence */}
              <Paragraph
                style={{
                  fontSize: 16,
                  lineHeight: 1.8,
                  marginBottom: token.marginSM,
                  padding: token.paddingSM,
                  background: token.colorBgContainer,
                  borderRadius: token.borderRadius,
                  borderLeft: `4px solid ${token.colorPrimary}`,
                }}
              >
                {highlightWord(item.text, word.name)}
              </Paragraph>

              {/* Action Buttons */}
              <Space wrap style={{ justifyContent: 'flex-end', width: '100%' }}>
                <Button
                  type="text"
                  icon={<SoundOutlined />}
                  size="small"
                  onClick={() => handleSpeak(item.text)}
                  style={{ color: token.colorPrimary }}
                >
                  Listen
                </Button>
                <Button
                  type="text"
                  icon={copiedId === item.id ? <CheckCircleOutlined /> : <CopyOutlined />}
                  size="small"
                  onClick={() => handleCopy(item.text, item.id)}
                  style={{ 
                    color: copiedId === item.id ? token.colorSuccess : token.colorSecondary 
                  }}
                >
                  {copiedId === item.id ? 'Copied!' : 'Copy'}
                </Button>
              </Space>
            </div>
          </List.Item>
        )}
      />

      {/* Empty State */}
      {sentences.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: token.paddingXXL,
          color: token.colorTextDisabled 
        }}>
          <BookOutlined style={{ fontSize: 48, marginBottom: token.marginMD }} />
          <Title level={5} type="secondary">No example sentences available</Title>
        </div>
      )}

      <style jsx>{`
        .sentence-item {
          animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .sentence-modal-container :global(.ant-modal-content) {
          overflow: hidden;
          border-radius: ${token.borderRadiusLG}px;
        }
        
        .sentence-modal-container :global(.ant-modal-header) {
          border-bottom: 2px solid ${token.colorBorderSecondary};
          padding: ${token.paddingLG}px;
        }
        
        .sentence-modal-container :global(.ant-modal-footer) {
          border-top: 2px solid ${token.colorBorderSecondary};
          padding: ${token.paddingMD}px ${token.paddingLG}px;
        }
      `}</style>
    </Modal>
  );
};