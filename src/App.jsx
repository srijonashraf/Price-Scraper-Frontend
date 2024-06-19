import React, { useState, useEffect } from "react";
import Search from "./Search";
import { Toaster, toast } from "react-hot-toast";
import { Player } from "@lottiefiles/react-lottie-player";
import animationData from "../Animation - 1718737728881.json";

const App = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [minPrice, setMinPrice] = useState(null);
  const [siteImageMap, setSiteImageMap] = useState({});

  let BaseURL;

  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    BaseURL = "http://localhost:3000/api/v1";
  } else {
    BaseURL = import.meta.env.VITE_PRODUCTION_BASE_URL;
  }

  const handleSearch = async (keyword) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BaseURL}/scrape/${encodeURIComponent(keyword)}`
      );
      const lowestPriceResponse = await fetch(`${BaseURL}/lowestprice`);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      const lowestPriceData = await lowestPriceResponse.json();

      if (data.data) {
        toast.success("Data fetched successfully!");
        setResults(data.data);
        setMinPrice(lowestPriceData.data["minSitename"]);
      } else {
        setResults(null);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setResults(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchLogoData = async () => {
      try {
        const response = await fetch(`${BaseURL}/logo`);
        if (!response.ok) {
          throw new Error("Failed to fetch logo data");
        }

        const logoData = await response.json();
        const newSiteImageMap = {};
        logoData["data"].forEach(({ name, img }) => {
          newSiteImageMap[name] = img;
        });

        setSiteImageMap(newSiteImageMap);
      } catch (error) {
        console.error("Error fetching logo data:", error);
      }
    };

    fetchLogoData();
  }, []);

  const LogoMarquee = () => (
    <marquee className="d-flex flex-row">
      {Object.entries(siteImageMap).map(([siteName, imageUrl]) => (
        <img
          key={siteName}
          style={{
            height: "40px",
            width: "auto",
            objectFit: "contain",
            backgroundColor: "#343a40",
          }}
          src={imageUrl}
          alt={siteName}
          className="mx-1 rounded-1 img-fluid img-thumbnail"
        />
      ))}
    </marquee>
  );

  return (
    <div>
      <Toaster position="top-right" />
      <div className="container">
        <h1 className="text-center mt-4">Price Scraper</h1>
        <LogoMarquee />
        <Search onSearch={handleSearch} />
        {loading && (
          <div className="d-flex justify-content-center align-items-center">
            <Player
              autoplay
              loop
              src={animationData}
              style={{ height: "300px", width: "300px" }}
            />
          </div>
        )}
        {loading && (
          <p className="text-center mt-2 fs-2">Fetching all the deals...</p>
        )}
        {results && !loading && (
          <div className="container mt-4">
            <div className="row justify-content-center">
              {Object.entries(results).map(([source, resultArray]) =>
                resultArray.map((result, index) => (
                  <div key={`${source}-${index}`} className="col-md-4 mb-4">
                    <div
                      className={`card h-100 shadow ${
                        minPrice === result.siteName
                          ? "border-primary border-3"
                          : ""
                      }`}
                    >
                      <img
                        src={result.imgSrc}
                        className="img-fluid img-thumbnail object-fit-cover"
                        alt=""
                      />
                      <div className="card-body p-4">
                        <h5 className="card-title">{result.productName}</h5>
                        <img
                          style={{
                            height: "40px",
                            width: "auto",
                            objectFit: "contain",
                            backgroundColor: "#343a40",
                          }}
                          src={siteImageMap[result.siteName]}
                          alt={result.siteName}
                          className="card-img-top d-flex my-2 rounded-1 img-fluid img-thumbnail"
                        />
                        <p className="card-text btn btn-success rounded-1 btn-sm">
                          Price: {result.price || result.priceOld}
                        </p>
                        {minPrice === result.siteName && (
                          <p className="badge rounded-1 bg-danger animated flash float-end fs-6">
                            Lowest Price!!
                          </p>
                        )}
                        <p>
                          Availability:{" "}
                          <span
                            className={`card-text fw-bold ${
                              result.availability === "In Stock"
                                ? "text-success"
                                : "text-danger"
                            }`}
                          >
                            {result.availability}
                          </span>
                        </p>
                        <p className="card-text fw-semibold">
                          From: {result.siteName}
                        </p>
                        {result.productUrl && (
                          <p className="card-text card-footer">
                            Product URL:{" "}
                            <a
                              href={result.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {result.productUrl}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
