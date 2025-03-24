//fuction that will conect to the api
document.getElementById("search-btn").addEventListener("click", async () => {
  const keyword = document.getElementById("keyword").value.trim();
  const resultsDiv = document.getElementById("results");

  //prevents the user for not typing any keyword
  if (!keyword) {
    alert("Please, type a word to be searched!");
    return;
  }

  //loading text while the aplication fetch with the api
  resultsDiv.innerHTML = "<p>loading...</p>";

  try {
    const response = await fetch(`http://localhost:3000/api/scrape?keyword=${encodeURIComponent(keyword)}`);
    const data = await response.json();

    //if the api returns a error message
    if (data.error) {
      resultsDiv.innerHTML = `<p class="error">${data.error}</p>`;
      return;
    }

    //if product was not found
    if (data.products.length === 0) {
      resultsDiv.innerHTML = "<p>product not found.</p>";
      return;
    }

    //list every product returning from api
    resultsDiv.innerHTML = data.products.map(product => `
      <div class="product">
        <img src="${product.image}" alt="${product.title}">
        <h3>${product.title}</h3>
        <p>⭐ ${product.rating || "N/A"} (${product.reviews || "0"} reviews)</p>
      </div>
    `).join("");

  } catch (error) {
    resultsDiv.innerHTML = `<p class="error">Error while trying to search for products: ${error.message}</p>`;
  }
});