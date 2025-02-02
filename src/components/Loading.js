const Loading = () => {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 border-t-4 border-orange-500 border-solid rounded-full animate-spin"></div>
            <span className="text-xl text-gray-700">Loading...</span>
          </div>
        </div>
      </div>
    );
  };
  
  export default Loading;