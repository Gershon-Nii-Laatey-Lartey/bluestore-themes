
import { useState, useEffect, useRef } from "react";
import { Search, Clock, X, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchService, SearchHistoryItem } from "@/services/searchService";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUserLocation } from "@/hooks/useUserLocation";

interface SearchDropdownProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export const SearchDropdown = ({ 
  placeholder = "Search products", 
  className,
  onSearch 
}: SearchDropdownProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { userLocation } = useUserLocation();

  // Load search history on component mount
  useEffect(() => {
    setSearchHistory(searchService.getSearchHistory());
  }, []);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Add to search history with current location
    await searchService.addToHistory(searchQuery, userLocation);
    
    // Update local state
    setSearchHistory(searchService.getSearchHistory());
    
    // Close dropdown
    setIsOpen(false);
    setQuery("");

    // Call custom onSearch handler or navigate to search page
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleHistoryItemClick = (historyQuery: string) => {
    setQuery(historyQuery);
    handleSearch(historyQuery);
  };

  const handleRemoveHistoryItem = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    searchService.removeFromHistory(id);
    setSearchHistory(searchService.getSearchHistory());
  };

  const handleClearHistory = () => {
    searchService.clearHistory();
    setSearchHistory([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setSearchHistory(searchService.getSearchHistory());
  };

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          onKeyPress={handleKeyPress}
          className="pl-10 w-full"
        />
      </div>

      {/* Search History Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {searchHistory.length > 0 ? (
            <>
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Recent searches</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearHistory}
                  className="h-6 px-2 text-xs text-gray-500 hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <div className="py-1">
                {searchHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer group"
                    onClick={() => handleHistoryItemClick(item.query)}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-gray-700 truncate block">{item.query}</span>
                        {item.location && (
                          <span className="text-xs text-gray-500 truncate block">{item.location}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleRemoveHistoryItem(item.id, e)}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-gray-400 hover:text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              No recent searches
            </div>
          )}
        </div>
      )}
    </div>
  );
};
