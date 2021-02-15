// function compositePolygons(polygonFeatures, properties) {
//   if (!polygonFeatures) {
//       throw new Error('PolygonFeatures is a required argument.')
//   } else if (polygonFeatures.length < 2) {
//       throw new Error('PolygonFeatures must contain 2 or more polygon features.')
//   }
//   const multiPolygonCoordinates = []
//   const capturedPolygonIndeces = []
//   for (let i = 0; i < polygonFeatures.length; i++) {
//       if (capturedPolygonIndeces.includes(i)) { continue }
//       capturedPolygonIndeces.push(i)
//       const currentPolygon = polygonFeatures[i]
//       const polygonGroup = [i]
//       for (let j = i + 1; j < polygonFeatures.length; j++) {
//           if (capturedPolygonIndeces.includes(j)) { continue }
//           const nextPolygon = polygonFeatures[j]
//           if (geojsonUtils.arePolygonsNested(currentPolygon, nextPolygon)) {
//               capturedPolygonIndeces.push(j)
//               polygonGroup.push(j)
//           }
//       }
//       // Construct polygon
//       let polygonCoordinates = []
//       polygonGroup.forEach(index => {
//           polygonCoordinates = polygonCoordinates.concat(
//             polygonFeatures[index].geometry.coordinates,
//           )
//       })
//       multiPolygonCoordinates.push(polygonCoordinates)
//   }
//   return mapToFeature('MultiPolygon', multiPolygonCoordinates, properties)
// }
