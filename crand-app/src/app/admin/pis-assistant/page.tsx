'use client';

import PISAssistantComponent from '@/components/pis-assistant/PISAssistantComponent';
import { processQuestion } from './action';

export default function PISAssistantAdminPage() {
  const initialMessage = 'Selamat datang Admin di PIS Assistant! Saya siap membantu Anda dengan informasi seputar santri dan ustadz menggunakan Gemini AI. Tanyakan apa saja terkait data pesantren.';

  return (
    <div className="flex flex-col min-h-screen pt-20 lg:pt-8 z-0 overflow-hidden bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="flex-none p-4 sm:p-6 md:p-8">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-800 mb-2">PIS Assistant</h1>
          <p className="text-sm sm:text-base text-blue-600">Asisten AI untuk membantu Anda dengan informasi pesantren</p>
        </div>
      </div>

      {/* Main Content - Takes remaining height */}
      <div className="flex-1 min-h-0 pb-4 sm:pb-6 md:pb-8">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="h-full bg-white rounded-xl shadow-lg border border-blue-100">
            <PISAssistantComponent 
              processQuestionAction={processQuestion}
              initialMessage={initialMessage}
              assistantName="PIS Assistant (Admin)"
              assistantDescription="Tanya AI tentang data santri & ustadz"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
