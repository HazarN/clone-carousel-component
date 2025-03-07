(function main() {
  // Initialization
  const self = {
    loadJQuery,
    buildHTML,
    buildCSS,
    setEvents,
  };
  const init = () => {
    if (window.jQuery) console.log('jQuery is already loaded!');
    else self.loadJQuery();

    self.buildHTML();
    self.buildCSS();
  };

  // Loading jQuery
  function loadJQuery() {
    const script = document.createElement('script');
    script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
    script.onload = function () {
      console.log('jQuery yüklendi!');
      self.buildHTML();
      self.buildCSS();
    };

    document.head.appendChild(script);
  }

  // Builders and Event Handlers
  async function buildHTML() {
    const title = 'You Might Also Like';
    const products = await getProducts();

    const html = `
      <div class="hn-suggestion-carousel">
        <div class="hn-carousel-container">
          <button class="hn-prev">❮</button>

          <p class="hn-title">${title}</p>
          
          <div class="hn-carousel">
              ${products
                .map(
                  (product) => `
                  <div class="hn-product-card" id="${product.id}">
                    <div class="hn-favorite" id="${product.id}">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/></svg>
                    </div>
                  
                    <img src="${product.img}" alt="${product.name}" id="${product.id}" />
                    <p class="hn-product-name">${product.name}</p>
                    <span class="hn-price">${product.price} TL</span>
                  </div>`
                )
                .join('')}
          </div>

          <button class="hn-next">❯</button>
        </div>
      </div>
    `;

    $('.product-detail').append(html);

    // Restore the favorite status of the products in the local storage
    products.forEach((product) => {
      const favoriteButton = $(`#${product.id} .hn-favorite svg`);
      if (product.isFavorite) favoriteButton.css('fill', '#193DB0');
    });
    self.setEvents();
  }

  function buildCSS() {
    const css = `
      .hn-suggestion-carousel {
        display: flex;
        justify-content: center;  
      }

      .hn-carousel-container {
        position: relative;
        overflow: hidden;
        width: 80%;
      }

      p.hn-title {
        padding-top: 15px;
        padding-bottom: 15px;
        margin: 0;
        font-size: 32px;
        font-weight: lighter;
        color: #29323B;
        text-align: left;
        width: 100%;
      }

      .hn-carousel {
        display: flex;
        gap: 10px;
        transition: transform 0.5s ease;
        justify-content: flex-start;
      }

      .hn-product-card {
        width: 210px;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-right: 10px; 
        cursor: pointer;
        position: relative;
      }

      .hn-favorite {
        width: 40px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #ccc;
        border-radius: 25%;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;
      }
      .hn-favorite svg {
        width: 20px;
        height: 20px;
        stroke: #193DB0 !important;
        fill: #fff;
      }

      .hn-product-card > img {
        width: 210px;
        height: 280px;
        object-fit: cover;
      }

      .hn-product-name {
        font-size: 14px;
        padding: 5px;
        margin: 0;
      }

      .hn-price {
        text-align: left;
        color: #193DB0;
      }

      .hn-prev,
      .hn-next {
        background-color: inherit;
        color: #000;
        border: none;
        padding: 10px;
        cursor: pointer;
        font-size: 24px;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 10000;
      }
      .hn-prev {
        left: 0;
      }
      .hn-next {
        right: 0;
      }

      media screen and (max-width: 768px) {
        .hn-carousel-container {
          width: 100%;
        }

        .hn-product-card {
          width: 150px;
        }

        .hn-product-card > img {
          width: 280px;
          height: 373.33px;
          object-fit: cover;
        }

        .hn-product-card {
          width: 280px;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-right: 10px; 
        }
      }
    `;

    $('<style>').addClass('carousel-style').html(css).appendTo('head');
  }
  function setEvents() {
    const prevButton = $('.hn-prev');
    const nextButton = $('.hn-next');
    const carousel = $('.hn-carousel');
    const products = $('.hn-product-card');

    // *********************
    // Carousel slider logic
    let currentIndex = 0;

    // image with + gap between
    const itemWidth = 220;
    const visibleItems = Math.floor($('.hn-carousel-container').width() / itemWidth);
    const totalItems = products.length;
    const maxIndex = totalItems - visibleItems;

    prevButton.on('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        carousel.css('transform', `translateX(-${currentIndex * itemWidth}px)`);
      }
    });
    nextButton.on('click', () => {
      if (currentIndex < maxIndex) {
        currentIndex++;
        carousel.css('transform', `translateX(-${currentIndex * itemWidth}px)`);
      }
    });

    // ********************************
    // To open the product details page
    const productImage = $('.hn-product-card img');

    productImage.on('click', async function () {
      const productId = parseInt($(this).attr('id'));
      const products = await getProducts();

      const selectedProduct = products.find((product) => product.id === productId);

      if (selectedProduct) window.open(selectedProduct.url, '_blank');
      else console.error('Product not found!');
    });

    // *****************************
    // Marking a product as favorite
    const favoriteButton = $('.hn-favorite svg');

    favoriteButton.on('click', async function () {
      const icon = $(this);

      const productId = parseInt($(this).closest('.hn-favorite').attr('id'));
      const products = await getProducts();

      if (icon.css('fill') === 'rgb(255, 255, 255)') {
        products.forEach((product) => {
          if (product.id === productId) return (product.isFavorite = true);
        });
        localStorage.setItem('products', JSON.stringify(products));

        icon.css('fill', '#193DB0');
      } else {
        products.forEach((product) => {
          if (product.id === productId) return (product.isFavorite = false);
        });
        localStorage.setItem('products', JSON.stringify(products));

        icon.css('fill', '#fff');
      }
    });
  }

  // GET Request for the Products
  async function getProducts() {
    const url =
      'https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json';

    if (localStorage.getItem('products')) return JSON.parse(localStorage.getItem('products'));

    try {
      const res = await fetch(url);
      const data = await res.json();

      localStorage.setItem('products', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Failed to fetch the products', error);
    }
  }

  init();
})();
