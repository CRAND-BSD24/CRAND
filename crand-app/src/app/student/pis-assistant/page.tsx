'use client';

import PISAssistantComponent from '@/components/pis-assistant/PISAssistantComponent';
// Import the specific student action
import { processStudentQuestion } from '@/app/student/pis-assistant/action';

export default function PISAssistantStudentPage() {
  const initialMessage = 'Assalamu\'alaikum! Saya PIS Assistant, siap membantu menjawab pertanyaan seputar informasi pribadi Anda di pesantren (nilai, absensi, prestasi) atau informasi umum. Silakan bertanya!';

  return (
    <PISAssistantComponent 
      processQuestionAction={processStudentQuestion} // Use the student-specific action
      initialMessage={initialMessage}
      assistantName="PIS Assistant (Santri)"
      assistantDescription="Tanya AI tentang data Anda atau info pesantren"
    />
  );
} 