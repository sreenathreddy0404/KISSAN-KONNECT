import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
// Slider removed — using numeric inputs for price range
import { getCrops } from "@/services/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import CropCard from "@/components/CropCard";

const BuyerBrowse = () => {
  const navigate = useNavigate();

  // State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  // filters panel removed
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });

  // Ref to cancel ongoing requests
  const abortControllerRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch crops with AbortController
  const fetchCrops = useCallback(async (page) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        search: debouncedSearch.trim() || undefined,
        // always send numeric bounds so server can handle them reliably
        priceMin: Number(priceRange[0]),
        priceMax: Number(priceRange[1]),
        sort: sort !== "default" ? sort : undefined,
      };

      const res = await getCrops(params, { signal: controller.signal });
      setCrops(res.data.crops || []);
      setPagination(prev => ({
        ...prev,
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        total: res.data.total,
      }));
      // update dynamic max price if provided by backend
      if (res.data.globalMaxPrice) setMaxPrice(res.data.globalMaxPrice);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(err);
        toast.error("Failed to load crops. Please try again.");
      }
    } finally {
      // Only reset loading if this request is still the latest
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, [pagination.limit, debouncedSearch, priceRange, sort]);

  // Effect for filter changes (reset page to 1)
  useEffect(() => {
    // Reset page to 1 when filters change
    if (pagination.currentPage !== 1) {
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    } else {
      // If already on page 1, fetch directly
      fetchCrops(1);
    }
  }, [debouncedSearch, priceRange, sort]);

  // Effect for page changes (only if not caused by filter reset)
  useEffect(() => {
    // Skip when page is 1 because filter effect already handles it
    if (pagination.currentPage !== 1) {
      fetchCrops(pagination.currentPage);
    }
  }, [pagination.currentPage]);

  // Handlers
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // category removed

  const clearFilters = () => {
    setPriceRange([0, 1000]);
    setSearch("");
    setSort("default");
  };

  const isFilterActive = debouncedSearch.trim() !== "" || priceRange[0] > 0 || priceRange[1] < maxPrice || sort !== 'default';

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: page }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Browse Crops 🛒</h1>
        <p className="text-muted-foreground text-sm">
          Find fresh produce near you ({pagination.total} crops available)
        </p>
      </div>

      <div className="space-y-3">
        {/* Search and filter row */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by crop name or farmer..."
              value={search}
              onChange={handleSearch}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <label className="text-xs text-muted-foreground">Min</label>
              <input
                type="number"
                className="input input-sm w-28 border rounded px-2"
                value={priceRange[0]}
                min={0}
                max={priceRange[1]}
                onChange={(e) => {
                  const val = Number(e.target.value || 0);
                  setPriceRange([Math.max(0, Math.min(val, priceRange[1])), priceRange[1]]);
                }}
                aria-label="Minimum price"
              />
            </div>

            <div className="flex items-center gap-1">
              <label className="text-xs text-muted-foreground">Max</label>
              <input
                type="number"
                className="input input-sm w-28 border rounded px-2"
                value={priceRange[1]}
                min={priceRange[0]}
                max={maxPrice}
                onChange={(e) => {
                  const val = Number(e.target.value || 0);
                  setPriceRange([priceRange[0], Math.max(priceRange[0], Math.min(val, maxPrice))]);
                }}
                aria-label="Maximum price"
              />
            </div>
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="price-low">Price: Low → High</SelectItem>
              <SelectItem value="price-high">Price: High → Low</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="qty-high">Quantity: Most</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-2">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </div>
      </div>
      {/* Active filters summary */}
      <div className="flex items-center gap-2">
        {debouncedSearch.trim() !== "" && (
          <Badge className="cursor-pointer" onClick={() => setSearch("")}>Keyword: {debouncedSearch}</Badge>
        )}
        {priceRange[0] > 0 && (
          <Badge className="cursor-pointer" onClick={() => setPriceRange([0, priceRange[1]])}>
            Min ₹{priceRange[0]}
          </Badge>
        )}
        {priceRange[1] < maxPrice && (
          <Badge className="cursor-pointer" onClick={() => setPriceRange([priceRange[0], maxPrice])}>
            Max ₹{priceRange[1]}
          </Badge>
        )}
        {sort !== 'default' && (
          <Badge className="cursor-pointer" onClick={() => setSort('default')}>Sort: {sort}</Badge>
        )}
      </div>
      
      {loading ? (
        <LoadingSpinner size="lg" text="Loading crops..." />
      ) : crops.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No crops found</p>
          <p className="text-sm mt-1">Try a different search or price range</p>
          {isFilterActive && (
            <Button variant="outline" size="sm" className="mt-3" onClick={clearFilters}>
              Clear all filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {crops.map(crop => (
              <CropCard
                key={crop._id}
                crop={crop}
                onClick={() => navigate(`/buyer/crop/${crop._id}`)}
                actions={
                  <div className="flex gap-2 w-full">
                    <Button
                      size="sm"
                      className="flex-1 gradient-hero text-primary-foreground border-0"
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/buyer/crop/${crop._id}`);
                      }}
                    >
                      Buy Now
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/buyer/bargains?crop=${crop._id}`);
                      }}
                    >
                      Bargain
                    </Button>
                  </div>
                }
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else {
                    const start = Math.max(1, pagination.currentPage - 2);
                    const end = Math.min(pagination.totalPages, start + 4);
                    if (i + start <= end) {
                      pageNum = start + i;
                    }
                  }
                  if (!pageNum) return null;
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                      className={pagination.currentPage === pageNum ? "gradient-hero text-primary-foreground border-0" : ""}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BuyerBrowse;