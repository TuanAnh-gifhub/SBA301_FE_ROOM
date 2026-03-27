import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ParallaxBackground from "./ParallaxBackground";
import HeroSection from "../../../components/HeroSection/HeroSection";
import ScrambleText from "../../../components/Header/ScrambleText";
import Footer from "../../../components/Footer/Footer";
import AboutUs from "../AboutUs/AboutUs";
import postsService from "../../../services/posts/posts";
import citiesService from "../../../services/cities/cities";
import categoriesService from "../../../services/categories/categories";
import PostCard from "./PostCard";

const useScrollspy = () => ({
  setActiveSection: (_section: string) => {
    void _section;
  },
});

const LandingPage = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setActiveSection } = useScrollspy();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem("landing_dark_mode");
    return stored === "true";
  });

  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const [cities, setCities] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number | undefined>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >();

  const [decodeLatestListings, setDecodeLatestListings] = useState(false);
  const latestListingsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (filters?: {
    cityId?: number;
    categoryId?: number;
  }) => {
    try {
      setLoadingPosts(true);

      const res = await postsService.getPublicPosts({
        page: 1,
        size: 6,
        cityId: filters?.cityId,
        categoryId: filters?.categoryId,
      });

      setPosts(res.result?.data || []);
    } catch (err) {
      console.error("Lỗi load post", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleSearch = async () => {
    const params = new URLSearchParams();

    if (selectedCityId != null) {
      params.set("cityId", String(selectedCityId));
    }

    if (selectedCategoryId != null) {
      params.set("categoryId", String(selectedCategoryId));
    }

    navigate(`/products?${params.toString()}`);
  };

  useEffect(() => {
    const handleDarkModeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ isDarkMode: boolean }>;
      setIsDarkMode(customEvent.detail.isDarkMode);
    };

    window.addEventListener("darkModeChanged", handleDarkModeChange);
    return () =>
      window.removeEventListener("darkModeChanged", handleDarkModeChange);
  }, []);

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const [citiesRes, categoriesRes] = await Promise.all([
          citiesService.getAllCities(),
          categoriesService.getAllCategories(),
        ]);

        const cityData = citiesRes?.result || [];
        const categoryData = categoriesRes?.result || [];

        setCities(cityData);
        setCategories(categoryData);
      } catch (error) {
        console.error("❌ Error fetching search data:", error);
        setCities([]);
        setCategories([]);
      }
    };

    fetchSearchData();
  }, []);

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id === "latest-listings") {
            setDecodeLatestListings(entry.isIntersecting);
          }
        });
      },
      { threshold: 0.3 },
    );

    const latestEl = latestListingsRef.current;

    if (latestEl) observer.observe(latestEl);

    return () => {
      if (latestEl) observer.unobserve(latestEl);
    };
  }, []);

  useEffect(() => {
    const headerOffset = 140;
    let ticking = false;

    const heroEl = document.querySelector(".HeroSection-root, #hero-section");
    const latestListingsEl = document.getElementById("latest-listings");

    const inView = (rect: DOMRect | null): boolean =>
      rect !== null && rect.top <= headerOffset && rect.bottom > headerOffset;

    const updateActive = () => {
      const heroRect = heroEl ? heroEl.getBoundingClientRect() : null;
      const latestListingsRect = latestListingsEl
        ? latestListingsEl.getBoundingClientRect()
        : null;

      if (inView(heroRect)) {
        setActiveSection("hero");
      } else if (inView(latestListingsRect)) {
        setActiveSection("latest-listings");
      } else {
        setActiveSection("latest-listings");
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateActive();
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateActive();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [setActiveSection]);

  return (
    <div
      className="relative min-h-screen w-full"
      style={{ background: isDarkMode ? "#1a1a2e" : "#f5f7fa" }}
    >
      <ParallaxBackground isDarkMode={isDarkMode} />

      <HeroSection
        cities={cities}
        categories={categories}
        selectedCityId={selectedCityId}
        selectedCategoryId={selectedCategoryId}
        onCityChange={setSelectedCityId}
        onCategoryChange={setSelectedCategoryId}
        onSearch={handleSearch}
      />

      <div
        className="relative z-10 bg-transparent text-[#0e0e0e] text-sm leading-[1.4] transition-all duration-300 px-3 sm:px-6"
        style={{
          marginLeft: 0,
        }}
      >
        <div
          id="latest-listings"
          ref={latestListingsRef}
          className="max-w-7xl mx-auto p-8"
        >
          {loading ? (
            <div className="mb-8 w-full px-4 lg:px-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div
                  className={`rounded-lg shadow-md overflow-hidden animate-pulse ${
                    isDarkMode ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <div
                    className={`h-[500px] ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-300"
                    }`}
                  ></div>
                </div>
                <div className="space-y-6">
                  <div
                    className={`h-32 ${
                      isDarkMode ? "bg-gray-800" : "bg-white"
                    } rounded-lg animate-pulse`}
                  ></div>
                  <div className="grid grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className={`rounded-lg shadow-md overflow-hidden animate-pulse ${
                          isDarkMode ? "bg-gray-800" : "bg-white"
                        }`}
                      >
                        <div
                          className={`h-64 ${
                            isDarkMode ? "bg-gray-700" : "bg-gray-300"
                          }`}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-4 w-full">
              <div className="text-center mb-6">
                <h1 className="text-xl md:text-2xl font-bold mb-4 text-[#4da6ff]">
                  <ScrambleText
                    text="Phòng học mới nhất"
                    triggerKey={decodeLatestListings}
                  />
                </h1>
              </div>

              <div className="pt-2 pb-2 grid md:grid-cols-3 gap-6">
                {loadingPosts && <p>Loading...</p>}

                {!loadingPosts &&
                  posts.map((post) => (
                    <PostCard key={post.postId} post={post} />
                  ))}
              </div>
            </div>
          )}
        </div>

        <div id="official-stores" className="max-w-7xl mx-auto pt-0 pb-6">
          <div className="flex justify-center -mt-4 mb-4">
            <Link
              to="/products"
              className={`border px-6 py-2 rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-300 font-medium ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700 text-gray-200 hover:bg-[#4da6ff] hover:text-white hover:border-[#4da6ff]"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-[#4da6ff] hover:text-white hover:border-[#4da6ff]"
              }`}
            >
              Xem thêm phòng học
            </Link>
          </div>
        </div>
      </div>

      <AboutUs isDarkMode={isDarkMode} />
      <Footer ref={footerRef} isDarkMode={isDarkMode} />
    </div>
  );
};

export default LandingPage;
