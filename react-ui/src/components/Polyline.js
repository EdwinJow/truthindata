import { PureComponent } from 'react';

class Polyline extends PureComponent {
    componentWillUpdate() {
        this.line.setMap(null)
    }

    componentWillUnmount() {
        this.line.setMap(null)
    }

    getPaths() {
        const polylines = this.props.polylines;
        return [
            polylines
        ];
    }

    render() {

        // const Polyline = this.props.maps.Polyline

        // const renderedPolyline = this.renderPolyline()
        // const paths = { path: this.getPaths() }

        // this.line = new Polyline(Object.assign({}, renderedPolyline, paths))

        // this.line.setMap(this.props.map)
        console.log(this.props);
        return null;
    }

    renderPolyline() {
        return null;
    }
}

export default Polyline;