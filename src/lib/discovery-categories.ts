import allImage from "@/assets/category-all.png";
import dormitoriesImage from "@/assets/category-dormitories.png";
import sharedImage from "@/assets/category-shared.png";
import buildingsImage from "@/assets/category-buildings.jpg";
import apartmentsImage from "@/assets/category-apartments.jpg";
import housesImage from "@/assets/category-houses.jpg";
import villasImage from "@/assets/category-villas.jpg";
import studiosImage from "@/assets/category-studios.jpg";
import roomsImage from "@/assets/category-rooms.jpg";

export const discoveryCategories = [
  { value: "all", label: "الكل", image: allImage },
  { value: "عمارة", label: "عمارات", image: buildingsImage },
  { value: "dormitory", label: "داخليات", image: dormitoriesImage },
  { value: "shared", label: "شواغر", image: sharedImage },
  { value: "شقة", label: "شقق", image: apartmentsImage },
  { value: "منزل أرضي", label: "منازل", image: housesImage },
  { value: "فيلا", label: "فلل", image: villasImage },
  { value: "استوديو", label: "استوديو", image: studiosImage },
  { value: "غرفة", label: "غرف", image: roomsImage },
];