import React from 'react';
import ReactDOM from 'react-dom';
import Layout from '../shared/Layout.js';
import RealEstateGraph from '../components/RealEstateGraph.js';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';

describe('<RealEstateGraph />', () => {
    it('renders without crashing', () => {
        //create fake server
        var server = sinon.fakeServer.create();

        //componentDidMount calls these to start
        server.respondWith('GET', '/price-to-rent-az/dates', '[]');
        server.respondWith('GET', '/price-to-rent-az', '[]');

        const wrapper = mount(<Layout>
                <RealEstateGraph/>
            </Layout>)
    });

    it('changes startDate and endDate state correctly', () => {
        const wrapper = shallow(<RealEstateGraph/>)
        
        let event = {
            target:{
                innerText: '2011-08'
            },
            persist: jest.fn()   
        }

        wrapper.instance().handleDateChange(event, "startDate");
        expect(wrapper.instance().state.startDate).toEqual('2011-08');

        wrapper.instance().handleDateChange(event, "endDate");
        expect(wrapper.instance().state.endDate).toEqual('2011-08');
    });
});