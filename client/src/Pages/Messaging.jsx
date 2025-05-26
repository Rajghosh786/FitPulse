import React, { useState } from 'react';

function Messaging() {
  const [messages] = useState([
    { sender: 'John', message: 'Hey, want to join me for a run tomorrow?' },
    { sender: 'Jane', message: 'I found a new yoga video. Check it out!' },
    { sender: 'Michael', message: 'I’m doing a strength workout at the gym, join me!' },
  ]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-6">Messages</h2>
      <div className="space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-lg">
            <p className="font-semibold">{msg.sender}</p>
            <p>{msg.message}</p>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <textarea className="w-full p-2 border border-gray-300 rounded" placeholder="Type a message..."></textarea>
        <button className="mt-2 bg-blue-500 text-white p-2 rounded w-full">Send</button>
      </div>
    </div>
  );
}

export default Messaging;
