import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ClipLoader } from 'react-spinners';
import WordCloud from 'react-wordcloud';

interface Word {
  text: string;
  value: number;
}

const SearchHistoryVisualizer = () => {
  const [wordData, setWordData] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWordCloudRendered, setIsWordCloudRendered] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State to store error messages

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setErrorMessage(null); // Clear previous error messages
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          if (validateJsonData(jsonData)) {
            setIsLoading(true); // Show loader after file is validated
            generateWordData(jsonData);
          } else {
            setErrorMessage('Invalid file format. Please upload the correct JSON file.');
          }
        } catch (error) {
          console.error('Error parsing JSON file:', error);
          setErrorMessage('Error parsing JSON file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Function to validate the uploaded JSON file structure
  const validateJsonData = (data: any) => {
    if (!data.searches_keyword || !Array.isArray(data.searches_keyword)) {
      return false;
    }

    return data.searches_keyword.every((item: any) => {
      const stringMapData = item.string_map_data;
      return (
        stringMapData &&
        stringMapData.Search &&
        typeof stringMapData.Search.value === 'string' &&
        typeof stringMapData.Search.timestamp === 'number' &&
        stringMapData.Time &&
        typeof stringMapData.Time.timestamp === 'number'
      );
    });
  };

  // Helper function to generate word data for the word cloud
  const generateWordData = (data: any) => {
    const searches = data.searches_keyword.map((item: any) => item.string_map_data.Search.value);
    const wordCount: { [key: string]: number } = {};

    searches.forEach((search: string) => {
      wordCount[search] = (wordCount[search] || 0) + 1; // Count the occurrences of each word
    });

    const formattedWordData: Word[] = Object.keys(wordCount).map((word) => ({
      text: word,
      value: wordCount[word],
    }));

    setWordData(formattedWordData);
    setIsLoading(false); // Hide loader when word data is ready
    setIsWordCloudRendered(false); // Reset word cloud rendering state
  };

  // Customization options for the word cloud
  const options = {
    rotations: 0,
    fontSizes: [30, 80],
    fontFamily: 'Sans-Serif',
    fontWeight: 'bold',
    colors: ['#007bff', '#6c757d', '#ff6347', '#32cd32', '#ff69b4'],
    enableTooltip: false,
    padding: 5,
  };

  // Callback when word cloud finishes rendering
  const handleWordCloudRendered = () => {
    setIsWordCloudRendered(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link href="http://localhost:3000" className="absolute top-4 left-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 hover:text-white transition">
      ← Back
      </Link>
      <div className="w-full max-w-5xl bg-white p-10 shadow-md rounded-lg text-center">
        <div className="flex justify-center mb-6">
          <Image src="/meta_logo.png" alt="Meta Logo" width={120} height={120} />
        </div>
        <h1 className="text-5xl font-extrabold text-gray-800 mb-8">Search History Word Cloud</h1>
        <p className="text-gray-600 mb-6">
          Upload your <b>word_or_phrase_searches.json</b> file to visualize your search history as a word cloud.
        </p>

        {/* Meta "Don't have your data?" link */}
        <div className="flex items-center justify-center mb-6">
          <Link href="https://www.meta.com/help/quest/articles/accounts/privacy-information-and-settings/view-your-information-and-download-your-information/" target="_blank" rel="noopener noreferrer">
            <p className="text-sm text-gray-800 hover:underline">Don't have your Meta data?</p>
          </Link>
        </div>

        {/* File Upload */}
        <div className="flex justify-center mb-6">
          <label className="block">
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="cursor-pointer px-8 py-3 text-white bg-gray-500 rounded-full shadow-sm hover:bg-gray-600 transition">
              Upload JSON
            </div>
          </label>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="text-red-500 mb-4">
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Loading spinner */}
        {isLoading && (
          <div className="flex justify-center items-center mt-4">
            <ClipLoader color="#007bff" size={150} />
            <p className="text-lg text-gray-700 ml-4">Loading, please wait...</p>
          </div>
        )}

        {/* Word Cloud section */}
        {!isLoading && wordData.length > 0 && (
          <div className="mt-8">
            <WordCloud
              words={wordData}
              options={options}
              callbacks={{
                onWordCloudUpdate: handleWordCloudRendered,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHistoryVisualizer;
