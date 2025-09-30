import React, { useState, useEffect } from 'react';
import { Newspaper } from 'lucide-react';

// A single news card component
const NewsCard = ({ article }) => (
  <a href={article.url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
    <img src={article.urlToImage || 'https://placehold.co/600x400/EEE/31343C?text=News'} alt={article.title} className="object-cover w-full h-40 mb-4 rounded-md" />
    <h3 className="mb-2 text-lg font-bold text-gray-800">{article.title}</h3>
    <p className="text-sm text-gray-600">{article.description}</p>
    <p className="mt-4 text-xs text-gray-400">{new Date(article.publishedAt).toLocaleDateString()}</p>
  </a>
);

export default function Home() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/news');
        if (!response.ok) {
          throw new Error('Failed to fetch news from the server.');
        }
        const data = await response.json();
        setNews(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <Newspaper className="w-8 h-8 mr-3 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-900">Latest Financial News</h1>
      </div>
      
      {isLoading && <p className="text-center">Loading news...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}
      
      {!isLoading && !error && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((article, index) => (
            <NewsCard key={index} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}