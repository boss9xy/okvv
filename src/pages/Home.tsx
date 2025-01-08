import React from 'react';
import TranslationApp from '../components/TranslationApp';

const Home: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">YouTube Subtitle Translator</h1>
      <TranslationApp />
    </div>
  );
};

export default Home;