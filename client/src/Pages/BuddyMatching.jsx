import React, { useState } from 'react';

function BuddyMatching() {
  const [matches] = useState([
    { name: 'John Doe', workout: 'Running', location: 'New York' },
    { name: 'Jane Smith', workout: 'Yoga', location: 'California' },
    { name: 'Michael Brown', workout: 'Weightlifting', location: 'Texas' },
  ]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-6">Find Workout Buddies</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold">{match.name}</h3>
            <p className="text-gray-700">Workout: {match.workout}</p>
            <p className="text-gray-700">Location: {match.location}</p>
            <button className="mt-4 bg-blue-500 text-white p-2 rounded">Message</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BuddyMatching;
