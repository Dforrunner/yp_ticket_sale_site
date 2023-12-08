import { createRef, useEffect } from 'react';
import { randInRangeFloat, randInRangeRound } from '../utils/utils';

const GlitterRainBg = ({ qty = 100, sizeMin = 3, sizeMax = 40 }) => {
  const canvasRef = createRef();

  useEffect(() => {
    const ratio = window.devicePixelRatio;

    const canvas = canvasRef.current;

    const canvasWidth = window.screen.width * ratio;
    const canvasHeight = window.screen.height * ratio;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const context = canvas.getContext('2d');

    const dots = [];

    const randDot = () => ({
      x: randInRangeRound(-canvasWidth, canvasWidth),
      y: -randInRangeRound(0, canvasHeight),
      radius: randInRangeRound(sizeMin, sizeMax),
      opacity: randInRangeFloat(0.5, 0.9),
    });

    for (let i = 0; i < qty; i++) {
      dots.push(randDot());
    }

    const drawDot = ({ x, y, radius = 5, opacity = 0.8 }) => {
      context.beginPath();
      context.shadowBlur = 3;
      context.shadowColor = `rgba(255, 200, 60, ${opacity})`;
      context.arc(x, y, radius, 0, 2 * Math.PI);
      context.fillStyle = `rgba(255, 200, 60, ${opacity})`;
      context.fill();
    };

    const moveDot = () => {
      context.clearRect(0, 0, canvasWidth, canvasHeight);

      dots.forEach((d, index) => {
        if (d.x % randInRangeRound(1, 3) === 0) {
          d.x += randInRangeRound(0, 1);
        } else {
          d.x -= 0.4;
        }

        d.y += 3.5;
        d.opacity -= 0.0015;

        if (d.x >= canvasWidth || d.y >= canvasHeight || d.opacity <= 0) {
          d = randDot();
        }
        dots[index] = d;
        drawDot(d);
      });

      window.requestAnimationFrame(moveDot);
    };

    window.requestAnimationFrame(moveDot);
  }, [canvasRef, qty, sizeMax, sizeMin]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
};

export default GlitterRainBg;
