
import React, { useState, useEffect } from 'react';
import EngineLayout from '../components/layout/EngineLayout';
import BrainDumpList from '../components/ark/BrainDumpList';
import { Link } from 'react-router-dom';
import { Brain, Plus } from 'lucide-react'; // Assuming lucide-react for icons

// Mock Button component for demonstration if not imported from a UI library.
// In a real application, this would typically be imported from a shared components library.
const Button = ({ children, className = '', ...props }) => (
  <button
    className={`flex items-center justify-center rounded-xl transition-colors duration-200 ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Mock function for creating page URLs.
// In a real application, this might be part of a router utility or context.
const createPageUrl = (pageName) => {
  // Example: transforms 'ArkChat' to '/ark/chat'
  return `/ark/${pageName.toLowerCase().replace('ark', '')}`;
};

export default function YourBrainDumpsPage() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Simulate fetching brain dump entries
  useEffect(() => {
    setIsLoading(true);
    // In a real application, you would fetch data from an API here.
    setTimeout(() => {
      const mockEntries = [
        { id: '1', title: 'First thought', content: 'This is my first brain dump entry.', createdAt: '2023-10-26T10:00:00Z' },
        { id: '2', title: 'Idea for a new project', content: 'A platform for sharing creative writing. It should allow users to write, store, and share their short stories, poems, and novel excerpts.', createdAt: '2023-10-25T14:30:00Z' },
        { id: '3', title: 'Grocery list reminder', content: 'Milk, eggs, bread, coffee, apples, oranges, spinach, chicken breast, rice.', createdAt: '2023-10-24T08:00:00Z' },
        { id: '4', title: 'Dream fragment', content: 'Was flying over a city made of glass. The buildings reflected the moonlight, creating a dazzling, otherworldly landscape. Felt strangely calm.', createdAt: '2023-10-23T22:15:00Z' },
        { id: '5', title: 'Meeting notes summary', content: 'Discussed Q4 strategy. Key points: focus on user engagement, finalize marketing campaign, review budget allocations.', createdAt: '2023-10-22T11:00:00Z' },
        { id: '6', title: 'New recipe idea', content: 'Spicy peanut noodles with tofu and mixed vegetables. Need to experiment with sauce ratios for optimal flavor.', createdAt: '2023-10-21T18:45:00Z' },
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by newest first
      setEntries(mockEntries);
      setIsLoading(false);
    }, 800); // Simulate network delay
  }, []);

  // For the purpose of this task, filteredEntries will simply be the fetched entries.
  // In a full application, this might involve search, filtering, or sorting logic.
  const filteredEntries = entries;

  return (
    <EngineLayout 
      engineType="ARK" 
      currentPageName="YourBrainDumps"
      defaultTool="braindumps"
    >
      <div className="h-full flex flex-col overflow-hidden p-6 md:p-8">
        
        {/* PAGE HEADER */}
        <header className="flex-shrink-0 mb-8 sm:mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-xl">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">Your Brain Dumps</h1>
              <p className="text-orange-300 text-lg">Review and explore your raw thoughts and ideas</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              {filteredEntries.length} brain dumps • Sorted by newest first
            </p>
            <Link to={createPageUrl('ArkChat')}>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3">
                <Plus className="w-4 h-4 mr-2" />
                New Brain Dump
              </Button>
            </Link>
          </div>
        </header>

        {/* MAIN CONTENT - Better max width and centering */}
        <div className="flex-1 overflow-hidden max-w-6xl mx-auto w-full">
          <BrainDumpList 
            entries={filteredEntries}
            isLoading={isLoading}
            onEntrySelect={setSelectedEntry} // This prop is used when an entry is clicked/selected
          />
        </div>
      </div>
    </EngineLayout>
  );
}
