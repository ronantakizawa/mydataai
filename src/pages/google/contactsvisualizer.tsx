import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Contact {
  name?: string;
  email?: string;
  phone?: string;
}

const ContactsVisualizer = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Parse VCF content and extract contacts
  const parseVCF = (vcfData: string) => {
    const vCards = vcfData.split('BEGIN:VCARD').slice(1); // Split by "BEGIN:VCARD"

    const parsedContacts = vCards.map((vCard) => {
      const contact: Contact = {};
      const lines = vCard.split(/\r?\n/); // Handle different line endings

      lines.forEach((line) => {
        if (line.startsWith('FN:')) {
          contact.name = line.replace('FN:', '').trim();
        } else if (line.includes('EMAIL')) {
          const emailMatch = line.match(/EMAIL.*:(.*)/);
          if (emailMatch) {
            contact.email = emailMatch[1]?.trim();
          }
        } else if (line.includes('TEL')) {
          const phoneMatch = line.match(/TEL.*:(.*)/);
          if (phoneMatch) {
            contact.phone = phoneMatch[1]?.trim();
          }
        }
      });

      return contact;
    });

    setContacts(parsedContacts);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const vcfData = e.target?.result as string;
        parseVCF(vcfData);
      };
      reader.readAsText(file);
    }
  };

  // Function to export the table data as a CSV file
  const exportToCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Name,Email,Phone']
        .concat(
          contacts.map(
            (contact) => `${contact.name},${contact.email},${contact.phone}`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'contacts.csv');
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Link href="http://localhost:3000" className="absolute top-4 left-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 hover:text-white transition">
      ← Back
      </Link>
      <div className="w-full max-w-5xl space-y-8"> {/* Adjust width to ensure more space */}
        <div className="bg-white shadow-md rounded-lg p-8">
          {/* Google Logo and Link */}
          <div className="flex flex-col items-center mb-8">
            <Image src="/google_logo.png" alt="Google Logo" width={120} height={120} />
            <Link href="https://takeout.google.com" target="_blank" rel="noopener noreferrer">
              <p className="text-sm text-gray-600 hover:underline mt-2">{`Don't have your Google data?`}</p>
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 text-center mb-6">Google Contacts Visualizer</h1>
          <p className="text-gray-600 text-center mb-6">
            Upload your <code>.vcf</code> file to visualize the contacts.
          </p>

          <div className="flex justify-center mb-6">
            <label className="block">
              <input
                type="file"
                accept=".vcf"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-500 file:text-white hover:file:bg-gray-600 cursor-pointer"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {contacts.length > 0 && (
            <>
              {/* Export Button */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600"
                >
                  Export as CSV
                </button>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto"> {/* Allow horizontal scrolling */}
                <table className="min-w-full table-auto bg-white shadow-lg rounded-lg">
                  <thead className="bg-gray-500 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold min-w-[150px]">Name</th>
                      <th className="px-6 py-3 text-left font-semibold min-w-[200px]">Email</th>
                      <th className="px-6 py-3 text-left font-semibold min-w-[150px]">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {contacts.map((contact, index) => (
                      <tr
                        key={index}
                        className={`border-t hover:bg-gray-100 ${
                          index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        }`}
                      >
                        <td className="px-6 py-4">{contact.name || 'No Name'}</td>
                        <td className="px-6 py-4">{contact.email || 'No Email'}</td>
                        <td className="px-6 py-4">{contact.phone || 'No Phone'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactsVisualizer;
