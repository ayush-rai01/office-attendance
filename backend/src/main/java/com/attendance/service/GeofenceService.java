package com.attendance.service;

import org.springframework.stereotype.Service;

@Service
public class GeofenceService {

    // Earth's radius in meters
    private static final double EARTH_RADIUS = 6371000;

    /**
     * Calculates the great-circle distance between two GPS coordinates using the Haversine formula.
     * @return distance in meters
     */
    public double calculateDistanceMeters(
            double lat1, double lon1,
            double lat2, double lon2) {

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c;
    }

    /**
     * Verifies if the user is inside the allowed office radius.
     */
    public boolean isInsideOffice(
            double userLat, double userLon,
            double officeLat, double officeLon,
            double allowedRadiusMeters) {

        double distance = calculateDistanceMeters(userLat, userLon, officeLat, officeLon);
        return distance <= allowedRadiusMeters;
    }
}
