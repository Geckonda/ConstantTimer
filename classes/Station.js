export default class Station{
    constructor(name, date, stopTime) {
        this.name = name;
        this.date = new Date(date);
        this.stopTime = stopTime;
        this.departure = this._makeDepartureDate(date, stopTime);
        this.isPassed = this.checkIfPassed();
    }

    // Метод для проверки, прошла ли дата
    checkIfPassed() {
        const now = new Date();
        return this.date < now;
    }
    _makeDepartureDate(date, stopTime)
    {
        const departureDate = new Date(date);
        return departureDate.setMinutes(departureDate.getMinutes() + stopTime);
    }
}