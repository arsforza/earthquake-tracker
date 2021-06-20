import { Component, AfterViewInit, Input } from '@angular/core';
import { Feature, Geometry } from 'geojson';
import * as L from 'leaflet';
import { EarthquakesService } from '../../services/earthquakes.service';
import { Point } from 'geojson';

const getColor = (mag: number) => {
  return (
    mag >= 8 ? "#7f0000":
    mag >= 7 ? "#b71c1c":
    mag >= 6 ? "#e64a19":
    mag >= 5 ? "#ff7d47":
    mag >= 4 ? "#fbc02d":
               "#fff263"
  );
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
  map: any;
  platesLayer: any;

  eqMinorLayer: any;
  eqLightLayer: any;
  eqModerateLayer: any;
  eqStrongLayer: any;
  eqMajorLayer: any;
  eqGreatLayer: any;

  eqCount: number[] = [];

  constructor(private earthquakesService: EarthquakesService) {
  }
  
  ngAfterViewInit(): void {
    this.initMap();
    this.loadEarthquakes();
    this.loadPlates();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [0, 0],
      zoom: 3,
      worldCopyJump: true
    });

    this.map.createPane('plates');

    const tileLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tiles = L.tileLayer(tileLayerUrl, {	
      maxZoom: 18,
      minZoom: 1,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map); 
  }

  loadEarthquakes() {
    const eqCircle = (feature: Feature<Point, any>) => {
      const { mag } = feature.properties;
      return {
        radius: mag * 1.5,
        weight: 1,
        color: '#383838',
        fillColor: getColor(mag),
        fillOpacity: 0.8
      }
    }

    const pointPopup = (feature: Feature<Geometry, any>) => {
      const { mag, magType, title, time, url } = feature.properties;
      const [ longitude, latitude, depth ] = Object.values(feature.geometry)[Object.keys(feature.geometry).indexOf('coordinates')]
      
      const utcTime = new Date(time).toUTCString();

      return `
        <h3 class="is-size-6 has-text-weight-semibold">${title}<br>
        <small class="is-size-7 is-link"><a href=${url} target:"_blank">More info</a></small></h3>
        <div class="table-container mt-3">
          <table class="table">
            <tr>
              <td class="has-text-weight-semibold">When</td>
              <td>${utcTime}</td>
            </tr>
            <tr>
              <td class="has-text-weight-semibold">Magnitude</td>
              <td>${mag} ${magType}</td>
            </tr>
            <tr>
              <td class="has-text-weight-semibold">Latitude</td>
              <td>${latitude}</td>
            </tr>
            <tr>
              <td class="has-text-weight-semibold">Longitude</td>
              <td>${longitude}</td>
            </tr>
            <tr>
              <td class="has-text-weight-semibold">Depth</td>
              <td>${depth} km</td>
            </tr>
          </table>
        </div>

      `
    }
    
    this.earthquakesService.getSignificantEarthquakes()
    .subscribe((response) => {
      this.eqMinorLayer = L.geoJSON(response, {
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, eqCircle(feature)),
        filter: (feature) => feature.properties.mag < 4,
        onEachFeature: (feature, layer) => layer.bindPopup(pointPopup(feature))
      });
      this.eqCount.push(Object.keys(this.eqMinorLayer._layers).length);
      this.map.addLayer(this.eqMinorLayer);

      this.eqLightLayer = L.geoJSON(response, {
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, eqCircle(feature)),
        filter: (feature) => feature.properties.mag >= 4 && feature.properties.mag < 5,
        onEachFeature: (feature, layer) => layer.bindPopup(pointPopup(feature))
      });
      this.eqCount.push(Object.keys(this.eqLightLayer._layers).length);
      this.map.addLayer(this.eqLightLayer);

      this.eqModerateLayer = L.geoJSON(response, {
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, eqCircle(feature)),
        filter: (feature) => feature.properties.mag >= 5 && feature.properties.mag < 6,
        onEachFeature: (feature, layer) => layer.bindPopup(pointPopup(feature))
      });
      this.eqCount.push(Object.keys(this.eqModerateLayer._layers).length);
      this.map.addLayer(this.eqModerateLayer);

      this.eqStrongLayer = L.geoJSON(response, {
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, eqCircle(feature)),
        filter: (feature) => feature.properties.mag >= 6 && feature.properties.mag < 7,
        onEachFeature: (feature, layer) => layer.bindPopup(pointPopup(feature))
      });
      this.eqCount.push(Object.keys(this.eqStrongLayer._layers).length);
      this.map.addLayer(this.eqStrongLayer);

      this.eqMajorLayer = L.geoJSON(response, {
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, eqCircle(feature)),
        filter: (feature) => feature.properties.mag >= 7 && feature.properties.mag < 8,
        onEachFeature: (feature, layer) => layer.bindPopup(pointPopup(feature))
      });
      this.eqCount.push(Object.keys(this.eqMajorLayer._layers).length);
      this.map.addLayer(this.eqMajorLayer);

      this.eqGreatLayer = L.geoJSON(response, {
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, eqCircle(feature)),
        filter: (feature) => feature.properties.mag >= 8,
        onEachFeature: (feature, layer) => layer.bindPopup(pointPopup(feature))
      });
      this.eqCount.push(Object.keys(this.eqGreatLayer._layers).length);
      this.map.addLayer(this.eqGreatLayer);

      this.addLegend();
    })
  }

  loadPlates() {
    this.earthquakesService.getTectonicPlates()
    .subscribe((response) => {
      this.platesLayer = L.geoJSON(response, {
        style: {
          weight: 1,
          color: '#304ffe'
        },
        pane: 'plates'
      });

      this.map.addLayer(this.platesLayer);
    })

  }

  showPlates(show: boolean) {
    show
    ? this.map.addLayer(this.platesLayer)
    : this.map.removeLayer(this.platesLayer);
  }

  showMinor(show: boolean) {
    show
    ? this.map.addLayer(this.eqMinorLayer)
    : this.map.removeLayer(this.eqMinorLayer);
  }

  showLight(show: boolean) {
    show
    ? this.map.addLayer(this.eqLightLayer)
    : this.map.removeLayer(this.eqLightLayer);
  }
  
  showModerate(show: boolean) {
    show
    ? this.map.addLayer(this.eqModerateLayer)
    : this.map.removeLayer(this.eqModerateLayer);
  }
  
  showStrong(show: boolean) {
    show
    ? this.map.addLayer(this.eqStrongLayer)
    : this.map.removeLayer(this.eqStrongLayer);
  }

  showMajor(show: boolean) {
    show
    ? this.map.addLayer(this.eqMajorLayer)
    : this.map.removeLayer(this.eqMajorLayer);
  }

  showGreat(show: boolean) {
    show
    ? this.map.addLayer(this.eqGreatLayer)
    : this.map.removeLayer(this.eqGreatLayer);
  }

  addLegend() {
    const legend = new L.Control({position: 'bottomleft'});
    const counter = this.eqCount;

    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend'),
        grades = [2,3,4,5,6,7],
        labels = ["Minor | M < 4","Light | M 4-5","Moderate | M 5-6","Strong | M 6-7","Major | M 7-8","Great | M > 8"];
    
        for (let i = 0; i < grades.length; i++) {
          div.innerHTML += `
            <div class="legend-grade">
              <span class="legend-label">${labels[i]} (${counter[i]})</span>
              <span class="legend-color" style="background-color: ${getColor(grades[i] + 1)};"></span><br>
            <div>
          `;
        }
    
        return div;
    };

    legend.addTo(this.map);
  }
}