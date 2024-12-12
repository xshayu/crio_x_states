import { useState, useEffect, ChangeEvent } from 'react'
import './App.css'

const NEXT_TYPE = {
  'country': 'state',
  'state': 'city',
  'city': undefined
} as const;
type LocationType = keyof typeof NEXT_TYPE;
type LocationState = Record<LocationType, string | undefined>;

function App() {

  const [location, setLocation] = useState<LocationState>({ country: undefined, state: undefined, city: undefined});
  const [options, setOptions] = useState<Record<LocationType, string[]>>({ country: [], state: [], city: [] });
  const [error, setError] = useState<string>('');

  const fetchLocationOptions = async (type: 'country' | 'state' | 'city' = 'country', thisLocation: LocationState = location) => {
    try {
      let api = 'https://crio-location-selector.onrender.com/countries';
      if (type == 'state' && thisLocation.country?.length) api = `https://crio-location-selector.onrender.com/country=${thisLocation.country}/states`;
      else if (type == 'city' && thisLocation.state?.length) api = `https://crio-location-selector.onrender.com/country=${thisLocation.country}/state=${thisLocation.state}/cities`;

      const response = await fetch(api);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: string[] = await response.json();

      const nextType = NEXT_TYPE[type];
      setOptions(prev => ({
        ...prev,
        [type]: data,
        ...(nextType ? { [nextType]: [] } : {})
      }));
      
    } catch (error) {
      const errorMessage = `Error fetching data: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMessage);
      setError(errorMessage);
    }
  };

  useEffect(() => {
    fetchLocationOptions();
  }, []);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>, type: 'country' | 'state' | 'city' = 'country') => {
    const value = event.target.value;
    const newLocation = {...location, [type]: value};

    if (NEXT_TYPE[type]) {
      if (NEXT_TYPE[type] == 'state') newLocation.city = undefined; // resetting fields
      newLocation[NEXT_TYPE[type]] = undefined; // resetting fields
      fetchLocationOptions(NEXT_TYPE[type], newLocation);
    }

    setLocation(newLocation);
  };

  return (
    <>
      <h1 style={{textAlign: 'center'}}>Select Location</h1>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '10px'
        }}
      >
        <select 
          value={location.country || ''} 
          onChange={(e) => handleSelectChange(e, 'country')}
          disabled={options.country.length === 0}
        >
          <option value="">Select Country</option>
          {options.country.map((country) => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>

        <select 
          value={location.state || ''} 
          onChange={(e) => handleSelectChange(e, 'state')}
          disabled={!location.country || options.state.length === 0}
        >
          <option value="">Select State</option>
          {options.state.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>

        <select 
          value={location.city || ''} 
          onChange={(e) => handleSelectChange(e, 'city')}
          disabled={!location.state || options.city.length === 0}
        >
          <option value="">Select City</option>
          {options.city.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {location.city &&
        <b>
          You selected {location.city}, {location.state}, {location.country}
        </b>
      }
    </>
  )
}

export default App
