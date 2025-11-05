import * as turf from "@turf/turf";
import saudiGeo from "./saudi.geo.json";

export function isLocationAllowed(lat, lng) {
  const point = turf.point([lng, lat]);
  const polygon = saudiGeo.features[0];

  return turf.booleanPointInPolygon(point, polygon);
}
