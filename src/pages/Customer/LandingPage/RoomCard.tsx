import { motion } from "framer-motion";
import { FaUsers, FaWifi, FaDesktop, FaLeaf, FaPalette, FaMicrophone } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface RoomCardProps {
  id: string | number;
  title: string;
  location: string;
  capacity: string;
  price: number;
  image?: string | null;
  listingId?: string | number;
  feature?: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  };
  onClick?: () => void;
}

// Template data for demo
const TEMPLATE_ROOMS: Omit<RoomCardProps, 'onClick'>[] = [
  {
    id: 1,
    title: "Innovators Suite",
    location: "North Wing, Level 3",
    capacity: "8-12 people",
    price: 45,
    feature: { icon: FaDesktop, label: "Equipped" },
  },
  {
    id: 2,
    title: "Main Auditorium",
    location: "Central Campus, Building B",
    capacity: "50-100 people",
    price: 120,
    feature: { icon: FaMicrophone, label: "Pro Audio" },
  },
  {
    id: 3,
    title: "The Pod - Private",
    location: "Library Annex, Level 1",
    capacity: "1-2 people",
    price: 15,
    feature: { icon: FaWifi, label: "High-speed" },
  },
  {
    id: 4,
    title: "Tech Lab C",
    location: "Science Block, Ground Floor",
    capacity: "15-20 people",
    price: 60,
    feature: { icon: FaDesktop, label: "PC Included" },
  },
  {
    id: 5,
    title: "Zen Conference Room",
    location: "East Tower, Level 8",
    capacity: "6-8 people",
    price: 35,
    feature: { icon: FaLeaf, label: "Eco-friendly" },
  },
  {
    id: 6,
    title: "Workshop Studio 2",
    location: "Creative Arts Hub, Level 2",
    capacity: "20-25 people",
    price: 55,
    feature: { icon: FaPalette, label: "Creative Kits" },
  },
];

const RoomCard = ({ 
  id, 
  title, 
  location, 
  capacity, 
  price, 
  image,
  listingId,
  feature,
  onClick 
}: RoomCardProps) => {
  const navigate = useNavigate();
  const FeatureIcon = feature?.icon || FaUsers;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Ưu tiên sử dụng listingId nếu có, nếu không thì dùng id
      const navigateId = listingId || id;
      navigate(`/product/${navigateId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer"
      onClick={handleClick}
    >
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden bg-gray-200">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm font-medium">No Image</span>
            </div>
          )}
          
          {/* Price Badge */}
          <div className="absolute top-3 right-3 bg-[#4da6ff] text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow-lg">
            ${price}/hr
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#4da6ff] transition-colors">
            {title}
          </h3>

          {/* Location */}
          <p className="text-sm text-gray-600 mb-2">
            {location}
          </p>

          {/* Capacity */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <FaUsers className="w-4 h-4 mr-2 text-[#4da6ff]" />
            <span>{capacity}</span>
          </div>

          {/* Feature */}
          {feature && (
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <FeatureIcon className="w-4 h-4 mr-2 text-[#4da6ff]" />
              <span>{feature.label}</span>
            </div>
          )}

          {/* View Details Button */}
          <button className="mt-auto w-full bg-[#4da6ff] hover:bg-[#3d8cff] text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Export template rooms for use in LandingPage
export { TEMPLATE_ROOMS };
export default RoomCard;
