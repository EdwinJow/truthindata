const google = {
    maps: {
        Map: function(){
            return{
                setOptions: jest.fn()
            }
        },
        Polygon: jest.fn(),
        Marker: function(){
            return{
                setMap: jest.fn()
            }
        },
        event: {
            addListener: jest.fn()
        }
    }
}

global.google = google;