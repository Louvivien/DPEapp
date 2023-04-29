import React, { useState } from 'react';
import Autosuggest from 'react-autosuggest';



const CitySearch = ({setCity, setPostalCode}) => {
    const [value, setValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const handleChange = (event, { newValue }) => {
        setValue(newValue);
    };

    const handleSuggestionsFetchRequested = ({ value }) => {
        fetch(`https://geo.api.gouv.fr/communes?nom=${value}&fields=codesPostaux&boost=population&limit=5`)
            .then(response => response.json())
            .then(data => {
                let newSuggestions = data.map((item) => {
                    return item.codesPostaux.map((code) => {
                        return { nom: `${item.nom} ${code}`, code: code }
                    })
                })
                setSuggestions(newSuggestions.flat())
            });
    };

    const handleSuggestionsClearRequested = () => {
        setSuggestions([]);
    };

    const handleSelect = (event, { suggestion }) => {
        const [city, postalCode] = suggestion.nom.split(" ");
        setCity(city);
        setPostalCode(postalCode);
    }

    const getSuggestionValue = suggestion => suggestion.nom;

    const renderSuggestion = suggestion => (
        <div>
            {suggestion.nom}
        </div>
    );

    return (
        <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
            onSuggestionsClearRequested={handleSuggestionsClearRequested}
            onSuggestionSelected={handleSelect}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
            inputProps={{
                value,
                onChange: handleChange,
                placeholder: 'Rechercher une ville',
                style:{width: '500px'}
            }}
        />
    );
    }
    
    export default CitySearch;
