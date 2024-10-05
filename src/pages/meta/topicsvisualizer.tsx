import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { ClipLoader } from 'react-spinners';
import { getEmbedding, EmbeddingIndex } from 'client-vector-search';
import Image from 'next/image';
import Link from 'next/link';
import { TopicData, Topic, GraphData } from '../../types/types'; // Adjust path as necessary

// Dynamically load the graph component
const ForceGraph2D = dynamic(() => import('react-force-graph').then(mod => mod.ForceGraph2D), { ssr: false });

const TopicsVisualizer = () => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [index, setIndex] = useState<EmbeddingIndex | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const forceGraphRef = useRef<any>(null); // Ref for the ForceGraph2D component

  // Initialize the embedding model and index when the component mounts
  useEffect(() => {
    const initializeEmbeddingIndex = async () => {
      try {
        const initialObjects: { id: number, name: string, embedding: number[] }[] = [];
        const newIndex = new EmbeddingIndex(initialObjects); // Empty index initially
        setIndex(newIndex);
      } catch (error) {
        console.error('Error initializing embedding index:', error);
      }
    };
    initializeEmbeddingIndex();
  }, []);

  // Apply d3 force settings after the graph renders
  useEffect(() => {
    if (forceGraphRef.current && graphData) {
      forceGraphRef.current.d3Force('link').distance(250); // Set link distance
      forceGraphRef.current.d3Force('charge').strength(-700); // Set charge strength
      forceGraphRef.current.d3Force('collide').radius(30); // Apply collision force
    }
  }, [graphData]);

  // Helper function to validate the structure of the uploaded JSON file
  const validateJsonData = (data: TopicData): boolean => {
    if (!data.topics_your_topics || !Array.isArray(data.topics_your_topics)) {
      return false;
    }

    return data.topics_your_topics.every((item: Topic) => {
      const stringMapData = item.string_map_data;
      return stringMapData && stringMapData.Name && typeof stringMapData.Name.value === 'string';
    });
  };

  // Helper function to generate nodes and links from the uploaded data
  const generateGraphData = async (data: TopicData) => {
    if (!index) return;
    setIsLoading(true);

    const nodes: { id: string }[] = [];
    const links: { source: string; target: string }[] = [];

    const topics = data.topics_your_topics.map((item: Topic, idx: number) => ({
      id: idx + 1,
      name: item.string_map_data.Name.value,
    }));

    for (const topic of topics) {
      try {
        const embedding = await getEmbedding(topic.name);
        index.add({ id: topic.id, name: topic.name, embedding });
        nodes.push({ id: topic.name });
      } catch (error) {
        console.error(`Error generating embedding for topic: ${topic.name}`, error);
      }
    }

    for (const topic of topics) {
      try {
        const queryEmbedding = await getEmbedding(topic.name);
        const results = await index.search(queryEmbedding, { topK: 5 });

        results.forEach((result) => {
          if (result.object.name && topic.name && result.similarity < 1) {
            links.push({ source: topic.name, target: result.object.name });
          }
        });
      } catch (error) {
        console.error(`Error searching for similar topics for: ${topic.name}`, error);
      }
    }

    setGraphData({ nodes, links });
    setIsLoading(false);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setErrorMessage(null);
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const jsonData: TopicData = JSON.parse(e.target?.result as string);
          if (validateJsonData(jsonData)) {
            generateGraphData(jsonData);
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Link href="http://localhost:3000" className="absolute top-4 left-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition">
        ← Back
      </Link>

      <div className="w-full max-w-5xl bg-white p-10 shadow-md rounded-lg text-center">
        <div className="flex flex-col items-center mb-8">
          <Image src="/meta_logo.png" alt="Meta Logo" width={120} height={120} className="mb-4" />
          <h1 className="text-5xl font-extrabold text-gray-800 mb-8">Meta Topics Visualizer</h1>
          <p className="text-gray-600 mb-6">Upload your <b>preferences/your_topics/your_topics.json</b> file.</p>
          <Link href="https://www.meta.com/help/quest/articles/accounts/privacy-information-and-settings/view-your-information-and-download-your-information/" target="_blank" rel="noopener noreferrer">
            <p className="text-sm text-blue-600 hover:underline">{`Don't have your Meta data?`}</p>
          </Link>
        </div>

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

        {errorMessage && (
          <div className="text-red-500 mb-4">
            <p>{errorMessage}</p>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center mt-4">
            <ClipLoader color="#6c757d" size={150} />
            <p className="text-lg text-gray-700 ml-4">Loading, please wait...</p>
          </div>
        )}

        {!isLoading && graphData && (
          <div className="mt-8 overflow-scroll" style={{ width: '100%', height: '700px' }}>
            <ForceGraph2D
              ref={forceGraphRef} // Use the ref here
              graphData={graphData}
              linkColor={() => '#6c757d'}
              nodeAutoColorBy="id"
              width={900}
              height={700}
              d3VelocityDecay={0.9} // Adjusts the velocity decay for forces
              nodeCanvasObject={(node, ctx, globalScale) => {
                const label = node.id;
                const fontSize = Math.max(6 / globalScale, 6);
                const radius = Math.max(5 + Math.log(node.val || 1), 5);

                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.fillStyle = '#6c757d';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const textOffsetY = radius + fontSize + 50;
                ctx.fillText(label as string, node.x!, node.y! - textOffsetY);

                ctx.beginPath();
                ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI, false);
                ctx.fillStyle = `rgba(108, 117, 125, ${0.7 + Math.random() * 0.3})`;
                ctx.fill();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicsVisualizer;
