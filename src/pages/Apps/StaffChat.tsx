import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';
import { Message, ChatRoom } from '../../types/chat';
import './StaffChat.css';
import axios from 'axios';

const SOCKET_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3000/api';

const StaffChat: React.FC = () => {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentRoom, setCurrentRoom] = useState<string>('staff-room');
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        // Set up socket event listeners
        newSocket.on('connect', () => {
            console.log('Connected to socket server');
            if (user) {
                newSocket.emit('authenticate', user);
                newSocket.emit('join_room', currentRoom);
            }
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        newSocket.on('new_message', (message: Message) => {
            setMessages(prev => [...prev, message]);
        });

        newSocket.on('room_history', (history: Message[]) => {
            setMessages(history);
        });

        newSocket.on('error', (error: { message: string }) => {
            console.error('Socket error:', error.message);
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    useEffect(() => {
        // Fetch chat rooms
        const fetchChatRooms = async () => {
            try {
                const response = await axios.get(`${API_URL}/chat/rooms`);
                setChatRooms(response.data);
            } catch (error) {
                console.error('Error fetching chat rooms:', error);
            }
        };

        fetchChatRooms();
    }, []);

    console.log("chatrooms",chatRooms);
    

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !user) return;

        const message: Partial<Message> = {
            content: newMessage,
            room_id: currentRoom,
            sender_id: user.id,
            sender: user,
            created_at: new Date()
        };

        socket.emit('send_message', message);
        setNewMessage('');
    };

    const filteredRooms = chatRooms.filter(room => 
        room.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex gap-5 relative sm:h-[calc(100vh_-_150px)] h-full sm:min-h-0">
            <div className="panel p-4 flex-none max-w-xs w-full absolute xl:relative z-10 space-y-4 xl:h-full hidden xl:block overflow-hidden">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="flex-none">
                            <div className="rounded-full h-12 w-12 object-cover bg-primary text-white flex items-center justify-center text-xl font-bold">
                                {user?.email?.[0] || 'U'}
                            </div>
                        </div>
                        <div className="mx-3">
                            <p className="mb-1 font-semibold">{user?.email} {user?.last_name}</p>
                            <p className="text-xs text-white-dark">{user?.level} Member</p>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <input 
                        type="text" 
                        className="form-input peer ltr:pr-9 rtl:pl-9" 
                        placeholder="Search messages..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2 peer-focus:text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>
                </div>

                <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>

                <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
                    {filteredRooms.map((room) => (
                        <div
                            key={room.id}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                currentRoom === room.id ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                            onClick={() => {
                                if (socket) {
                                    socket.emit('leave_room', currentRoom);
                                    socket.emit('join_room', room.id);
                                    setCurrentRoom(room.id);
                                }
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">{room.name || 'Unnamed Room'}</p>
                                    <p className="text-xs opacity-75">
                                        {room.participants?.length || 0} participants
                                    </p>
                                </div>
                                {room.is_private && (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="panel p-0 flex-1">
                <div className="relative h-full">
                    <div className="flex justify-between items-center p-4">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <button type="button" className="xl:hidden hover:text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            </button>
                            <div className="mx-3">
                                <p className="font-semibold">Staff Chat Room</p>
                                <p className="text-white-dark text-xs">Active now</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>

                    <div className="relative h-full sm:h-[calc(100vh_-_300px)] chat-conversation-box overflow-y-auto">
                        <div className="space-y-5 p-4 sm:pb-0 pb-[68px] sm:min-h-[300px] min-h-[400px]">
                            {messages.map((message, index) => (
                                <div key={index}>
                                    <div className={`flex items-start gap-3 ${message.sender_id === user?.id ? 'justify-end' : ''}`}>
                                        <div className={`flex-none ${message.sender_id === user?.id ? 'order-2' : ''}`}>
                                            <div className="rounded-full h-10 w-10 object-cover bg-primary text-white flex items-center justify-center">
                                                {message.sender?.email?.[0] || 'U'}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`dark:bg-gray-800 p-4 py-2 rounded-md ${
                                                        message.sender_id === user?.id
                                                            ? 'ltr:rounded-br-none rtl:rounded-bl-none !bg-primary text-white'
                                                            : 'ltr:rounded-bl-none rtl:rounded-br-none bg-black/10'
                                                    }`}
                                                >
                                                    {message.content}
                                                </div>
                                            </div>
                                            <div className={`text-xs text-white-dark ${message.sender_id === user?.id ? 'ltr:text-right rtl:text-left' : ''}`}>
                                                {message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <div className="p-4 absolute bottom-0 left-0 w-full">
                        <form onSubmit={handleSendMessage} className="sm:flex w-full space-x-3 rtl:space-x-reverse items-center">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    className="form-input rounded-full border-0 bg-[#f4f4f4] px-12 focus:outline-none py-2"
                                    placeholder="Type a message"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="submit" className="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 hover:text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffChat;
