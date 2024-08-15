import Station from "./classes/Station.js";
import Train from "./classes/Train.js";
import Way from "./classes/Way.js";

const jsonFile = 'configs/WayOut.json';
// const jsonFile = 'configs/WayTest.json';

//consts
const switchBtn = document.getElementById('switch-btn');

const timerDiv = document.querySelector(".timer");
const timetableDiv = document.querySelector(".timetable");


const mainTimerDiv = document.getElementById('main-timer');
const wayInfoDiv = document.getElementById('way-info');
const progressBarDiv = document.getElementById('progress-bar');
const progressBarLineDiv = document.getElementById('progress-bar-line');
const nextStationDiv = document.getElementById('next-station');
const nextStopInfoDiv = document.getElementById('next-stop-info')
const trainStatusDiv = document.getElementById('train-status');

// Условный Main()
const train = new Train();
loadAndParseJSON();



async function loadAndParseJSON() {
    try {
        const response = await fetch(jsonFile);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        
        const data = await response.json();
        const way = getWay(data);

        addTimer(way);
    } catch (error) {
        console.error('Ошибка при загрузке или парсинге JSON файла:', error);
    }
}
function getWay(data)
{       
    const stations = data.stations.map(station => new Station(station.name, station.date, station.stopTime));
    const start = data.start;
    const finish = data.finish;
    return new Way(start, finish, stations);
}
function addTimer(way)
{
    function updateTimer() {
        const now = new Date();
        const timeDifference = way.finishDate - now;
        if(now < way.startDate)
        {
            mainTimerDiv.textContent = `Время не пришло`;
            return;
        }
        if (timeDifference <= 0) {
            clearInterval(timerInterval);
            console.log("Время истекло!");
            mainTimerDiv.textContent = `Мы приехали`;
            timerDiv.removeChild(wayInfoDiv);
            timerDiv.removeChild(progressBarDiv)
            return;
        }

        const [hours, minutes, seconds] = getHoursMinutesSeconds(timeDifference);
        const timeLeft = getTimeString(hours, minutes, seconds);
        const progress = Math.floor(timeDifference * 100 / way.travelTime);
        way.updateStationsStatuses();
        updateUI(way, now, timeLeft, progress);
        updateTimetable(way);
    }

    // Обновляем таймер каждую секунду
    const timerInterval = setInterval(updateTimer, 1000);
}
function getTimeString(hours, minutes, seconds)
{
    if(seconds < 10)
        seconds = '0' + seconds;
    if(minutes < 10)
        minutes = '0' + minutes;
    if(hours < 10)
        hours = '0' + hours;
    return `${hours}:${minutes}:${seconds}`;
}
function getHoursMinutesSeconds(time)
{
    const hours = Math.floor(time / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);
    return [hours, minutes, seconds];
}
function getConstantHoursMinutesSeconds(date)
{
    return [date.getHours(), date.getMinutes(), date.getSeconds()]
}
function updateUI(way, now, timeLeft, progress)
{
    mainTimerDiv.textContent = timeLeft;
    progressBarLineDiv.textContent = progress + '%';
    progressBarLineDiv.style.width = progress + '%';

    const nextStation = way.stations[way.nextStationIndex];
    const previousStation = way.stations[way.previousStationIndex];
    nextStationDiv.innerHTML = `След. станция <span class="marked">${nextStation.name}</span>,`;
    
    const [hours, minutes, seconds] = getHoursMinutesSeconds(nextStation.date - now);
    nextStopInfoDiv.innerHTML = `остановка через <span class="marked">
        ${getTimeString(hours, minutes, seconds)}</span>
        на <span class="marked">${nextStation.stopTime}</span> мин.`
    if(previousStation == null)
    {
        trainStatusDiv.textContent = "Поезд в движении.";
        return;
    }
    if(train.isMoving(previousStation.date, previousStation.departure))
        trainStatusDiv.textContent = "Поезд в движении.";
    else
    {
        const timeDifference = previousStation.departure - now;
        const [hours, minutes, seconds] = getHoursMinutesSeconds(timeDifference);
        trainStatusDiv.textContent = `Поезд стоит (${previousStation.name}). Осталось ${getTimeString(hours, minutes, seconds)} мин.`;
    }
}


function updateTimetable(way)
{
    const stationsList = document.getElementById("stations-list");
    stationsList.replaceChildren();
    way.stations.forEach(station => {
        const stationDiv = document.createElement("li");
        let timeString = "";
        if(!station.isPassed)
        {

            let date = new Date(station.date); 
            const [hours, minutes, seconds] = getConstantHoursMinutesSeconds(date);
            timeString = `<span>${getTimeString(hours, minutes, seconds)} (${station.stopTime} мин)</span>`
            stationDiv.innerHTML = `${station.name} --- ${timeString}`;
            stationsList.appendChild(stationDiv);
        }
    });
}



let switchStatus = false;
switchBtn.addEventListener("click", () => {
    switchStatus = !switchStatus;
    if(switchStatus)
    {
        timetableDiv.style.zIndex = 2;
        timerDiv.style.zIndex = 1;
        switchBtn.style.background = "#a951c2";
    }
    else
    {
        timetableDiv.style.zIndex = 1;
        timerDiv.style.zIndex = 2;
        switchBtn.style.background = "#fff";
    }
})