import React from 'react';
import ReactDOM from 'react-dom';
import Layout from '../shared/Layout.js';
import RealEstateTracker from '../components/RealEstateTracker.js';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import {
    withGoogleMap,
    GoogleMap,
    Polygon,
    Marker,
} from "react-google-maps";

let wrapper;

const SimpleMapExampleGoogleMap = withGoogleMap(props => (
    <GoogleMap
        defaultZoom={7}
        defaultCenter={{ lat: 33.453566, lng: -112.069103 }}
    >
    </GoogleMap>
));

const mountWrapper = (() => {
    return wrapper = mount(
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
});

describe('<RealEstateTracker />', () => {
    it('calls componentDidMount', () => {
        sinon.spy(RealEstateTracker.prototype, 'componentDidMount');
        mountWrapper();
        expect(RealEstateTracker.prototype.componentDidMount.calledOnce).toEqual(true);
    });

    it('changes date state correctly', () => {
        const wrapper = shallow(<RealEstateTracker />);

        wrapper.instance().handleStartDateChange(1,2,'2011-09');
        expect(wrapper.instance().state.startDate).toEqual('2011-09');
    });

    it('opens closes and sets modal state', () => {
        const wrapper = shallow(<RealEstateTracker />);

        wrapper.instance().handleModalOpen('This is a label', 'This is some body text')

        expect(wrapper.instance().state.modalOpen).toBe(true);
        expect(wrapper.instance().state.modalTitle).toEqual('This is a label');
        expect(wrapper.instance().state.modalBody).toEqual('This is some body text');

        wrapper.instance().handleModalClose();

        expect(wrapper.instance().state.modalOpen).toBe(false);
    });
});