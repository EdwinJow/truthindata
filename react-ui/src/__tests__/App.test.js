import React from 'react';
import ReactDOM from 'react-dom';
import Layout from '../shared/Layout.js';

it('layout renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Layout />, div);
});

