async function fetchImage(title) {

  const images = [
  {
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1494526585095-c41746248156",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1460317442991-0ec209397118",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1472224371017-08207f84aaae",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1430285561322-7808604715df",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1468824357306-a439d58ccb1c",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1484154218962-a197022b5858",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1505692952047-1a78307da8f2",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1494526585095-c41746248156",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1464890100898-a385f744067f",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1448630360428-65456885c650",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1484154218962-a197022b5858",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1494526585095-c41746248156",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1519643381401-22c77e60520e",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1460317442991-0ec209397118",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1472224371017-08207f84aaae",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1430285561322-7808604715df",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1468824357306-a439d58ccb1c",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1464890100898-a385f744067f",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1448630360428-65456885c650",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1519643381401-22c77e60520e",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1460317442991-0ec209397118",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1484154218962-a197022b5858",
    filename: "listingimage",
  },
  {
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    filename: "listingimage",
  }
];

  // random image
  const randomImage =
    images[Math.floor(Math.random() * images.length)];

  return randomImage;
}

module.exports = fetchImage;