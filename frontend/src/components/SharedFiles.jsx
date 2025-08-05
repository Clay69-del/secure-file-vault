import React from "react";
import { FiCloud, FiUsers, FiShare2, FiFolder } from "react-icons/fi";

const SharedFiles = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <FiCloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shared Files</h1>
              <p className="text-gray-600">
                Files shared with you by other users
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon Message */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShare2 className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Shared Files Coming Soon
            </h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              We're working on file sharing functionality. Soon you'll be able
              to view and manage files that have been shared with you.
            </p>

            {/* Feature Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FiUsers className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  Team Collaboration
                </h3>
                <p className="text-sm text-gray-600">
                  Share files with team members securely
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FiFolder className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  Organized Access
                </h3>
                <p className="text-sm text-gray-600">
                  View shared files in organized folders
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FiShare2 className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  Permission Control
                </h3>
                <p className="text-sm text-gray-600">
                  Control who can view and edit files
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedFiles;
