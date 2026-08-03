from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

data = {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "price": 150,
    "minimun_nights": 3,
    "number_of_reviews": 45,
    "reviews_of_month": 1.5,
    "calculated_host_listing_count": 2,
    "availability_365": 200,
    "neighbourhood_group": "Manhattan",
    "neighbourhood": "Midtown"
}

response = client.post("/predict", json=data)
print("Status:", response.status_code)
print("Response:", response.text)
