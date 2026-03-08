'use client';

import React from 'react';
import { Modal } from 'antd';
import { SoundOutlined, CopyOutlined, CheckCircleOutlined } from '@ant-design/icons';

export const SentenceModal = ({ word, isOpen, onClose }) => {
  const [copiedId, setCopiedId] = React.useState(null);

  if (!word) return null;

  const wordName = word?.name || word?.term || '';

  const sentences = Array.isArray(word.sentence)
    ? word.sentence.map((text, i) => ({ id: i, text }))
    : word.sentence
    ? [{ id: 0, text: word.sentence }]
    : [];

  const highlightWord = (sentence, targetWord) => {
    if (!sentence || !targetWord) return sentence;
    const parts = sentence.split(new RegExp(`(${targetWord})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === targetWord.toLowerCase() ? (
        <span key={i} style={{ color: '#E11D48', fontWeight: 600 }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closeIcon={null}
      width={700}
      centered
      styles={{
        content: {
          padding: 0,
          borderRadius: 6,
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
        },
        body: { padding: 0 },
      }}
    >
      <div style={{ background: '#fff', borderRadius: 6, overflow: 'hidden' }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px 10px',
          borderBottom: '1px solid #e5e7eb',
        }}>
          <p style={{ margin: 0, fontSize: 17, color: '#1a1a1a', fontWeight: 400 }}>
            Sentences using the word&nbsp;
            <span style={{ color: '#E11D48', fontWeight: 700 }}>{wordName}</span>
            &nbsp;:
          </p>

          <button
            onClick={onClose}
            style={{
              background: '#E11D48',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '5px 18px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: 0.3,
            }}
          >
            Close
          </button>
        </div>

        {/* ── Sentence List ── */}
        <div style={{
          maxHeight: '70vh',
          overflowY: 'auto',
          padding: '10px 18px 16px',
        }}>
          {sentences.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '32px 0' }}>
              No example sentences available.
            </p>
          ) : (
            <ol style={{ margin: 0, paddingLeft: 22 }}>
              {sentences.map((item) => (
                <li
                  key={item.id}
                  style={{
                    fontSize: 18,
                    lineHeight: 1.75,
                    color: '#1f2937',
                    padding: '4px 0',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <span style={{ flex: 1 }}>
                    {highlightWord(item.text, wordName)}
                  </span>

                  {/* Inline actions */}
                  <span style={{ display: 'flex', gap: 4, flexShrink: 0, opacity: 0.45 }}
                    className="sentence-actions"
                  >
                    <button
                      title="Listen"
                      onClick={() => handleSpeak(item.text)}
                      style={iconBtnStyle}
                    >
                      <SoundOutlined style={{ fontSize: 13 }} />
                    </button>
                    <button
                      title={copiedId === item.id ? 'Copied!' : 'Copy'}
                      onClick={() => handleCopy(item.text, item.id)}
                      style={{
                        ...iconBtnStyle,
                        color: copiedId === item.id ? '#16a34a' : 'inherit',
                      }}
                    >
                      {copiedId === item.id
                        ? <CheckCircleOutlined style={{ fontSize: 13 }} />
                        : <CopyOutlined style={{ fontSize: 13 }} />}
                    </button>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <style jsx global>{`
        li:hover .sentence-actions {
          opacity: 1 !important;
        }
      `}</style>
    </Modal>
  );
};

const iconBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '2px 4px',
  borderRadius: 3,
  color: '#6b7280',
  display: 'flex',
  alignItems: 'center',
};