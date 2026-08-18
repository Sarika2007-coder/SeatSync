/**
 * Routes Service
 * Reusable service for fetching routes and stops from Supabase
 * Caches data locally to minimize API calls
 */

class RoutesService {
  constructor() {
    this.routesCache = null;
    this.stopsCache = {}; // Map: routeId → stops[]
  }

  /**
   * Get all active routes
   * @returns {Promise<Array>} Array of route objects
   */
  async getRoutes() {
    if (this.routesCache) return this.routesCache;
    
    try {
      const res = await fetch('/api/routes');
      const data = await res.json();
      if (data.success && data.routes) {
        this.routesCache = data.routes;
        return data.routes;
      }
    } catch (err) {
      console.error('Error fetching routes:', err);
    }
    
    return [];
  }

  /**
   * Get all stops for a specific route
   * @param {string} routeId - UUID of the route
   * @returns {Promise<Array>} Array of stop objects ordered by sequence
   */
  async getStopsForRoute(routeId) {
    if (this.stopsCache[routeId]) return this.stopsCache[routeId];
    
    try {
      const res = await fetch(`/api/routes/${encodeURIComponent(routeId)}/stops`);
      const data = await res.json();
      if (data.success && data.stops) {
        this.stopsCache[routeId] = data.stops;
        return data.stops;
      }
    } catch (err) {
      console.error(`Error fetching stops for route ${routeId}:`, err);
    }
    
    return [];
  }

  /**
   * Get a single stop by ID (searches all cached stops)
   * @param {string} stopId - UUID of the stop
   * @returns {Promise<Object|null>} Stop object or null if not found
   */
  async getStopById(stopId) {
    // Search through cached stops
    for (const stops of Object.values(this.stopsCache)) {
      const stop = stops.find(s => s.id === stopId);
      if (stop) return stop;
    }
    return null;
  }

  /**
   * Get valid dropping stops (stops that occur after boarding stop)
   * @param {Array} stops - Array of stops for the route
   * @param {number} boardingSequence - Sequence number of boarding stop
   * @returns {Array} Filtered array of valid dropping stops
   */
  getValidDroppingStops(stops, boardingSequence) {
    return stops.filter(s => s.sequence > boardingSequence);
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.routesCache = null;
    this.stopsCache = {};
  }

  /**
   * Refresh route list
   */
  async refreshRoutes() {
    this.routesCache = null;
    return this.getRoutes();
  }

  /**
   * Refresh stops for a specific route
   */
  async refreshStopsForRoute(routeId) {
    delete this.stopsCache[routeId];
    return this.getStopsForRoute(routeId);
  }
}

// Export as singleton
const routesService = new RoutesService();
