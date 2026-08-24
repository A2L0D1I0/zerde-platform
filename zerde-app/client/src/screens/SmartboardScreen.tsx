import React, { useState, useEffect } from 'react';
import { DailySignal } from '@zerde/shared';
import { SmartboardView } from '@/features/smartboard/SmartboardView';
import api from '@/api/client';

interface SmartboardScreenProps {
  classroomId?: string | number;
  onBack?: () => void;
}

export const SmartboardScreen: React.FC<SmartboardScreenProps> = ({
  classroomId = '1',
  onBack,
}) => {
  const [signalData, setSignalData] = useState<DailySignal | null>(null);

  useEffect(() => {
    const fetchSignal = async () => {
      try {
        const res = await api.get<DailySignal>(`/teacher/lesson-signal?classroomId=${classroomId}`);
        setSignalData(res);
      } catch (err) {
        console.error('[SmartboardScreen] Failed to load signal', err);
      }
    };
    fetchSignal();
  }, [classroomId]);

  return <SmartboardView signal={signalData} onBack={onBack} />;
};

export default SmartboardScreen;
