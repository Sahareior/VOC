'use client';

import React from 'react';
import { Modal, Typography, List, Button, theme } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const SentenceModal = ({ word, isOpen, onClose }) => {
  const { token } = theme.useToken();

  if (!word) return null;

  // Dummy sentences for now
  const dummySentences = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    text: `This is example sentence number ${i + 1} containing the word ${word.name} in a realistic context for better understanding.`
  }));

  const highlightWord = (sentence, targetWord) => {
    if (!sentence || !targetWord) return sentence;
    const parts = sentence.split(new RegExp(`(${targetWord})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === targetWord.toLowerCase() ? (
            <Text key={i} type="danger" strong>
              {part}
            </Text>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          Example Sentences for <Text type="danger">{word?.name}</Text>
        </Title>
      }
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Close
        </Button>
      ]}
      width={700}
      centered
      closeIcon={<CloseOutlined />}
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto',
          padding: token.padding,
        }
      }}
    >
      <List
        dataSource={dummySentences}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            style={{
              padding: token.padding,
              backgroundColor: token.colorBgContainerDisabled,
              borderRadius: token.borderRadiusLG,
              marginBottom: token.marginSM,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Text style={{ lineHeight: 1.6 }}>
              {highlightWord(item.text, word.name)}
            </Text>
          </List.Item>
        )}
      />
    </Modal>
  );
};