import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import mammoth from 'mammoth';
import axios from 'axios';
import { saveAs } from 'file-saver';

const TranslationApp: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [progress, setProgress] = useState(0);

  const { getRootProps, getInputProps } = useDropzone({
    accept: '.docx',
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      setFile(file);
      const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      setOriginalText(result.value);
    },
  });

  const startTranslation = async () => {
    if (!file || !apiKey) return;

    const chunks = splitTextIntoChunks(originalText, 2000);
    let translatedText = '';

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: `Translate the following text to Vietnamese: ${chunk}` }],
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      translatedText += response.data.choices[0].message.content + '\n';
      setTranslatedText(translatedText);
      setProgress(((i + 1) / chunks.length) * 100);
    }
  };

  const splitTextIntoChunks = (text: string, chunkSize: number): string[] => {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const saveTranslatedFile = () => {
    const blob = new Blob([translatedText], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'translated.txt');
  };

  return (
    <div>
      <div {...getRootProps()} className="border-2 border-dashed p-4 mb-4">
        <input {...getInputProps()} />
        <p>Kéo thả tệp .docx vào đây hoặc click để chọn tệp</p>
      </div>

      <div className="mb-4">
        <label className="block mb-2">API Key</label>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <button onClick={startTranslation} className="bg-blue-500 text-white p-2 rounded">
        Bắt đầu dịch
      </button>

      <div className="mt-4">
        <label className="block mb-2">Tiến độ</label>
        <progress value={progress} max="100" className="w-full" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2">Văn bản gốc</label>
          <textarea value={originalText} readOnly className="w-full p-2 border rounded" rows={10} />
        </div>
        <div>
          <label className="block mb-2">Văn bản dịch</label>
          <textarea value={translatedText} readOnly className="w-full p-2 border rounded" rows={10} />
        </div>
      </div>

      <button onClick={saveTranslatedFile} className="mt-4 bg-green-500 text-white p-2 rounded">
        Lưu tệp dịch
      </button>
    </div>
  );
};

export default TranslationApp;