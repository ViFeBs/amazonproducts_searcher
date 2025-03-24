//Creates a HTTP Server to manipulate the requests
import express from "express";
//Makes HTTP request to get results from amazon page
import axios from "axios";
// alloy to manipulate hmtl
import { JSDOM } from "jsdom";

import cors from "cors";

//Initialize the server
const app = express();
//Define the  port
const PORT = 3000;

app.use(cors());

app.get("/api/scrape", async (req, res) => {
    try{
        //keyword is a url parameter (the product that is been searched) if not found returns an 400 error
        const keyword = req.query.keyword;
        if (!keyword) {
        return res.status(400).json({ error: "Keyword is required" });
        }


        const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;
        //makes the request to amazon
        const { data } = await axios.get(url, {
            //User-agent to avoid block from amazon
            headers: { 
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0", 
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
                "TE": "Trailers"
            }
        });

        //aditional error description
        if (data.includes("Enter the characters you see below")) {
            return res.status(403).json({ error: "Amazon blocked the request (CAPTCHA)" });
        }

        //convertin data to html
        const dom = new JSDOM(data);
        const document = dom.window.document;
        //list of products
        const products = [];

        // adding products to the list of products
        document.querySelectorAll(".s-result-item, .s-asin").forEach((item) => {

            const title = item.querySelector("h2 a span")?.textContent?.trim() || 
                 item.querySelector(".a-text-normal")?.textContent?.trim();
            
            const rating = item.querySelector(".a-icon-alt")?.textContent?.trim() || 
                        item.querySelector(".a-star-small")?.textContent?.trim();
            
            const reviews = item.querySelector(".a-size-base")?.textContent?.trim() || 
                            item.querySelector(".a-link-normal span")?.textContent?.trim();
            
            const image = item.querySelector(".s-image")?.src || 
                        item.querySelector("img")?.src;


            if (title && image) {
                products.push({ 
                    title, 
                    rating: rating?.replace(" out of 5 stars", ""), 
                    reviews: reviews?.replace(/,/g, ""), 
                    image 
                });
            }
        });

        //return the extract data as a json
        res.json({ keyword, products });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));