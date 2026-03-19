export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  preferences: {
    style: string;
    priorities: string[];
  };
  createdAt: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  activities: Activity[];
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  type: "sightseeing" | "food" | "transport" | "hotel" | "activity";
}

export interface BookingTask {
  id: string;
  tripId: string;
  type: "flight" | "hotel" | "activity";
  name: string;
  date: string;
  status: "pending" | "booked" | "on_hold";
  options: BookingOption[];
  selectedOptionId?: string;
}

export interface BookingOption {
  id: string;
  provider: string;
  title: string;
  price: number;
  currency: string;
  rating: number;
  cancellationPolicy: string;
  deeplinkUrl: string;
}
