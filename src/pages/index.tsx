import type { NextPage } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';


const DataVisualization3D = dynamic(() => import('../pages/components/DataVisualization3D'), {
  ssr: false
});

const Home: NextPage = () => {

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 relative">
      {/* Fix the top background color by extending it */}
      <div className="absolute inset-0 bg-gray-50 z-[-1]" />

      <div className="max-w-7xl mx-auto"> {/* Adjusted bottom padding */}
        {/* Section with Title, Subtitle, and 3D Graph */}
        <section aria-labelledby="data-visualization" className="mb-8"> {/* Reduced margin-bottom */}
          <div className="relative flex flex-col items-center justify-center mb-4"> {/* Reduced margin-bottom */}
            {/* 3D Data Visualization in a fixed size container */}
            <div className="w-full max-w-6xl h-[400px]"> {/* Graph size is kept larger */}
              <DataVisualization3D />
            </div>

            {/* Title and Subtitle Overlay with Background */}
            <div className="absolute top-0 inset-0 flex flex-col items-center justify-center bg-gray-50 bg-opacity-80 p-2"> {/* Reduced padding */}
              <div className="flex items-center justify-center mb-2"> {/* Reduced margin-bottom */}
                <h1 className="text-6xl font-extrabold text-center text-gray-800">Nosco AI</h1> {/* Increased font size */}
                <Image src="/noscoailogo.png" alt="Nosco AI Logo" width={80} height={80} className="ml-2" /> {/* Larger logo */}
              </div>
              <h5 className="text-xl text-center text-gray-800">Visualize Your Personal Data</h5>
            </div>
          </div>
        </section>

        {/* Google Section */}
        <div className="mb-6"> {/* Reduced margin-bottom */}
          <div className="flex flex-col items-center mb-2"> {/* Reduced margin-bottom */}
            <Image src="/google_logo.png" alt="Google Logo" width={120} height={120} className="mr-2" />
            <Link href="https://takeout.google.com" target="_blank" rel="noopener noreferrer">
              <p className="text-sm text-blue-600 hover:underline mt-1">Download your data</p> {/* Reduced margin-top */}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* Reduced gap between columns */}
            {/* Contacts Visualizer Card */}
            <Link href="google/contactsvisualizer">
              <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer h-full flex flex-col"> {/* Reduced padding */}
                <h3 className="text-xl font-bold text-gray-800 mb-2">Contacts Visualizer</h3> {/* Reduced margin-bottom */}
                <p className="text-gray-600 flex-grow">Visualize and explore your Google contacts data to understand relationships and interactions.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Meta Section */}
        <div>
          <div className="flex flex-col items-center mb-2"> {/* Reduced margin-bottom */}
            <Image src="/meta_logo.png" alt="Meta Logo" width={120} height={120} className="mr-2" />
            <Link href="https://www.meta.com/help/quest/articles/accounts/privacy-information-and-settings/view-your-information-and-download-your-information/" target="_blank" rel="noopener noreferrer">
              <p className="text-sm text-blue-600 hover:underline mt-1">Download your data</p> {/* Reduced margin-top */}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* Reduced gap between columns */}
            {/* Topics Visualizer Card */}
            <Link href="meta/topicsvisualizer">
              <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer h-full flex flex-col"> {/* Reduced padding */}
                <h3 className="text-xl font-bold text-gray-800 mb-2">Topics Visualizer</h3> {/* Reduced margin-bottom */}
                <p className="text-gray-600 flex-grow">Explore and visualize your Meta topics data, discovering insights from your interests.</p>
              </div>
            </Link>

            {/* Search History Visualizer Card */}
            <Link href="meta/searchhistoryvisualizer">
              <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer h-full flex flex-col"> {/* Reduced padding */}
                <h3 className="text-xl font-bold text-gray-800 mb-2">Search History Visualizer</h3> {/* Reduced margin-bottom */}
                <p className="text-gray-600 flex-grow">Visualize your Meta search history with a word cloud.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 text-center py-4"> {/* Footer padding is fine */}
        <p className="text-gray-600">Nosco™</p>
      </footer>
    </div>
  );
};

export default Home;
