import joblib
import pandas as pd
from pydantic import BaseModel, Field

class Feature(BaseModel):
    latitude:float=Field(...)
    longitude:float=Field(...)
    price:float=Field(...)
    minimun_nights:int=Field(...)
    number_of_reviews:int=Field(...)
    reviews_of_month:float=Field(...)
    calculated_host_listing_count:int=Field(...)
    availability_365:int=Field(...)
    neighbourhood_group:str=Field(...)
    neighbourhood:str=Field(...)

COLUMNS=['latitude','longitude','price','minimun_nights','number_of_reviews','reviews_of_month',
        'calculated_host_listing_count','availability_365','neighbourhood_group','neighbourhood']

model=joblib.load("Model_Pipeline.pkl") 

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

feature = Feature(**data)
row = pd.DataFrame([feature.model_dump()], columns=COLUMNS)
print("Row:")
print(row)

try:
    prediction = model.predict(row)
    print("Prediction:", prediction)
except Exception as e:
    print("Predict error:", type(e), e)

try:
    probability = model.predict_proba(row)
    print("Probability:", probability)
except Exception as e:
    print("Predict_proba error:", type(e), e)
