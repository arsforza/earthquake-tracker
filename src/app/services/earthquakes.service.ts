import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { USGSResponse } from '../USGSResponse';
import { GeoJSON } from 'geojson';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
}

@Injectable({
  providedIn: 'root'
})
export class EarthquakesService {
  private significantUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson';
  private allUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';
  private over45Url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson'
  private platesUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';

  constructor(private http:HttpClient) { }

  getSignificantEarthquakes() {
    return this.http.get<GeoJSON>(this.allUrl);
  }

  getTectonicPlates() {
    return this.http.get<GeoJSON>(this.platesUrl);
  }
}
