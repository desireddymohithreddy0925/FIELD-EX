import alphonsoMangoImg from "../assets/produce/alphonso-mango.jpg";
import bhagwaPomegranateImg from "../assets/produce/bhagwa-pomegranate.jpg";
import cavendishBananasImg from "../assets/produce/cavendish-bananas.jpg";
import thompsonGrapesImg from "../assets/produce/thompson-grapes.jpg";
import papayaImg from "../assets/produce/papaya.jpg";
import guavaImg from "../assets/produce/guava.jpg";
import nagpurMandarinImg from "../assets/produce/nagpur-mandarin.jpg";
import appleImg from "../assets/produce/apple.jpg";

export interface FruitMedia {
  image: string;
  alt: string;
  origin: string;
  grade: string;
  brix: string;
  highlight: string;
  icon: string;
}

export function getFruitMedia(name: string = ""): FruitMedia {
  const lower = (name || "").toLowerCase();

  if (lower.includes("mango") || lower.includes("alphonso") || lower.includes("kesar") || lower.includes("banganapalli")) {
    return {
      image: alphonsoMangoImg,
      alt: "Ratnagiri Alphonso & Kesar Mango Export Packhouse Carton",
      origin: "Ratnagiri & Devgad, Maharashtra",
      grade: "Grade A Export",
      brix: "18-20° Brix",
      highlight: "In Season",
      icon: "🥭",
    };
  }

  if (lower.includes("pomegranate") || lower.includes("anar") || lower.includes("bhagwa") || lower.includes("arakta")) {
    return {
      image: bhagwaPomegranateImg,
      alt: "Solapur Bhagwa Ruby-Red Pomegranate Export Carton",
      origin: "Solapur & Nashik, Maharashtra",
      grade: "Export Extra",
      brix: "15-17° Brix",
      highlight: "Deep Red Arils",
      icon: "🍇",
    };
  }

  if (
    lower.includes("banana") ||
    lower.includes("cavendish") ||
    lower.includes("g9") ||
    lower.includes("grand naine") ||
    lower.includes("robusta")
  ) {
    return {
      image: cavendishBananasImg,
      alt: "Jalgaon Cavendish Premium Green Bananas Export Crate",
      origin: "Jalgaon, Maharashtra & Theni",
      grade: "Premium Hand",
      brix: "High Caliber",
      highlight: "Year-Round",
      icon: "🍌",
    };
  }

  if (lower.includes("grape") || lower.includes("thompson") || lower.includes("sonaka") || lower.includes("sharad")) {
    return {
      image: thompsonGrapesImg,
      alt: "Nashik Thompson Seedless Grapes Export Packhouse Punnets",
      origin: "Nashik & Sangli, Maharashtra",
      grade: "Super Extra",
      brix: "16-18° Brix",
      highlight: "GlobalGAP",
      icon: "🍇",
    };
  }

  if (lower.includes("papaya") || lower.includes("red lady")) {
    return {
      image: papayaImg,
      alt: "Anantapur & Gujarat Red Lady Papaya Export Carton",
      origin: "Anantapur & Gujarat",
      grade: "Grade A Export",
      brix: "11-13° Brix",
      highlight: "Fresh Harvest",
      icon: "🍈",
    };
  }

  if (lower.includes("guava") || lower.includes("safeda") || lower.includes("lalit")) {
    return {
      image: guavaImg,
      alt: "Nashik Allahabad Safeda Guava Export Packhouse Carton",
      origin: "Nashik, Maharashtra",
      grade: "Grade A Export",
      brix: "10-12° Brix",
      highlight: "Export Spec",
      icon: "🍐",
    };
  }

  if (
    lower.includes("mandarin") ||
    lower.includes("orange") ||
    lower.includes("citrus") ||
    lower.includes("nagpur") ||
    lower.includes("tangerine") ||
    lower.includes("kinnow")
  ) {
    return {
      image: nagpurMandarinImg,
      alt: "Vidarbha Nagpur Mandarin Citrus Export Packhouse Carton",
      origin: "Vidarbha, Maharashtra",
      grade: "Grade A Citrus",
      brix: "10-12° Brix",
      highlight: "Peak Harvest",
      icon: "🍊",
    };
  }

  if (lower.includes("apple")) {
    return {
      image: appleImg,
      alt: "Kinnaur & Shimla Fresh Export Apples",
      origin: "Shimla & Kinnaur, Himachal Pradesh",
      grade: "Grade A Export",
      brix: "14-16° Brix",
      highlight: "Crisp & Sweet",
      icon: "🍎",
    };
  }

  return {
    image: "",
    alt: `${name} Fresh Produce`,
    origin: "Verified APEDA Farm Clusters",
    grade: "Export Grade",
    brix: "QC Verified",
    highlight: "Export Certified",
    icon: "🌱",
  };
}
