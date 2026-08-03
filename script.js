const NEIGHBOURHOODS = ["Allerton", "Arden Heights", "Arrochar", "Arverne", "Astoria", "Bath Beach", "Battery Park City", "Bay Ridge", "Bay Terrace", "Bay Terrace, Staten Island", "Baychester", "Bayside", "Bayswater", "Bedford-Stuyvesant", "Belle Harbor", "Bellerose", "Belmont", "Bensonhurst", "Bergen Beach", "Boerum Hill", "Borough Park", "Breezy Point", "Briarwood", "Brighton Beach", "Bronxdale", "Brooklyn Heights", "Brownsville", "Bull's Head", "Bushwick", "Cambria Heights", "Canarsie", "Carroll Gardens", "Castle Hill", "Castleton Corners", "Chelsea", "Chinatown", "City Island", "Civic Center", "Claremont Village", "Clason Point", "Clifton", "Clinton Hill", "Co-op City", "Cobble Hill", "College Point", "Columbia St", "Concord", "Concourse", "Concourse Village", "Coney Island", "Corona", "Crown Heights", "Cypress Hills", "DUMBO", "Ditmars Steinway", "Dongan Hills", "Douglaston", "Downtown Brooklyn", "Dyker Heights", "East Elmhurst", "East Flatbush", "East Harlem", "East Morrisania", "East New York", "East Village", "Eastchester", "Edenwald", "Edgemere", "Elmhurst", "Eltingville", "Emerson Hill", "Far Rockaway", "Fieldston", "Financial District", "Flatbush", "Flatiron District", "Flatlands", "Flushing", "Fordham", "Forest Hills", "Fort Greene", "Fort Hamilton", "Fresh Meadows", "Glendale", "Gowanus", "Gramercy", "Graniteville", "Grant City", "Gravesend", "Great Kills", "Greenpoint", "Greenwich Village", "Grymes Hill", "Harlem", "Hell's Kitchen", "Highbridge", "Hollis", "Holliswood", "Howard Beach", "Howland Hook", "Huguenot", "Hunts Point", "Inwood", "Jackson Heights", "Jamaica", "Jamaica Estates", "Jamaica Hills", "Kensington", "Kew Gardens", "Kew Gardens Hills", "Kingsbridge", "Kips Bay", "Laurelton", "Lighthouse Hill", "Little Italy", "Little Neck", "Long Island City", "Longwood", "Lower East Side", "Manhattan Beach", "Marble Hill", "Mariners Harbor", "Maspeth", "Melrose", "Middle Village", "Midland Beach", "Midtown", "Midwood", "Mill Basin", "Morningside Heights", "Morris Heights", "Morris Park", "Morrisania", "Mott Haven", "Mount Eden", "Mount Hope", "Murray Hill", "Navy Yard", "Neponsit", "New Brighton", "New Dorp", "New Dorp Beach", "New Springville", "NoHo", "Nolita", "North Riverdale", "Norwood", "Oakwood", "Olinville", "Ozone Park", "Park Slope", "Parkchester", "Pelham Bay", "Pelham Gardens", "Port Morris", "Port Richmond", "Prince's Bay", "Prospect Heights", "Prospect-Lefferts Gardens", "Queens Village", "Randall Manor", "Red Hook", "Rego Park", "Richmond Hill", "Ridgewood", "Riverdale", "Rockaway Beach", "Roosevelt Island", "Rosebank", "Rosedale", "Rossville", "Schuylerville", "Sea Gate", "Sheepshead Bay", "Shore Acres", "Silver Lake", "SoHo", "Soundview", "South Beach", "South Ozone Park", "South Slope", "Springfield Gardens", "Spuyten Duyvil", "St. Albans", "St. George", "Stapleton", "Stuyvesant Town", "Sunnyside", "Sunset Park", "Theater District", "Throgs Neck", "Todt Hill", "Tompkinsville", "Tottenville", "Tremont", "Tribeca", "Two Bridges", "Unionport", "University Heights", "Upper East Side", "Upper West Side", "Van Nest", "Vinegar Hill", "Wakefield", "Washington Heights", "West Brighton", "West Farms", "West Village", "Westchester Square", "Westerleigh", "Whitestone", "Williamsbridge", "Williamsburg", "Willowbrook", "Windsor Terrace", "Woodhaven", "Woodlawn", "Woodside"];

document.addEventListener("DOMContentLoaded", () => {
    // Populate neighbourhoods
    const neighList = document.getElementById("neighList");
    NEIGHBOURHOODS.forEach((n) => {
        const opt = document.createElement("option");
        opt.value = n;
        neighList.appendChild(opt);
    });

    // Glass Reflection Mouse Tracking
    const glassCard = document.getElementById("glass-card");
    const reflection = document.querySelector(".glass-reflection");
    
    if (glassCard && reflection) {
        glassCard.addEventListener("mousemove", (e) => {
            const rect = glassCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            reflection.style.left = `${x}px`;
            reflection.style.top = `${y}px`;
        });
    }

    const form = document.getElementById("prediction-form");
    const submitBtn = document.getElementById("submit-btn");
    const btnText = document.querySelector(".btn-text");
    const loader = document.querySelector(".loader");
    
    const resultContainer = document.getElementById("result-container");
    const predictedTypeEl = document.getElementById("predicted-type");
    const probabilityFill = document.getElementById("probability-fill");
    const probabilityText = document.getElementById("probability-text");

    const API_URL = "/predict";

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // UI Feedback: Start loading
        btnText.style.display = "none";
        loader.style.display = "block";
        submitBtn.disabled = true;
        
        resultContainer.classList.remove("visible");
        resultContainer.classList.add("hidden");
        probabilityFill.style.width = "0%";

        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            if (key === 'neighbourhood_group' || key === 'neighbourhood') {
                data[key] = value;
            } else if (key === 'minimum_nights' || key === 'number_of_reviews' || key === 'calculated_host_listings_count' || key === 'availability_365') {
                data[key] = parseInt(value, 10);
            } else {
                data[key] = parseFloat(value);
            }
        }

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail?.[0]?.msg || JSON.stringify(errData));
            }

            const result = await response.json();
            const predictedType = result.Predicted_room_type;
            
            let maxProb = 0;
            if (Array.isArray(result.Probability)) {
                maxProb = Math.max(...result.Probability);
            } else if (typeof result.Probability === 'number') {
                maxProb = result.Probability;
            }

            const probabilityPercentage = (maxProb * 100).toFixed(1);

            predictedTypeEl.textContent = predictedType;
            probabilityText.textContent = `${probabilityPercentage}%`;
            
            resultContainer.classList.remove("hidden");
            // Allow display to register before animation
            setTimeout(() => {
                resultContainer.classList.add("visible");
                probabilityFill.style.width = `${probabilityPercentage}%`;
            }, 50);

        } catch (error) {
            console.error("Error:", error);
            alert("Error predicting room type: " + error.message);
        } finally {
            btnText.style.display = "block";
            loader.style.display = "none";
            submitBtn.disabled = false;
        }
    });
});
