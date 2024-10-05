import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ClipLoader } from 'react-spinners';
import { getEmbedding, EmbeddingIndex } from 'client-vector-search';
import Image from 'next/image';
import Link from 'next/link';

// Dynamically load the graph component
const ForceGraph2D = dynamic(() => import('react-force-graph').then(mod => mod.ForceGraph2D), { ssr: false });

interface GraphData {
  nodes: { id: string }[];
  links: { source: string; target: string }[];
}

const TopicsVisualizer = () => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [index, setIndex] = useState<EmbeddingIndex | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State to store error messages

  // Initialize the embedding model and index when the component mounts
  useEffect(() => {
    const initializeEmbeddingIndex = async () => {
      try {
        console.log('Initializing embedding index...');
        const initialObjects: { id: number, name: string, embedding: number[] }[] = [];
        const newIndex = new EmbeddingIndex(initialObjects); // Empty index initially
        setIndex(newIndex);
        console.log('Embedding index initialized.');
      } catch (error) {
        console.error('Error initializing embedding index:', error);
      }
    };
    initializeEmbeddingIndex();
  }, []);

  // Helper function to validate the structure of the uploaded JSON file
  const validateJsonData = (data: any) => {
    if (!data.topics_your_topics || !Array.isArray(data.topics_your_topics)) {
      return false;
    }

    return data.topics_your_topics.every((item: any) => {
      const stringMapData = item.string_map_data;
      return (
        stringMapData &&
        stringMapData.Name &&
        typeof stringMapData.Name.value === 'string'
      );
    });
  };

  // Helper function to generate nodes and links from the uploaded data
  const generateGraphData = async (data: any) => {
    if (!index) return;
    setIsLoading(true); // Show loading modal when file is uploaded

    const nodes: { id: string }[] = [];
    const links: { source: string; target: string }[] = [];

    // Extract topics and generate embeddings
    const topics = data.topics_your_topics.map((item: any, idx: number) => ({
      id: idx + 1,
      name: item.string_map_data.Name.value,
    }));

    console.log('Generating nodes and embeddings...');

    for (let topic of topics) {
      try {
        console.log(`Generating embedding for: ${topic.name}`);
        const embedding = await getEmbedding(topic.name);
        index.add({ id: topic.id, name: topic.name, embedding });
        nodes.push({ id: topic.name });
      } catch (error) {
        console.error(`Error generating embedding for topic: ${topic.name}`, error);
      }
    }

    // Perform the search and generate links based on similarity
    console.log('Generating links between similar topics...');
    for (let topic of topics) {
      try {
        console.log(`Performing search for similar topics for: ${topic.name}`);
        const queryEmbedding = await getEmbedding(topic.name);
        const results = await index.search(queryEmbedding, { topK: 5 }); // Top 5 similar topics

        console.log(`Search results for ${topic.name}:`, results);

        results.forEach((result: any) => {
          if (result.object.name && topic.name && result.similarity < 1) {
            console.log(`Linking ${topic.name} to ${result.object.name}`);
            links.push({ source: topic.name, target: result.object.name });
          } else {
            console.error('Skipping link for self-link or low similarity');
          }
        });
      } catch (error) {
        console.error(`Error searching for similar topics for: ${topic.name}`, error);
      }
    }

    console.log('Links generated:', links);
    setGraphData({ nodes, links });
    setIsLoading(false); // Hide loading modal when graph data is ready
    console.log('Graph data set:', { nodes, links });
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setErrorMessage(null); // Clear previous error messages
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          console.log('File uploaded successfully:', jsonData);

          // Validate the uploaded JSON file before processing
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
      {/* Back button */}
      <Link href="http://localhost:3000" className="absolute top-4 left-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 hover:text-white transition">
      ← Back
      </Link>

      <div className="w-full max-w-5xl bg-white p-10 shadow-md rounded-lg text-center">
        <div className="flex flex-col items-center mb-8">
          <Image src="/meta_logo.png" alt="Meta Logo" width={120} height={120} className="mb-4" />
          <h1 className="text-5xl font-extrabold text-gray-800 mb-8">Meta Topics Visualizer</h1>
          <p className="text-gray-600 mb-6">Upload your <b>preferences/your_topics/your_topics.json</b> file.</p>
          <Link href="https://www.meta.com/help/quest/articles/accounts/privacy-information-and-settings/view-your-information-and-download-your-information/" target="_blank" rel="noopener noreferrer">
            <p className="text-sm text-blue-600 hover:underline">Don't have your Meta data?</p>
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

        {/* Error Message */}
        {errorMessage && (
          <div className="text-red-500 mb-4">
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Loading spinner */}
        {isLoading && (
          <div className="flex justify-center items-center mt-4">
            <ClipLoader color="#6c757d" size={150} /> {/* Grey spinner */}
            <p className="text-lg text-gray-700 ml-4">Loading, please wait...</p>
          </div>
        )}

        {/* Graph section */}
        {!isLoading && graphData && (
          <div className="mt-8 overflow-scroll" style={{ width: '100%', height: '700px' }}>
            <ForceGraph2D
              graphData={graphData}
              linkColor={() => '#6c757d'} // Grey links
              nodeAutoColorBy="id"
              width={900}
              height={700}
              d3Force="link"
              linkDistance={250} // Increase the distance between nodes (further spaced out)
              d3Force="charge"
              chargeStrength={-700} // Stronger repelling force to separate nodes more
              d3Force="collide"
              collisionRadius={30} // Add collision force to prevent overlap and create padding between nodes
              nodeCanvasObject={(node, ctx, globalScale) => {
                const label = node.id;
                const fontSize = Math.max(6 / globalScale, 6);  // Further decrease font size
                const radius = Math.max(5 + Math.log(node.val || 1), 5);  // Dynamically set radius based on node connections

                // Set font properties
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.fillStyle = '#6c757d'; // Grey text color
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Adjust text position to be slightly above the node
                const textOffsetY = radius + fontSize + 50;  // Offset for text to avoid overlap
                ctx.fillText(label as string, node.x!, node.y! - textOffsetY);

                // Draw a small circle for each node (visible point)
                ctx.beginPath();
                ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI, false);
                ctx.fillStyle = `rgba(108, 117, 125, ${0.7 + Math.random() * 0.3})`; // Grey gradient color for nodes
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
