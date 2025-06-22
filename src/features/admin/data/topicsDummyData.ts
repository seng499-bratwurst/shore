export interface Topic {
  id: number;
  name: string;
  positiveRatings: number;
  negativeRatings: number;
  queries: number;
}

export const dummyTopics: Topic[] = [
  { 
    id: 1, 
    name: 'Temperature', 
    positiveRatings: 45, 
    negativeRatings: 5, 
    queries: 120 },
  { 
    id: 2, name: 'pH', 
    positiveRatings: 38, 
    negativeRatings: 12, 
    queries: 98 },
  { 
    id: 3, 
    name: 'Turbidity', 
    positiveRatings: 20, 
    negativeRatings: 30, 
    queries: 65 },
  { 
    id: 4, 
    name: 'Conductivity', 
    positiveRatings: 50, 
    negativeRatings: 10, 
    queries: 140 },
  { 
    id: 5, 
    name: 'Pressure', 
    positiveRatings: 25, 
    negativeRatings: 25, 
    queries: 75 },
];