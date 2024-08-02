import React, { useState, useEffect, useRef } from "react";

const GoogleAutocomplete = () => {
    const [country, setCountry] = useState("");
    const [countryPredictions, setCountryPredictions] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [hotel, setHotel] = useState("");
    const [hotels, setHotels] = useState([]);
    const [airport, setAirport] = useState();

    const autocompleteService = useRef(null);
    const geocoder = useRef(null);
    const placesService = useRef(null);

    useEffect(() => {
        if (!autocompleteService.current && window.google) {
            autocompleteService.current =
                new window.google.maps.places.AutocompleteService();
            geocoder.current = new window.google.maps.Geocoder();
        }
    }, []);

    useEffect(() => {
        if (selectedCountry && window.google) {
            const map = new window.google.maps.Map(document.createElement("div"));
            placesService.current = new window.google.maps.places.PlacesService(map);
        }
    }, [selectedCountry]);

    const handleCountryChange = (e) => {
        setCountry(e.target.value);
        if (autocompleteService.current) {
            autocompleteService.current.getPlacePredictions(
                { input: e.target.value, types: ["(regions)"] },
                (predictions, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                        setCountryPredictions(predictions);
                    }
                }
            );
        }
    };

    const handleCountrySelect = (prediction) => {
        setCountry(prediction.description);
        setCountryPredictions([]);

        if (geocoder.current) {
            geocoder.current.geocode(
                { placeId: prediction.place_id },
                (results, status) => {
                    if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
                        const location = results[0].geometry.location;
                        const countryCode = results[0].address_components.find(
                            (component) => component.types.includes("country")
                        ).short_name;
                        setSelectedCountry({
                            lat: location.lat(),
                            lng: location.lng(),
                            countryCode,
                        });
                        setHotel("");
                        setHotels([]);
                    }
                }
            );
        }
    };

    const handleHotelChange = (e) => {
        setHotel(e.target.value);
        if (placesService.current && selectedCountry) {
            placesService.current.nearbySearch(
                {
                    location: new window.google.maps.LatLng(
                        selectedCountry.lat,
                        selectedCountry.lng
                    ),
                    radius: 1000000, // 1000 km radius
                    keyword: e.target.value,
                    type: "lodging",
                },
                (results, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                        console.log(results);
                        setHotels(results);
                    }
                }
            );
        }
    };

    const handleHotelSelect = (hotel) => {
        setHotel(hotel.name);
        // console.log(prediction.name);
        findNearestAirport(
            hotel.geometry.location.lat(),
            hotel.geometry.location.lng()
        );
        setAirport();
    };

    function findNearestAirport(lat, lng) {
        if (placesService.current && selectedCountry) {
            placesService.current.nearbySearch(
                {
                    location: new window.google.maps.LatLng(lat, lng),
                    radius: 50 * 1000, // 50 km radius
                    type: "airport",
                },
                (results, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                        setAirport(results[0].name);
                    }
                }
            );
        }
    }
    return (
        <div>
            <div>
                <h2>Select Country</h2>
                <input
                    type="text"
                    value={country}
                    onChange={handleCountryChange}
                    placeholder="Search for a country"
                />
                <ul>
                    {countryPredictions.map((prediction) => (
                        <li
                            key={prediction.place_id}
                            onClick={() => handleCountrySelect(prediction)}
                        >
                            {prediction.description}
                        </li>
                    ))}
                </ul>
            </div>

            {selectedCountry && (
                <div>
                    <h2>Select Hotel</h2>
                    <input
                        type="text"
                        value={hotel}
                        onChange={handleHotelChange}
                        placeholder="Search for a hotel"
                    />
                    <ul>
                        {hotels.map((hotel) => (
                            <li key={hotel.place_id} onClick={() => handleHotelSelect(hotel)}>
                                {hotel.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {airport && <div>{airport}</div>}
        </div>
    );
};

export default GoogleAutocomplete;
