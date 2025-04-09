'use client';

import PISAssistantComponent from '@/components/pis-assistant/PISAssistantComponent';
import { processQuestion } from './action'; // Import the server action

export default function PISAssistantAdminPage() {
  const initialMessage = 'Selamat datang Admin di PIS Assistant! Saya siap membantu Anda dengan informasi seputar santri dan ustadz menggunakan Gemini AI. Tanyakan apa saja terkait data pesantren.';

  return (
    <PISAssistantComponent 
      processQuestionAction={processQuestion} // Pass the server action
      initialMessage={initialMessage}
      assistantName="PIS Assistant (Admin)"
      assistantDescription="Tanya AI tentang data santri & ustadz"
    />
  );
}
