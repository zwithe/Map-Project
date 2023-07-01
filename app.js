window.onload = async () => {
	const coords = await getCoords()
    console.log(coords)
	userMap.coordinates = coords
    userMap.buildMap()
}
let clicks = 0;
const userMap = {
    coordinates: [],
    business: [],
    map: {},
    markers: [],

    buildMap(){
        
        this.map = L.map('map', {
            center: [this.coordinates[0], this.coordinates[1]],
            zoom: 10,
        });
    
    
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: '13',
        }).addTo(this.map)
		
		const redPin = L.icon({
			iconUrl: './assets/red-pin.png',
			iconSize:     [38, 38], 
			iconAnchor:   [19, 38], 
			popupAnchor:  [0, -38] 
		});
    
        const marker = L.marker([this.coordinates[0], this.coordinates[1]],{icon: redPin})
        marker.addTo(this.map).bindPopup('<p1><b>Your Locaiton</b></p1>').openPopup()
        
    },
    addMarkers() {
		for (var i = 0; i < this.businesses.length; i++) {
			this.markers[i] = L.marker([
				this.businesses[i].latitude,
				this.businesses[i].longitude,
			])
				.addTo(this.map)
				.bindPopup(`<p1>${this.businesses[i].name}</p1>`)
				.openPopup()
		}
	},
	clearMarkers(){
		for (var i = 0; i < this.businesses.length; i++) {
			this.markers[i].removeFrom(this.map)
		}
	}

}


async function getCoords(){
	pos = await new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(resolve, reject)
	})
    return [pos.coords.latitude, pos.coords.longitude]
}
async function getFoursquare(business) {

    
	const options = {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			Authorization: 'fsq3Ct9tDzn2xr5TfeIEYmCOSwM/w6fBZ3CRKAwoCtublo8='
		}
	}

	let limit = 5
	let lat = userMap.coordinates[0]
	let lon = userMap.coordinates[1]
	//let response = await fetch(`https://cors-anywhere.herokuapp.com/https://api.foursquare.com/v3/places/search?&query=${business}&limit=${limit}&ll=${lat}%2C${lon}`, options)
    let response = await fetch(`https://api.foursquare.com/v3/places/search?&query=${business}&limit=${limit}&ll=${lat}%2C${lon}`, options)
	console.log(response);
	let data = await response.text()
	let parsedData = JSON.parse(data)
	let businesses = parsedData.results
	return businesses        
}
function processBusinesses(data){
    let businesses = data.map((element) => {
		let location = {
			name: element.name,
			latitude: element.geocodes.main.latitude,
			longitude: element.geocodes.main.longitude
		};
		return location
	})
	return businesses

}

document.getElementById('submit').addEventListener('click', async (event) => {
    event.preventDefault()
	if(clicks>=1){userMap.clearMarkers()}
    let business = document.getElementById('Businesses').value
    console.log(business)    
    let data = await getFoursquare(business)
    console.log(data)
    userMap.businesses = processBusinesses(data)
    userMap.addMarkers()
	clicks++
})
