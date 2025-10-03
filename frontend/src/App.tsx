function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Project Management
          </h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-xl text-gray-700">Frontend Setup Complete</h2>
          <p className="mt-2 text-gray-500">
            React 19.1.1 + TypeScript 5.9 + Vite 7.0 + Tailwind CSS 3.4.11
          </p>
          <button className="mt-4 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors">
            Primary Button (#ff8204)
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
