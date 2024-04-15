

var extentsInDegrees = [
    [
     147.216796875,
     -42.81152174509789
    ],
    [
     147.3046875,
     -42.87596410238254
    ]
   ]

var extentsInRadians = extentsInDegrees.map(function(coords) {
  var longitude = Cesium.Math.toRadians(coords[0]);
  var latitude = Cesium.Math.toRadians(coords[1]);
  return [longitude, latitude];
});

console.log(extentsInRadians);
