'use client';

import PISAssistantComponent from '@/components/pis-assistant/PISAssistantComponent';
// IMPORTANT: Ideally, create a separate action for students with potentially different logic/permissions
// For now, we reuse the admin action for demonstration purposes.
import { processQuestion } from '../../admin/pis-assistant/action';

export default function PISAssistantStudentPage() {
  const initialMessage = 'Assalamu\'alaikum! Saya PIS Assistant, siap membantu menjawab pertanyaan seputar informasi umum pesantren. Silakan bertanya!';

  return (
    <PISAssistantComponent 
      processQuestionAction={processQuestion} // Using admin action for now
      initialMessage={initialMessage}
      assistantName="PIS Assistant (Santri)"
      assistantDescription="Tanya AI tentang informasi pesantren"
    />
  );
} 