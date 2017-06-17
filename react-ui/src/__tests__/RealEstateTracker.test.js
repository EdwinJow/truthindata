import React from 'react';
import ReactDOM from 'react-dom';
import Layout from '../shared/Layout.js';
import RealEstateTracker from '../components/RealEstateTracker.js';
import sinon from 'sinon';
import { mount } from 'enzyme';
import {
    withGoogleMap,
    GoogleMap,
    Polygon,
    Marker,
} from "react-google-maps";

const SimpleMapExampleGoogleMap = withGoogleMap(props => (
    <GoogleMap
        defaultZoom={7}
        defaultCenter={{ lat: 33.453566, lng: -112.069103 }}
    >
    </GoogleMap>
));

describe('<RealEstateTracker />', () => {
    it('calls componentDidMount', () => {
        sinon.spy(RealEstateTracker.prototype, 'componentDidMount');
        const wrapper = mount(
        <Layout>
            <SimpleMapExampleGoogleMap 
                containerElement={
                    <div style={{ height: `100%` }} />
                }
                mapElement={
                    <div style={{ height: `100%` }} />
                } 
            />
            <RealEstateTracker />
        </Layout>);
        expect(RealEstateTracker.prototype.componentDidMount.calledOnce).toEqual(true);
    });
});