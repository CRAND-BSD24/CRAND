'use client';

import PISAssistantComponent from '@/components/pis-assistant/PISAssistantComponent';
// IMPORTANT: Ideally, create a separate action for teachers with potentially different logic/permissions
// For now, we reuse the admin action for demonstration purposes.
import { processQuestion } from '@/app/admin/pis-assistant/action'; 

export default function PISAssistantTeacherPage() {
  const initialMessage = 'Selamat datang Ustadz/Ustadzah di PIS Assistant! Saya dapat membantu Anda mencari informasi terkait santri atau data pesantren lainnya. Silakan bertanya.';

  return (
    <PISAssistantComponent 
      processQuestionAction={processQuestion} // Using admin action for now
      initialMessage={initialMessage}
      assistantName="PIS Assistant (Ustadz/ah)"
      assistantDescription="Tanya AI tentang data santri & pesantren"
    />
  );
} 