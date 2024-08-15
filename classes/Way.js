import Station from "./Station.js";
export default class Way
{
    constructor(start, finish, stations)
    {
        this._startDate = new Date(start);
        this._finishDate = new Date(finish);
        this.stations = stations;
    }
    get startDate()
    {
        return this._startDate;
    }
    get finishDate()
    {
        return this._finishDate;
    }
    get nextStationIndex()
    {
        return this.stations.findIndex(station => !station.isPassed);
    }
    get previousStationIndex()
    {
        let index = this.nextStationIndex;
        if(index != null)
            return --index;
        return null; 
    }
    get travelTime()
    {
        return this._finishDate - this._startDate;
    }
    updateStationsStatuses()
    {
        this.stations.forEach(station => {
            station.isPassed = station.checkIfPassed();
        });
    }
}