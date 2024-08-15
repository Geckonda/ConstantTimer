export default class Train
{
    isMoving(stationStop, departure)
    {
        const now = new Date();
        if(now < stationStop || now > departure)
            return true;
        return false;
    }
}