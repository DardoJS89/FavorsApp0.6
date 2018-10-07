import React, {
  Component
} from 'react';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import ReactDOMServer from 'react-dom/server'
import Popup from './Popup'

export default class Map extends React.Component {
    constructor() {
      super()
      this.state = {
        myFavors: []
      }
      window.map = this
    }
    async componentDidMount() {
      let data;
      let favors;
      const geolocationOptions = {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
      } 
      const mapOptions = {
        container: this.mapContainer,
        style: `mapbox://styles/mapbox/streets-v9`,
        zoom: 12,
        center: [-80.2044, 25.8028]
      }

      data = await axios.get('/favors.json')
      favors = data.data
      this.setState({myFavors: favors})
      mapboxgl.accessToken = 'pk.eyJ1IjoiYW5keXdlaXNzMTk4MiIsImEiOiJIeHpkYVBrIn0.3N03oecxx5TaQz7YLg2HqA'
      await this.createMap(mapOptions, geolocationOptions);
    }


  createMap = (mapOptions, geolocationOptions) => {
    this.map = new mapboxgl.Map(mapOptions);
    const map = this.map;

    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: geolocationOptions,
        trackUserLocation: true
      })
    )
    map.on('load', (event) => {
      this.fetchFavors();
    });
  }

  fetchFavors = async () => {
    const map = this.map;
    const self = this;
    await axios.get(`/favors.json`)
    .then((res) => {
      let newMarkers = res.data 
      newMarkers.features.forEach((favor, i) => {
        var elm = document.createElement('div')
        elm.className = `${favor.properties.category}`
        let popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(ReactDOMServer.renderToStaticMarkup(
          <Popup favor={favor.properties}></Popup>
        ))
        let marker = new mapboxgl.Marker(elm)
        .setLngLat(favor.geometry.coordinates)
        .setPopup(popup);
        marker.addTo(map)
      })
    })
  }

  render() {
    const style = {
      width: '100%',
      height: '500px',
      backgroundColor: 'azure'
    };
    return <div style = {
      style
    }
    ref = {
      el => this.mapContainer = el
    }
    />;
  }

  componentWillUnmount() {
    this.map.remove();
  }
}