import {
    default as React,
    Component,
} from "react";

import {
    withGoogleMap,
    GoogleMap,
    Polygon,
} from "react-google-maps";

const SimpleMapExampleGoogleMap = withGoogleMap(props => (
        <GoogleMap
            defaultZoom={7}
            defaultCenter={{ lat: 33.453566, lng: -112.069103 }}
        >
        <Polygon
            /*draggable
            editable*/
            strokeColor="#13a168"
            strokeOpacity={0.8}
            strokeWeight={2}
            fillColor="#13a168"
            fillOpacity={2}
            paths={props.paths}
        />
    </GoogleMap>
));

export default class SimpleMapExample extends Component {
    constructor(props) {
        super(props);
        this.state = {
            paths: null
        };
    }

    componentDidMount(){
        debugger;
        const encoder = window.google.maps.geometry.encoding;
        let paths = encoder.decodePath("oqf~Drh}dTs@{mjKewqa@c]eGrrp]pn|CoVpbOz{M|_Bqv@jhLbsExaAngRqfGplLmnCqk@ezJ~lKsYpoEvdC``GytAliBfgAnsGgoCr`@~bCleSklAtwA~`JhlWb|GajAbv@shCdmCjcCpsKgiAjdMaqL`zBbkGj{Gzm@bsHsmBvnHvcAnmC_zC~uE~u@zzF_`Fn_EbiC~{GisBtfFzhCja[qqMbf`@ezE`uI`y@~fDliL~nEaqGtbGpwEfu\{MxtFcmH~lLotEzyIw`OvuRg`HzxAxmAt}Ky|Ix_Mrc@dp@y_IptRk}]~~GmpFb|Fek@|Q~oExeMtuK`yNzuc@|gOp_C|dP~}Qp_EujDnPdoBhmEymCf`AzfDfiGmJ~{SqrE`lEfhFh|AclBft@pvBfsFyeAhcCftBrnFqeB|rI~hLtyMpjGnmBbrPxgIiiDpwHlnEpqGqpJljA`lB`kJuxAbpRrbExyIasGmdBceBrfC}hDlVq~S|aI_rBlEoxCrgFboAhlDcsB~yJtf@fhIfiKtiGxk@ddCffNwhBbsO|~RraKhtCjuGzbJ|_@j_@gkCvzJrjCbjbFehyU");
        this.setState({paths: paths})
    }
    render() {
        return (
            <div className="height-100">
                <SimpleMapExampleGoogleMap
                    containerElement={
                        <div style={{ height: `100%` }} />
                    }
                    mapElement={
                        <div style={{ height: `100%` }} />
                    }
                    paths={this.state.paths}
                />
            </div>
        );
    }
}