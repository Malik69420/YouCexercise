export interface Exercise {
  id: string;
  title: string;
  description: string;
  starter_code: string;
  expected_output: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  created_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  exercise_id: string;
  code: string;
  output: string;
  passed: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}