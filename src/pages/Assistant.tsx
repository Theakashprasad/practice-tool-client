import React from 'react';

const Assistant = () => {
    const tasks = [
        { id: 1, title: 'Review Project Documentation', status: 'Pending', priority: 'High' },
        { id: 2, title: 'Schedule Team Meeting', status: 'Completed', priority: 'Medium' },
        { id: 3, title: 'Update Client Reports', status: 'In Progress', priority: 'High' },
        { id: 4, title: 'Prepare Presentation', status: 'Pending', priority: 'Medium' },
    ];

    return (
        <div className="p-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Assistant Dashboard</h1>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm">Total Tasks</h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm">Completed</h3>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">12</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm">In Progress</h3>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">8</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm">Pending</h3>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">4</p>
                    </div>
                </div>

                {/* Tasks List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Tasks</h2>
                    </div>
                    <div className="p-4">
                        <div className="space-y-4">
                            {tasks.map((task) => (
                                <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Priority: {task.priority}</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            task.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                        }`}>
                                            {task.status}
                                        </span>
                                        <button className="text-primary hover:text-primary-dark">View Details</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button className="p-4 bg-primary text-white rounded-lg hover:bg-primary-dark">
                            Add New Task
                        </button>
                        <button className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            Schedule Meeting
                        </button>
                        <button className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Send Report
                        </button>
                        <button className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                            Create Note
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Assistant; 