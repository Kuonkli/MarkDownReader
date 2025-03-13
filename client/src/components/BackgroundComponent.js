import React, { useEffect, useRef } from 'react';
import "../css/BackgroundStyles.css"; // Импортируем CSS-файл

const BackgroundComponent = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let offset = 0; // Смещение градиента
    let direction = 1; // Направление движения (1 - вправо, -1 - влево)

    // Настройка холста
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Анимация градиента
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Очищаем холст
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Создаем линейный градиент
      const gradient = ctx.createLinearGradient(
        offset, 0, // Начальная точка X
        canvas.width + offset, 0 // Конечная точка X
      );

      // Цвета градиента
      gradient.addColorStop(0, 'hsl(240, 100%, 10%)'); // Темно-синий
      gradient.addColorStop(0.25, 'hsl(240, 100%, 20%)'); // Синий
      gradient.addColorStop(0.5, 'hsl(266, 100%, 40%)'); // Яркий синий
      gradient.addColorStop(0.75, 'hsl(240, 100%, 20%)'); // Синий
      gradient.addColorStop(1, 'hsl(240, 100%, 10%)'); // Темно-синий

      // Заливаем холст градиентом
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Анимация смещения
      offset += direction * 0.4; // Скорость движения градиента

      // Меняем направление, если градиент дошел до края
      if (offset >= canvas.width * 0.2 || offset <= -canvas.width * 0.2) {
        direction *= -1; // Меняем направление
      }
    };

    animate();

    // Очистка
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="canvas-style" />;
};

export default BackgroundComponent;