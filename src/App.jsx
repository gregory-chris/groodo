import React from 'react';
import Layout, { Section, Card } from './components/Layout';

function App() {
  return (
    <Layout>
      <Section 
        title="Welcome to Groodo" 
        description="Your weekly task management app for Sunday-Thursday work schedule"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              📅 Weekly Planning
            </h3>
            <p className="text-gray-600 mb-4">
              Organize your tasks across a Sunday-Thursday work week with intuitive columns and drag-and-drop functionality.
            </p>
            <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
              Learn more →
            </button>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              💾 Auto-Save
            </h3>
            <p className="text-gray-600 mb-4">
              Your tasks are automatically saved to your browser&apos;s local storage. No account needed, your data stays private.
            </p>
            <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
              Privacy info →
            </button>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              📝 Rich Tasks
            </h3>
            <p className="text-gray-600 mb-4">
              Add detailed descriptions with markdown support. Perfect for meeting notes, project details, and task context.
            </p>
            <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
              Try it out →
            </button>
          </Card>
        </div>
      </Section>

      <Section title="Getting Started" className="mt-12">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-blue-900 mb-2">
                Ready to start organizing your week?
              </h4>
              <p className="text-blue-800 mb-4">
                The task board will be available soon. This layout demonstrates the responsive design and component structure for the Groodo weekly task management application.
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Coming Soon
              </button>
            </div>
          </div>
        </Card>
      </Section>
    </Layout>
  );
}

export default App;
