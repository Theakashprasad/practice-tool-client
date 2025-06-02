import React from 'react';

const Calendar = () => {
    return (
        <div className="p-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Calendar</h1>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="grid grid-cols-7 gap-4">
                        {/* Calendar Header */}
                        <div className="col-span-7 grid grid-cols-7 gap-4 mb-4">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-300">
                                    {day}
                                </div>
                            ))}
                        </div>
                        
                        {/* Calendar Days */}
                        {Array.from({ length: 35 }).map((_, index) => (
                            <div key={index} className="h-32 border border-gray-200 dark:border-gray-700 rounded p-2">
                                <div className="text-sm text-gray-500 dark:text-gray-400">{index + 1}</div>
                                {index === 15 && (
                                    <div className="mt-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-1 rounded">
                                        Team Meeting
                                    </div>
                                )}
                                {index === 20 && (
                                    <div className="mt-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-1 rounded">
                                        Project Deadline
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calendar; 