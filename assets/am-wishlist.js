const WORKER_URL = 'https://am-wishlist.curly-unit-e48d.workers.dev';

if (!window.amCustomer || !window.amCustomer.id) {
  // not logged in, nothing to wire up
} else {
  const customerId = window.amCustomer.id;
  const hearts = document.querySelectorAll('.am-wishlist-heart');
  console.log('AM WISHLIST DEBUG: hearts found =', hearts.length);
  console.log('AM WISHLIST DEBUG: about to fetch', `${WORKER_URL}/?wishlist_action=get&customer_id=${customerId}`);

  if (hearts.length) {
    fetch(`${WORKER_URL}/?wishlist_action=get&customer_id=${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        const saved = data.wishlist || [];
        hearts.forEach((heart) => {
          const productGid = `gid://shopify/Product/${heart.dataset.productId}`;
          if (saved.includes(productGid)) {
            heart.classList.add('is-saved');
          }
        });
      })
      .catch((err) => console.error('Wishlist load failed', err));

    hearts.forEach((heart) => {
      heart.addEventListener('click', function (e) {
  e.preventDefault();
  e.stopImmediatePropagation();

        const productId = heart.dataset.productId;
        const isSaved = heart.classList.contains('is-saved');
        const action = isSaved ? 'remove' : 'add';

        heart.classList.toggle('is-saved');

        fetch(`${WORKER_URL}/?wishlist_action=${action}&customer_id=${customerId}&product_id=${productId}`)
          .then((res) => res.json())
          .catch((err) => {
            console.error('Wishlist update failed', err);
            heart.classList.toggle('is-saved');
          });
      });
    });
  }
}