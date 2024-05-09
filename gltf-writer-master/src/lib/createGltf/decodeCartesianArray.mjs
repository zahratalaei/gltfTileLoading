import { Buffer } from 'buffer';
const dataURI =
  'data:application/octet-stream;base64,NHyQQc6O1kA2uwfCl+14QTfoXUDtbQPC4d1PQau/jD5qzP7B/sklQTbVN8C3R/fB/WT1QHQwv8B0TfDBly+dQBODEMFq3enBl+gFQAa2QMF19+PBkmVKvyYxcMGJm97BASdvwDR6j8GtydnBjODXwNR/psH+gdXBSRodwVApvcGuxNHBl7Ifwd5BvMEMddLBo25WwXot3sH8eMfBkl6HwS+K/8GHU73BjE6kwSwsEMImBLTB6gbCwRhMIMJ8iqvBgIfgwe0kMMJb5qPBStD/way2P8K+F53BuPAPwkcBT8LPHpfBoF0gwqEEXsLj+5HBGy8xwo/AbMJ7r43Be2VCwtk0e8JGOorBTv6TQYEZ2kCs1AbCr9qSQeAS5UCVtgDCtjmRQVRw8UCstvXB2B6PQQoo/0AugurBC42MQc4YB0GJzN/BxYaJQQVDD0Eck9XBBA6GQdYPGEHH08vBSySCQRt9IUHujMLBUZV7QVWJK0FwvbnBZQNyQa8zNkGuZLHBFZNnQfd7QUGCgqnBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAMC41ODYwLjU4NDAuMTQyAAAAAAUAAAAKAAAADwAAADQuMTg4My40NTQwLjUwNgAAAAAFAAAACgAAAA8AAAAxOTk3MDkxOTk3MDgxOTk3MTAAAAAABgAAAAwAAAASAAAAMjAyMi0xMi0xODIwMjItMTItMTgyMDIyLTEyLTE4AAAAAAoAAAAUAAAAHgAAADExOjU1OjQ4MTE6NTU6NDcxMTozMToyNwAAAAAIAAAAEAAAABgAAAA1OTE2MjI1OTE2MjE1OTE2MjMAAAAABgAAAAwAAAASAAAANDI1NjE0LjQAAAAAAgAAAAQAAAAIAAAATm9ydGggV2VzdE5vcnRoIFdlc3ROb3J0aCBXZXN0AAAAAAoAAAAUAAAAHgAAAE1hcnJhd2FoIFNvdXRoTWFycmF3YWggU291dGhNYXJyYXdhaCBTb3V0aAAAAAAOAAAAHAAAACoAAAAzLjIxNDIuMTU3MC41NDEAAAAABQAAAAoAAAAPAAAAMjIuOTU0MTIuNzYzMS45MzMAAAAABgAAAAwAAAARAAAANS42NjQuNgAAAAADAAAABAAAAAcAAAA1LjhOQU5BAAAAAAMAAAAFAAAABwAAADE0MTYuOTI4AAAAAAIAAAAGAAAACAAAAExWIEFCQ0xWIEFCQ1NlcnZpY2UAAAAABgAAAAwAAAATAAAA';
// Function to decode Data URI to a Buffer
function decodeDataURI(dataURI) {
  const base64String = dataURI.split(',')[1];
  const binaryString = atob(base64String);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return Buffer.from(bytes.buffer);
}

// Function to extract the flatCartesianArray from the decoded Buffer
function extractCartesianArray(buffer, cartesianBufferLength) {
  // Extract the cartesian data buffer
  const cartesianBuffer = buffer.slice(0, cartesianBufferLength);
  // Convert the Buffer to a Float32Array
  const cartesianArray = new Float32Array(cartesianBuffer.buffer, cartesianBuffer.byteOffset, cartesianBuffer.length / Float32Array.BYTES_PER_ELEMENT);
  // Convert Flat Cartesian Array to structured format
  const cartesianCoordinates = [];
  for (let i = 0; i < cartesianArray.length; i += 3) {
    cartesianCoordinates.push({
      x: cartesianArray[i],
      y: cartesianArray[i + 1],
      z: cartesianArray[i + 2]
    });
  }
  return cartesianCoordinates;
  //   return cartesianArray;
}

// Example usage
// const dataURI = 'your_data_uri_here'; // Replace with your actual data URI
const cartesianBufferLength = 396; // Replace with the actual length of the cartesian data buffer in bytes

const decodedBuffer = decodeDataURI(dataURI);
const flatCartesianArray = extractCartesianArray(decodedBuffer, cartesianBufferLength);

console.log('Flat Cartesian Array:', flatCartesianArray);
