'use client';

import PISAssistantComponent from '@/components/pis-assistant/PISAssistantComponent';
// Import the specific teacher action
import { processTeacherQuestion } from './action'; 

export default function PISAssistantTeacherPage() {
  const initialMessage = 'Selamat datang Ustadz/Ustadzah di PIS Assistant! Saya dapat membantu Anda mencari informasi terkait data pribadi Anda atau santri yang Anda ajar. Silakan bertanya.';

  return (
    <PISAssistantComponent 
      processQuestionAction={processTeacherQuestion} // Use the teacher-specific action
      initialMessage={initialMessage}
      assistantName="PIS Assistant (Ustadz/ah)"
      assistantDescription="Tanya AI tentang data Anda & santri terkait"
    />
  );
} 