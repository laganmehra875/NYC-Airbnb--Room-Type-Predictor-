from pydantic import BaseModel, Field
import pandas as pd
from fastapi import FastAPI
from fastapi.responses import FileResponse
import joblib
from fastapi.middleware.cors import CORSMiddleware


app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],

)



COLUMNS=['latitude','longitude','price','minimum_nights','number_of_reviews','reviews_per_month',
        'calculated_host_listings_count','availability_365','neighbourhood_group','neighbourhood']

model=joblib.load("Model_Pipeline.pkl") 
## pydantic Model=the input validation 
class Feature(BaseModel):
    latitude:float=Field(...,ge=-90,le=90,description="Latitude must br between -90 and 90")
    longitude:float=Field(...,ge=-180,le=180,description="Longitude coordinate")
    price:float=Field(...,gt=0,description="Price per night, must be greater than 0 ")
    minimum_nights:int=Field(...,ge=1,le=365,description="Minimum nights required for booking")
    number_of_reviews:int=Field(...,ge=0,description="Total number of reviews")
    reviews_per_month:float=Field(...,ge=0,description="Average reviews per month")
    calculated_host_listings_count:int=Field(...,ge=0,description="Number of listing by this host")
    availability_365:int=Field(...,ge=0,le=365,description="Days available out of 365")
    neighbourhood_group:str=Field(...,min_length=1,description="Borough or neighbourhood group")
    neighbourhood:str=Field(...,min_length=1,description="Specific neighbourhood name")






@app.get("/")
def read_index():
    return FileResponse("index.html")

@app.get("/style.css")
def read_css():
    return FileResponse("style.css")

@app.get("/script.js")
def read_js():
    return FileResponse("script.js")

@app.get("/newyork.jpeg")
def read_image():
    return FileResponse("newyork.jpeg")


@app.post('/predict')
def predict(features:Feature):
    try:
        # Notice the brackets [] around features.model_dump() so it creates a single row
        row=pd.DataFrame([features.model_dump()],columns=COLUMNS)

        prediction=model.predict(row)
        
        try:
            probability=model.predict_proba(row)
            prob_list = probability.tolist()[0] if len(probability) > 0 else probability.tolist()
        except AttributeError:
            prob_list = []

        return{
            "Predicted_room_type":prediction.tolist()[0] if len(prediction) > 0 else prediction.tolist(),
            "Probability": prob_list
        }
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")



