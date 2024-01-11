import React, { useState, useEffect } from 'react';
import Search from './Search';
import Loading from 'react-fullscreen-loading';
import { Toaster, toast } from 'react-hot-toast';

const App = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [minPrice, setMinPrice] = useState(null);
  const [siteImageMap, setSiteImageMap] = useState({});

  let BaseURL;

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {

    BaseURL = 'http://localhost:3000/api/v1';
  } else {

    BaseURL = 'https://price-scrapper-backend.onrender.com/api/v1';
  }

  const handleSearch = async (keyword) => {
    try {
      setLoading(true);
      const response = await fetch(`${BaseURL}/scrape/${encodeURIComponent(keyword)}`);
      const lowestPriceResponse = await fetch(`${BaseURL}/lowestprice`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      const lowestPriceData = await lowestPriceResponse.json();

      if (data.data) {
        toast.success('Data fetched successfully!');
        setResults(data.data);
        setMinPrice(lowestPriceData.data['minSitename']);
      } else {
        setResults(null);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setResults(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchLogoData = async () => {
      try {
        const response = await fetch(`${BaseURL}/logo`);
        if (!response.ok) {
          throw new Error('Failed to fetch logo data');
        }

        const logoData = await response.json();
        const newSiteImageMap = {};
        logoData['data'].forEach(({ name, img }) => {
          newSiteImageMap[name] = img;
        });

        setSiteImageMap(newSiteImageMap);
      } catch (error) {
        console.error('Error fetching logo data:', error);
      }
    };

    fetchLogoData();
  }, []);

  const LogoMarquee = () => (
    <marquee className="d-flex flex-row">
      {Object.entries(siteImageMap).map(([siteName, imageUrl]) => (
        <img
          key={siteName}
          style={{ height: '40px', width: 'auto', objectFit: 'contain', backgroundColor: '#343a40' }}
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
        {loading && <Loading loading loaderColor="#3498db" />}
        {loading && <p className="text-center mt-2 fs-2">Fetching all the deals...</p>}
        {results && !loading && (
          <div className="container mt-4">
            <div className="row justify-content-center">
              {Object.entries(results).map(([source, result]) => (
                <div key={source} className="col-md-4 mb-4">
                  <div className={`card h-100 shadow ${minPrice === result.siteName ? 'border-primary border-3' : ''}`}>
                    <div className="card-body p-4">
                      <h5 className="card-title">{result.productName}</h5>
                      <img
                        style={{ height: '40px', width: 'auto', objectFit: 'contain', backgroundColor: '#343a40' }}
                        src={siteImageMap[result.siteName]}
                        alt={result.siteName}
                        className="card-img-top d-flex my-2 rounded-1 img-fluid img-thumbnail"
                      />
                      <p className="card-text btn btn-success rounded-1 btn-sm">
                        Price: {result.price || result.priceOld}
                      </p>
                      {minPrice === result.siteName && (
                        <p className="badge rounded-1 bg-danger animated flash float-end fs-6">Lowest Price!!</p>
                      )}
                      <p>
                        Availability:{' '}
                        <span className={`card-text fw-bold ${result.availability === 'In Stock' ? 'text-success' : 'text-danger'}`}>
                          {result.availability}
                        </span>
                      </p>
                      <p className="card-text fw-semibold">From: {result.siteName}</p>
                      {result.productUrl && (
                        <p className="card-text card-footer">
                          Product URL:{' '}
                          <a href={result.productUrl} target="_blank" rel="noopener noreferrer">
                            {result.productUrl}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
