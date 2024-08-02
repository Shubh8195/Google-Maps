import React, { useState, useEffect, useRef } from "react";

const GoogleAutocomplete = () => {
  const [country, setCountry] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hotel, setHotel] = useState("");
  const [airport, setAirport] = useState("");

  const countryInputRef = useRef(null);
  const hotelInputRef = useRef(null);
  const placesService = useRef(null);

  useEffect(() => {
    if (window.google) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        countryInputRef.current,
        {
          types: ["(regions)"],
        }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const location = place.geometry.location;
          setSelectedCountry({
            lat: location.lat(),
            lng: location.lng(),
            countryCode:
              place.address_components[place.address_components.length - 1][
                "short_name"
              ],
          });
          setCountry(place.formatted_address);
          setHotel("");
          setAirport("");
        }
      });
    }
  }, []);

  useEffect(() => {
    if (selectedCountry && window.google) {
      const map = new window.google.maps.Map(document.createElement("div"));
      placesService.current = new window.google.maps.places.PlacesService(map);

      const hotelAutocomplete = new window.google.maps.places.Autocomplete(
        hotelInputRef.current,
        {
          types: ["establishment"],
          bounds: new window.google.maps.LatLngBounds(
            new window.google.maps.LatLng(
              selectedCountry.lat - 10,
              selectedCountry.lng - 10
            ),
            new window.google.maps.LatLng(
              selectedCountry.lat + 10,
              selectedCountry.lng + 10
            )
          ),
          componentRestrictions: { country: selectedCountry.countryCode },
          strictBounds: true,
        }
      );

      hotelAutocomplete.addListener("place_changed", () => {
        const place = hotelAutocomplete.getPlace();
        if (place.geometry) {
          setHotel(place.name);
          findNearestAirport(
            place.geometry.location.lat(),
            place.geometry.location.lng()
          );
        }
      });
    }
  }, [selectedCountry]);

  const findNearestAirport = (lat, lng) => {
    if (placesService.current) {
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
  };

  return (
    <div>
      <div>
        <h2>Select Country</h2>
        <input
          type="text"
          ref={countryInputRef}
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Search for a country"
        />
      </div>

      {selectedCountry && (
        <div>
          <h2>Select Hotel</h2>
          <input
            type="text"
            ref={hotelInputRef}
            value={hotel}
            onChange={(e) => setHotel(e.target.value)}
            placeholder="Search for a hotel"
          />
        </div>
      )}

      {airport && (
        <div>
          <h2>Nearest Airport</h2>
          <p>{airport}</p>
        </div>
      )}
    </div>
  );
};

export default GoogleAutocomplete;
