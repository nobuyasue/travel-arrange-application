import { Trip, ItineraryDay, BookingTask } from "./types";

const TRIPS_KEY = "travel-app-trips";
const ITINERARY_KEY = "travel-app-itinerary";
const TASKS_KEY = "travel-app-tasks";

// Trips
export function getTrips(): Trip[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(TRIPS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTrip(trip: Trip): void {
  const trips = getTrips();
  const index = trips.findIndex((t) => t.id === trip.id);
  if (index >= 0) {
    trips[index] = trip;
  } else {
    trips.push(trip);
  }
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

export function getTrip(id: string): Trip | undefined {
  return getTrips().find((t) => t.id === id);
}

export function deleteTrip(id: string): void {
  const trips = getTrips().filter((t) => t.id !== id);
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  // Also clean up related data
  deleteItinerary(id);
  deleteBookingTasks(id);
}

// Itinerary
export function getItinerary(tripId: string): ItineraryDay[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(`${ITINERARY_KEY}-${tripId}`);
  return data ? JSON.parse(data) : [];
}

export function saveItinerary(tripId: string, days: ItineraryDay[]): void {
  localStorage.setItem(`${ITINERARY_KEY}-${tripId}`, JSON.stringify(days));
}

export function deleteItinerary(tripId: string): void {
  localStorage.removeItem(`${ITINERARY_KEY}-${tripId}`);
}

// Booking Tasks
export function getBookingTasks(tripId: string): BookingTask[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(`${TASKS_KEY}-${tripId}`);
  return data ? JSON.parse(data) : [];
}

export function saveBookingTasks(
  tripId: string,
  tasks: BookingTask[]
): void {
  localStorage.setItem(`${TASKS_KEY}-${tripId}`, JSON.stringify(tasks));
}

export function deleteBookingTasks(tripId: string): void {
  localStorage.removeItem(`${TASKS_KEY}-${tripId}`);
}

export function updateBookingTaskStatus(
  tripId: string,
  taskId: string,
  status: BookingTask["status"]
): void {
  const tasks = getBookingTasks(tripId);
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.status = status;
    saveBookingTasks(tripId, tasks);
  }
}
