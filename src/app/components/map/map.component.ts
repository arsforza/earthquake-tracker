import { Component, AfterViewInit, Input } from '@angular/core';
import { Feature, Geometry } from 'geojson';
import * as L from 'leaflet';
import { EarthquakesService } from '../../services/earthquakes.service';
import { Point } from 'geojson';

const getColor = (mag: number) => {
  return mag >= 8 ? "#C90D1A":
  mag >= 7 ? "#DA3B18":
  mag >= 6 ? "#D76A14":
  mag >= 5 ? "#D49910":
  mag >= 4 ? "#D1C80C":
  "#CEF708";
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

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map); 
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
      const { mag, magType, title, place, time, url } = feature.properties;
      const [ longitude, latitude, depth ] = Object.values(feature.geometry)[Object.keys(feature.geometry).indexOf('coordinates')]
      
      const timeString = new Date(time);
      const utcTime = timeString.toUTCString();

      return `
        <h3>${title}<br>
        <small><a href=${url} target:"_blank">More info</a></small></h3>
        <p><strong>When:</strong> ${timeString}<br>
        <strong>UTC:</strong> ${utcTime}<br>
        <strong>Magnitude:</strong> ${mag} ${magType}<br>
        <strong>Latitude:</strong> ${latitude}<br>
        <strong>Longitude:</strong> ${longitude}<br>
        <strong>Depth:</strong> ${depth} km<br>
        <strong>Where:</strong> ${place}<br></p>
      `
    }
    
    this.earthquakesService.getSignificantEarthquakes()
    .subscribe((response) => {
      this.eqMinorLayer = L.geoJSON(response, {
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, eqCircle(feature)),
        filter: (feature) => feature.properties.mag < 4,
        onEachFeature: (feature, layer) => layer.bindPopup(pointPopup(feature))
      });
      this.eqCount.push(Object.keys(this.eqMinorLayer._layers).length)

      this.eqLightLayer = L.geoJSON(response, {
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, eqCircle(feature)),
        filter: (feature) => feature.properties.mag >= 4 && feature.properties.mag < 5,
        onEachFeature: (feature, layer) => layer.bindPopup(pointPopup(feature))
      });
      this.eqCount.push(Object.keys(this.eqLightLayer._layers).length)

      this.eqModerateLayer = L.geoJSON(response, {
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, eqCircle(feature)),
        filter: (feature) => feature.properties.mag >= 5 && feature.properties.mag < 6,
        onEachFeature: (feature, layer) => layer.bindPopup(pointPopup(feature))
      });
      this.eqCount.push(Object.keys(this.eqModerateLayer._layers).length)

      this.eqStrongLayer = L.geoJSON(response, {
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, eqCircle(feature)),
        filter: (feature) => feature.properties.mag >= 6 && feature.properties.mag < 7,
        onEachFeature: (feature, layer) => layer.bindPopup(pointPopup(feature))
      });
      this.eqCount.push(Object.keys(this.eqStrongLayer._layers).length)

      this.eqMajorLayer = L.geoJSON(response, {
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, eqCircle(feature)),
        filter: (feature) => feature.properties.mag >= 7 && feature.properties.mag < 8,
        onEachFeature: (feature, layer) => layer.bindPopup(pointPopup(feature))
      });
      this.eqCount.push(Object.keys(this.eqMajorLayer._layers).length)

      this.eqGreatLayer = L.geoJSON(response, {
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, eqCircle(feature)),
        filter: (feature) => feature.properties.mag >= 8,
        onEachFeature: (feature, layer) => layer.bindPopup(pointPopup(feature))
      });
      this.eqCount.push(Object.keys(this.eqGreatLayer._layers).length)


      this.map.addLayer(this.eqMinorLayer);
      this.map.addLayer(this.eqLightLayer);
      this.map.addLayer(this.eqModerateLayer);
      this.map.addLayer(this.eqStrongLayer);
      this.map.addLayer(this.eqMajorLayer);
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
          color: '#ff0000'
        },
        pane: 'plates'
      });

      this.map.addLayer(this.platesLayer);
    })

  }

  addLegend() {
    const legend = new L.Control({position: 'bottomleft'});
    const counter = [...this.eqCount];

    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend'),
        grades = [2,3,4,5,6,7],
        labels = ["Minor","Light","Moderate","Strong","Major","Great"];
    
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