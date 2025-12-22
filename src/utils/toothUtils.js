/**
 * Calculates the bounding box for a tooth finding.
 * Optimized for Object input: {x, y, width/w, height/h}
 * * @param {Object} finding - The tooth finding object.
 * @returns {Object|null} - The bounding box {x, y, width, height} or null if invalid.
 */
export const getToothBoundingBox = (finding) => {
    console.log('Finding:', finding);
    // 0. Handle 'location' property (Problem format)
    if (Array.isArray(finding?.location) && finding.location.length === 4) {
        const [cx, cy, w, h] = finding.location;
        return {
            x: cx - (w / 2),
            y: cy - (h / 2),
            width: w,
            height: h
        };
    }

    // 1. Basic validation
    if (!finding?.boundingBox || typeof finding.boundingBox !== 'object') {
        return null;
    }

    const bb = finding.boundingBox;

    // 2. Extraction mta3 el data (handling width/w and height/h)
    const x = bb.x;
    const y = bb.y;
    const width = bb.width ?? bb.w;
    const height = bb.height ?? bb.h;

    // 3. Validation mta3 el numbers (ensure they are valid coordinates)
    if (
        typeof x === 'number' &&
        typeof y === 'number' &&
        typeof width === 'number' &&
        typeof height === 'number' &&
        width > 0 &&
        height > 0
    ) {
        // YOLO x,y are center coordinates. Convert to top-left.
        return {
            x: x - (width / 2),
            y: y - (height / 2),
            width,
            height
        };
    }

    // 4. Fallback: Ken el boundingBox mahouch valid, jarreb calculehom mel mask/polygon
    const points = finding.polygon || finding.teeth_mask || finding.mask;
    if (Array.isArray(points) && points.length >= 4) {
        const flatPoints = points.flat();
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        for (let i = 0; i < flatPoints.length; i += 2) {
            const px = flatPoints[i];
            const py = flatPoints[i + 1];

            if (px < minX) minX = px;
            if (px > maxX) maxX = px;
            if (py < minY) minY = py;
            if (py > maxY) maxY = py;
        }

        if (isFinite(minX) && maxX > minX) {
            return {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY
            };
        }
    }

    return null;
};