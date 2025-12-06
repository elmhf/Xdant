// ✅ cache للمناطق العشوائية
const regionCache = new Map();

export function getRandomRegion(imgWidth, imgHeight, minSize = 60, maxSize = 100) {
    const cacheKey = `${imgWidth}-${imgHeight}-${minSize}-${maxSize}`;
    if (regionCache.has(cacheKey)) return regionCache.get(cacheKey);

    const width =
        Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
    const height =
        Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
    const maxX = Math.max(0, imgWidth - width);
    const maxY = Math.max(0, imgHeight - height);
    const x = Math.floor(Math.random() * (maxX + 1));
    const y = Math.floor(Math.random() * (maxY + 1));

    const region = { x, y, width, height };
    regionCache.set(cacheKey, region);
    return region;
}
