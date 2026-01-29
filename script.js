
const state={user:null,spots:[],selected:null,revenue:0};

const hoursDisplay = document.getElementById('hoursDisplay');
const hoursInput = document.getElementById('hours');
const hourPlus = document.getElementById('hourPlus');
const hourMinus = document.getElementById('hourMinus');
const closeParkedInfo = document.getElementById('closeParkedInfo');
const backButton = document.getElementById('backButton');
const parkOutButton = document.getElementById('parkOutButton');
const driverLoginBtn = document.getElementById('driverLoginBtn');
const cabPark = document.getElementById('cabPark');
const cabs = document.getElementById('cabs');


enterBtn.onclick=()=> {
  state.user={capacity:+plan.value};
  initSpots();
  auth.style.display="none";
  app.style.display="block";
  render();
};

driverLoginBtn.onclick = () => {
    window.location.href = 'driver_login.html';
}

hourPlus.onclick = () => {
    let currentHours = parseInt(hoursInput.value);
    currentHours++;
    hoursInput.value = currentHours;
    hoursDisplay.innerText = currentHours;
};

hourMinus.onclick = () => {
    let currentHours = parseInt(hoursInput.value);
    if (currentHours > 1) {
        currentHours--;
        hoursInput.value = currentHours;
        hoursDisplay.innerText = currentHours;
    }
};

backButton.onclick = () => {
    if (state.selected !== null) {
        state.spots[state.selected].status = "free";
        state.selected = null;
    }
    bookModal.style.display = "none";
    render();
};

function initSpots(){
state.spots=Array.from({length:state.user.capacity},(_,i)=>({id:i+1,status:"free"}));
}

function render(){
cap.innerText=state.spots.length;
booked.innerText=state.spots.filter(s=>s.status==="booked").length;
parked.innerText=state.spots.filter(s=>s.status==="parked").length;
cabs.innerText = state.spots.filter(s => s.status === "cab").length;
rev.innerText="₹"+state.revenue;
grid.innerHTML="";
state.spots.forEach((s,i)=>{
    const d=document.createElement("div");
    let classes = "spot " + s.status;
    if (s.expiring) {
        classes += " expiring";
    }
    d.className = classes;
    d.innerText=s.id;
    d.onclick=()=>selectSpot(i);
    grid.appendChild(d);
});
}

function selectSpot(i){
    const spot = state.spots[i];
    if (spot.status === 'parked' || spot.status === 'cab') {
        state.selected = i;
        const parkedAt = new Date(spot.parkedAt);
        const durationInSeconds = (new Date() - parkedAt) / 1000;
        const hours = Math.floor(durationInSeconds / 8);
        const minutes = Math.floor(((durationInSeconds % 8) / 8) * 60);
        parkedTime.innerText = `Parked for ${hours}h and ${minutes}m.`;
        parkedInfoModal.style.display = "flex";
        return;
    }
    if (spot.status !== "free") return;
    state.spots[i].status = "locked";
    state.selected = i;
    bookModal.style.display = "flex";
    render();
}

goPay.onclick=()=> {
amt.innerText=hours.value*50;
bookModal.style.display="none";
payModal.style.display="flex";
};

payNow.onclick=()=> {
const spot = state.spots[state.selected];
spot.status= "booked";
spot.approxHours = parseInt(hours.value);
state.revenue+=hours.value*50;
payModal.style.display="none";
render();
};

onsitePark.onclick=()=> {
    const spot = state.spots[state.selected];
    spot.status = "parked";
    spot.parkedAt = new Date().toISOString();
    spot.billedHours = 0;
    spot.approxHours = parseInt(hours.value);
    bookModal.style.display = "none";
    render();
};

cabPark.onclick = () => {
    const spot = state.spots[state.selected];
    spot.status = "cab";
    spot.parkedAt = new Date().toISOString();
    spot.billedHours = 0;
    spot.approxHours = parseInt(hours.value);
    bookModal.style.display = "none";
    render();
}

closeParkedInfo.onclick = () => {
  parkedInfoModal.style.display = "none";
};

parkOutButton.onclick = () => {
    const spot = state.spots[state.selected];
    spot.status = "free";
    spot.parkedAt = null;
    spot.billedHours = 0;
    spot.approxHours = null;
    spot.expiring = false;
    parkedInfoModal.style.display = "none";
    state.selected = null;
    render();
};

function updateTimers() {
    let revenueToAdd = 0;
    const now = new Date();
    state.spots.forEach(spot => {
        if ((spot.status === 'parked' || spot.status === 'cab') && spot.parkedAt) {
            const parkedDate = new Date(spot.parkedAt);
            const durationInSeconds = (now - parkedDate) / 1000;
            const hoursParked = Math.floor(durationInSeconds / 8);

            if (hoursParked > spot.billedHours) {
                const hoursToBill = hoursParked - spot.billedHours;
                revenueToAdd += hoursToBill * (spot.status === 'cab' ? 20 : 50);
                spot.billedHours = hoursParked;
            }

            if (spot.approxHours && hoursParked >= spot.approxHours) {
                 spot.expiring = true;
            } else {
                 spot.expiring = false;
            }

        }
    });

    if (revenueToAdd > 0) {
        state.revenue += revenueToAdd;
    }
    render();
}

setInterval(updateTimers, 1000);
