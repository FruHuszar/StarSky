const DEG = Math.PI / 180;

const crossing = (inside, outside, limit) => {
  const t = (limit - outside[2]) / (inside[2] - outside[2]);
  const point = [
    outside[0] + (inside[0] - outside[0]) * t,
    outside[1] + (inside[1] - outside[1]) * t,
    limit,
  ];
  const length = Math.hypot(...point) || 1;

  return [point[0] / length, point[1] / length, point[2] / length];
};

export const densify = (points, maximumAngle = 4) => {
  if (points.length < 2) {
    return points;
  }

  const limit = Math.cos(maximumAngle * DEG);
  const result = [points[0]];

  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1];
    const to = points[index];
    const dot = Math.max(
      -1,
      Math.min(1, from[0] * to[0] + from[1] * to[1] + from[2] * to[2]),
    );

    if (dot < limit) {
      const angle = Math.acos(dot);
      const steps = Math.ceil(angle / (maximumAngle * DEG));

      for (let step = 1; step < steps; step += 1) {
        const t = step / steps;
        const first = Math.sin((1 - t) * angle) / Math.sin(angle);
        const second = Math.sin(t * angle) / Math.sin(angle);

        result.push([
          from[0] * first + to[0] * second,
          from[1] * first + to[1] * second,
          from[2] * first + to[2] * second,
        ]);
      }
    }

    result.push(to);
  }

  return result;
};

export const clipLine = (points, limit = 0) => {
  const segments = [];
  let current = [];

  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    const previous = points[index - 1];

    if (point[2] >= limit) {
      if (previous && previous[2] < limit) {
        current.push(crossing(point, previous, limit));
      }

      current.push(point);
      continue;
    }

    if (previous && previous[2] >= limit) {
      current.push(crossing(previous, point, limit));
    }

    if (current.length > 1) {
      segments.push(current);
    }

    current = [];
  }

  if (current.length > 1) {
    segments.push(current);
  }

  return segments;
};
