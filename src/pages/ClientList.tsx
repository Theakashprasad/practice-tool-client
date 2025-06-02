import React from 'react';

const ClientList = () => {
    const clients = [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1 234 567 890', status: 'Active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1 234 567 891', status: 'Active' },
        { id: 3, name: 'Robert Johnson', email: 'robert@example.com', phone: '+1 234 567 892', status: 'Inactive' },
        { id: 4, name: 'Emily Davis', email: 'emily@example.com', phone: '+1 234 567 893', status: 'Active' },
        { id: 5, name: 'Michael Wilson', email: 'michael@example.com', phone: '+1 234 567 894', status: 'Active' },
    ];

    return (
        <div className="p-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Client List</h1>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    placeholder="Search clients..."
                                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark">
                                Add New Client
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {clients.map((client) => (
                                    <tr key={client.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{client.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{client.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{client.phone}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                client.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                            <button className="text-primary hover:text-primary-dark mr-3">Edit</button>
                                            <button className="text-red-600 hover:text-red-800">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientList; 