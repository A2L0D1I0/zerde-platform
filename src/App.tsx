import React from 'react';
import { StudentHomeScreen } from './screens/StudentHomeScreen';

export const App: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-[#f6f8fa] text-[#1f2328]">
      <StudentHomeScreen />
    </div>
  );
};

export default App;
