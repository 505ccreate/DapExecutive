import { SiteContent } from "../types";

export const SITE_CONTENT: SiteContent = {
  hero: {
    title: "WHERE TO,\nCOMMANDER?",
    subtitle: "Elevating the Journey.",
    videoUrl: "https://dap-executive-site.vercel.app/Videos/chauffeur.mp4", // Placeholder, user will swap
  },
  about: {
    label: "Our Standard",
    title: "Elevating the Journey.",
    description: [
      "At DAP Executive, we redefine private transportation. Combining discreet, highly-trained professional chauffeurs with an immaculate fleet of the world's most refined vehicles, we provide an unparalleled travel experience tailored for executives, VIPs, and those who demand the absolute best.",
      "Providing customized discreet door to door concierge service.",
    ],
    quote: "We go where you need us to go!! We've got you covered—24/7.",
    tags: [
      "Trusted by Families, Executives & VIPs",
      "24/7 Availability",
      "Discreet Door-to-Door Concierge",
      "Uncompromising Safety & Comfort",
      "Corporate & Religious Organizations",
    ],
  },
  fleet: [
    {
      id: "sedan",
      name: "Executive Sedan",
      class: "Class A",
      passengers: 3,
      luggage: 3,
      description: "The perfect balance of luxury and efficiency for airport transfers and city meetings. Features premium leather seating and climate control.",
      image: "https://dap-executive-site.vercel.app/Images/luxury_sedan_1772672459884.png",
    },
    {
      id: "suv",
      name: "Premium SUV",
      class: "Class S",
      passengers: 6,
      luggage: 6,
      description: "Commanding presence and expansive legroom. Ideal for corporate roadshows, small groups, and extended luggage needs.",
      image: "https://dap-executive-site.vercel.app/Images/cadellac%201.png",
    },
    {
      id: "sprinter",
      name: "VIP Sprinter",
      class: "Class V",
      passengers: 14,
      luggage: 10,
      description: "Mobile boardroom and ultimate group transport. Equipped with captain's chairs, entertainment systems, and workstation tables.",
      image: "https://dap-executive-site.vercel.app/Images/chauffeur-car.png",
    },
  ],
  services: [
    {
      id: "corporate",
      title: "Corporate Travel",
      description: "Reliable, discreet transportation for roadshows, board meetings, and daily executive commuting. Dedicated account managers included.",
      icon: "Briefcase",
    },
    {
      id: "airport",
      title: "Airport Transfers",
      description: "Seamless arrivals and departures. We track your flight in real-time and provide inside meet-and-greet service at baggage claim.",
      icon: "Navigation",
    },
    {
      id: "hourly",
      title: "Hourly As-Directed",
      description: "Total flexibility. Keep your chauffeur on standby for an evening out, a shopping excursion, or a multi-stop itinerary.",
      icon: "Clock",
    },
    {
      id: "events",
      title: "Special Events",
      description: "Make a lasting impression at galas, weddings, and red carpet events with our immaculate fleet and white-glove service level.",
      icon: "Star",
    },
  ],
  ai: {
    label: "Next Generation",
    title: "AI Executive Travel System",
    description: "DAP Executive integrates cutting-edge artificial intelligence to eliminate logistics friction. Our proprietary system proactively manages every detail of your itinerary.",
    features: [
      {
        title: "Predictive Traffic Routing",
        description: "Adjusts routes in real-time anticipating congestion before it happens.",
        icon: "Zap",
      },
      {
        title: "Calendar Sync Integration",
        description: "Automatically generates booking details from your Outlook or Google Workspace.",
        icon: "Calendar",
      },
      {
        title: "Dynamic Fleet Allocation",
        description: "Ensures the perfect vehicle is always available for your specific requirements.",
        icon: "BarChart2",
      },
    ],
  },
};
