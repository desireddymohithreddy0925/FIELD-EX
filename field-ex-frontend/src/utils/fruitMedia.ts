import alphonsoMangoImg from "../assets/produce/alphonso-mango.jpg"
import bhagwaPomegranateImg from "../assets/produce/bhagwa-pomegranate.jpg"
import cavendishBananasImg from "../assets/produce/cavendish-bananas.jpg"
import thompsonGrapesImg from "../assets/produce/thompson-grapes.jpg"

export interface FruitMedia {
  image: string
  alt: string
  origin: string
  grade: string
  brix: string
  highlight: string
}

export function getFruitMedia(name: string): FruitMedia {
  const lower = (name || "").toLowerCase()

  if (lower.includes("mango")) {
    return {
      image: alphonsoMangoImg,
      alt: "Fresh Ratnagiri Alphonso & Kesar Mango Harvest",
      origin: "Ratnagiri & Devgad, Maharashtra",
      grade: "Grade A Export",
      brix: "18-20° Brix",
      highlight: "In Season",
    }
  }

  if (lower.includes("pomegranate") || lower.includes("anar") || lower.includes("bhagwa")) {
    return {
      image: bhagwaPomegranateImg,
      alt: "Solapur Bhagwa Ruby-Red Pomegranate Export Harvest",
      origin: "Solapur & Nashik, Maharashtra",
      grade: "Export Extra",
      brix: "15-17° Brix",
      highlight: "Deep Red Arils",
    }
  }

  if (
    lower.includes("banana") ||
    lower.includes("cavendish") ||
    lower.includes("g9") ||
    lower.includes("grand naine")
  ) {
    return {
      image: cavendishBananasImg,
      alt: "Jalgaon Cavendish Premium Green Bananas",
      origin: "Jalgaon, Maharashtra & Theni, TN",
      grade: "Premium Hand",
      brix: "High Caliber",
      highlight: "Year-Round",
    }
  }

  if (lower.includes("grape") || lower.includes("thompson")) {
    return {
      image: thompsonGrapesImg,
      alt: "Nashik Thompson Seedless Export Grapes",
      origin: "Nashik & Sangli, Maharashtra",
      grade: "Super Extra",
      brix: "16-18° Brix",
      highlight: "GlobalGAP",
    }
  }

  // Sensible default
  return {
    image: alphonsoMangoImg,
    alt: `${name} Fresh Produce`,
    origin: "Verified APEDA Farm Clusters",
    grade: "Export Grade",
    brix: "QC Verified",
    highlight: "Export Certified",
  }
}
