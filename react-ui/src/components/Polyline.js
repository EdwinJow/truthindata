import { PureComponent } from 'react';

class Polyline extends PureComponent {
    // componentWillUpdate() {
    //     this.line.setMap(null)
    // }

    // componentWillUnmount() {
    //     this.line.setMap(null)
    // }

    createPolygon(polyConfig){
        const Polygon = this.props.gmaps.Polygon;
        let base = new Polygon();
        let polygon = Object.assign(base, polyConfig);

        polygon.setMap(this.props.map)
        debugger;
    }

    decodePolylines(){
        let polylines = this.props.polylines;
        let len = polylines.length;
        const encoder = this.props.gmaps.geometry.encoding;

        for(var i = 0; i < len; i++){
            let config = {
                paths: encoder.decodePath(polylines[i]),
                strokeColor: 'black',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: 'black',
                fillOpacity: 1
            }
            this.createPolygon(config);
        }
    }

    render() {
        this.decodePolylines();
        return null;
    }
}

export default Polyline;