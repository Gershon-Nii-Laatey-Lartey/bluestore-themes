
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const categories = [
  { name: "All", href: "/search" },
  { name: "Smartphones", href: "/category/smartphones" },
  { name: "Electronics", href: "/category/electronics" },
  { name: "Gaming", href: "/category/gaming" },
  { name: "Fashion", href: "/category/fashion" },
  { name: "Laptops", href: "/category/laptops" },
  { name: "Automotive", href: "/category/automotive" },
  { name: "Headphones", href: "/category/headphones" }
];

export const CategoriesSection = () => {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg md:text-xl font-bold text-gray-900">Categories</h3>
        <Link to="/search">
          <Button variant="ghost" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            See all →
          </Button>
        </Link>
      </div>
      
      <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2">
        {categories.map((category, index) => (
          <Link key={category.name} to={category.href}>
            <Button
              variant={index === 0 ? "default" : "outline"}
              className={`whitespace-nowrap rounded-full ${
                index === 0 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              {category.name}
            </Button>
          </Link>
        ))}
      </div>
    </section>
  );
};
