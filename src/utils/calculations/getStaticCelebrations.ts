import { celebrations } from '../../resources/nonMoveableCelebrations.json';
import dayCelebrations from '../../resources/dayReadings.json';
import fromGregorian from '../copticDate';

const getStaticCelebrationsForDay = (date: Date) => {
  const { month, day }: { month: number; day: number } = fromGregorian(date);
  const monthFound = dayCelebrations[month - 1];
  if (!monthFound) {
    throw new Error('Month not found');
  }
  const celebrationsFound = monthFound.daysWithCelebrations[day - 1];
  // handle multiple celebrations
  const celebrationData: any[] = [];
  if (celebrationsFound === 0) {
    return null;
  }

  if (Array.isArray(celebrationsFound)) {
    celebrationsFound.forEach(celeb => {
      const celebFound = celebrations.find(x => x.id === celeb);
      celebrationData.push({ ...celebFound, isMoveable: false });
    });
  } else {
    const celebFound = celebrations.find(x => x.id === celebrationsFound);
    celebrationData.push({ ...celebFound, isMoveable: false });
  }
  return celebrationData;
};

export { getStaticCelebrationsForDay };
