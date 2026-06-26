import CafeCard from "../../components/cafes/CafeCard"
import CafeList from "../../components/cafes/CafeList"

// cafeName must be unique as its used as a key
const mockCafes = [
{
  img:"https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FmZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
  cafeName:"Cafe name",
  address: "This is a simple presentational card built from plain HTML tags.",
  reviews: "5 stars",
  tags: ["cozy", "wifi", "outdoor seating"],
  priceRange: "$$",
  openingHours: "8:00 AM - 10:00 PM",
}, 
{
    img:"https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FmZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
    cafeName:"Cafe name 2",
    address: "address 2.",
    reviews: "3 stars",
    tags: ["indoors", "aesthetic", "desserts"],
    priceRange: "$$",
    openingHours: "8:00 AM - 10:00 PM",
  },
]

export default function Cafes() {
    return(
        <div>
            <h1 className="text-3xl font-bold mb-4">Cafes Near you</h1>
            <CafeList cafes={mockCafes} />
        </div>
    )
}

