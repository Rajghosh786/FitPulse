import React, { useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const GymFinder = () => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedGym, setSelectedGym] = useState(null);
  const [manualLocation, setManualLocation] = useState(null);
  const [tempLocation, setTempLocation] = useState(null);

  const getLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setManualLocation({ lat: latitude, lng: longitude });
        setTempLocation({ lat: latitude, lng: longitude });
        setLoading(false);
      },
      () => {
        setError('Location access denied. You can manually pick a location on the map.');
        setLoading(false);
      }
    );
  };

  const fetchGyms = async (lat, lng) => {
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const radius = 5000;

    const query = `
      [out:json];
      (
        node["leisure"="fitness_centre"](around:${radius},${lat},${lng});
        node["amenity"="gym"](around:${radius},${lat},${lng});
      );
      out body;
    `;

    try {
      setLoading(true);
      const response = await fetch(overpassUrl, {
        method: 'POST',
        body: query,
      });
      const data = await response.json();

      const gymData = data.elements.map((el) => ({
        name: el.tags?.name || 'Unnamed Gym',
        lat: el.lat,
        lng: el.lon,
        tags: el.tags || {},
      }));

      setGyms(gymData);
      setError('');
    } catch (err) {
      setError('Failed to fetch gyms.');
    } finally {
      setLoading(false);
    }
  };

  const openGoogleMaps = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const LocationPicker = () => {
    useMapEvents({
      click(e) {
        setTempLocation({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });
      },
    });
    return null;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Find Nearby Gyms (via OpenStreetMap)</h1>

      <div className="flex flex-col items-center gap-4 mb-6">
        <button
          onClick={getLocation}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded"
        >
          Use My Location
        </button>

        {tempLocation && (
          <button
            onClick={() => {
              setManualLocation(tempLocation);
              fetchGyms(tempLocation.lat, tempLocation.lng);
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded"
          >
            Lock Location & Find Gyms
          </button>
        )}
      </div>

      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {(!gyms.length || error) && (
        <div className="h-96 mb-6 rounded overflow-hidden">
          <MapContainer
            center={manualLocation || [28.6139, 77.2090]}  // Default to New Delhi
            zoom={13}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationPicker />
            {tempLocation && <Marker position={[tempLocation.lat, tempLocation.lng]} />}
          </MapContainer>
          <p className="text-center text-sm mt-2 text-gray-600">
            Click a point on the map, then press “Lock Location” to find nearby gyms.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {gyms.map((gym, index) => (
          <div
            key={index}
            onClick={() => setSelectedGym(gym)}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer"
          >
            <img
              src={`https://source.unsplash.com/400x200/?gym,fitness,workout&sig=${index}`}
              alt="Gym"
              className="w-full h-40 object-cover rounded-t-lg"
            />
            <div className="p-4">
              <h2 className="text-xl font-bold mb-1">{gym.name}</h2>
              <div className="flex items-center gap-1 mb-2 text-yellow-400">
                {'★'.repeat(4)}
                <span className="text-sm text-gray-600 ml-2">(4.0)</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openGoogleMaps(gym.lat, gym.lng);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
              >
                Open in Google Maps
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* "Search Again" button when gyms are found */}
      {gyms.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={() => {
              setGyms([]);
              setManualLocation(null);
              setTempLocation(null);
              setError('');
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded"
          >
            Search Again
          </button>
        </div>
      )}

      {/* Modal for Gym Details */}
      {selectedGym && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 relative">
            <button
              onClick={() => setSelectedGym(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-2">{selectedGym.name}</h2>
            {selectedGym.tags.operator && (
              <p className="mb-2 text-gray-700">Operator: {selectedGym.tags.operator}</p>
            )}
            <p className="text-gray-600 text-sm mb-4">
              Location: {selectedGym.lat.toFixed(4)}, {selectedGym.lng.toFixed(4)}
            </p>
            <button
              onClick={() => openGoogleMaps(selectedGym.lat, selectedGym.lng)}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
            >
              Go to Google Maps
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymFinder;
