import { useState, useEffect, useCallback, useRef } from 'react';
import { GRID_SIZE, INITIAL_SNAKE, INITIAL_DIRECTION } from '../constants';

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export const useSnakeGame = (onGameOver: (score: number, coins: number) => void) => {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [coin, setCoin] = useState<Point | null>(null);
  const [score, setScore] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [speed, setSpeed] = useState(150);

  const gameLoopRef = useRef<NodeJS.Timeout>();

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(p => p.x === newFood.x && p.y === newFood.y));
    return newFood;
  }, []);

  const generateCoin = useCallback((currentSnake: Point[]) => {
    if (Math.random() > 0.8) { // 20% chance for a coin to appear
      let newCoin: Point;
      do {
        newCoin = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
        };
      } while (currentSnake.some(p => p.x === newCoin.x && p.y === newCoin.y));
      return newCoin;
    }
    return null;
  }, []);

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (direction) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      // Pass through walls logic
      if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
      if (newHead.x >= GRID_SIZE) newHead.x = 0;
      if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
      if (newHead.y >= GRID_SIZE) newHead.y = 0;

      // Self-collision
      if (prevSnake.some((segment, index) => index !== 0 && segment.x === newHead.x && segment.y === newHead.y)) {
        setIsPaused(true);
        onGameOver(score, coinsCollected);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
        if (!coin) setCoin(generateCoin(newSnake));
        // Speed up slightly
        setSpeed(prev => Math.max(80, prev - 1));
      } else if (coin && newHead.x === coin.x && newHead.y === coin.y) {
        setCoinsCollected(c => c + 1);
        setCoin(null);
        // Don't pop tail if coin is eaten? Usually snake doesn't grow with coins
        // But user said snake "eats" coins to buy skin, let's make it not grow but count
        newSnake.pop();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, coin, score, coinsCollected, generateFood, generateCoin, onGameOver]);

  useEffect(() => {
    if (!isPaused) {
      gameLoopRef.current = setInterval(moveSnake, speed);
    } else {
      clearInterval(gameLoopRef.current);
    }
    return () => clearInterval(gameLoopRef.current);
  }, [isPaused, moveSnake, speed]);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setCoinsCollected(0);
    setSpeed(150);
    setFood(generateFood(INITIAL_SNAKE));
    setCoin(null);
    setIsPaused(false);
  };

  return {
    snake,
    food,
    coin,
    score,
    coinsCollected,
    isPaused,
    direction,
    setDirection,
    startGame,
    setIsPaused,
  };
};
