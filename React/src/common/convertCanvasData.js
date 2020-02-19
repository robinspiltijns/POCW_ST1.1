export default function (canvasData, width, height) {
    let objCanvas = canvasData;
    let canvasKeys = Object.keys(canvasData.data);
    console.log("width: " + width);
    console.log("height: " + height);
    let arr = new Uint8ClampedArray(4*width*height);
    for (const canvasKey of canvasKeys) {
        arr[canvasKey] = canvasData.data[canvasKey]
    }
    return new ImageData(arr,width, height);
}
