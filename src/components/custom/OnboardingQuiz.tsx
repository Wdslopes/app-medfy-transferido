"use client";

import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';

interface OnboardingQuizProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: QuizData) => void;
}

export interface QuizData {
  fullName: string;
  crm: string;
  specialty: string;
  mainUse: string;
  additionalNeeds: string;
}

export function OnboardingQuiz({ isOpen, onClose, onComplete }: OnboardingQuizProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<QuizData>({
    fullName: '',
    crm: '',
    specialty: '',
    mainUse: '',
    additionalNeeds: ''
  });

  if (!isOpen) return null;

  const totalSteps = 3;

  const specialties = [
    { value: 'general', label: t('generalPractitioner') },
    { value: 'cardiology', label: t('cardiologist') },
    { value: 'pediatrics', label: t('pediatrician') },
    { value: 'orthopedics', label: t('orthopedist') },
    { value: 'dermatology', label: t('dermatologist') },
    { value: 'gynecology', label: t('gynecologist') },
    { value: 'psychiatry', label: t('psychiatrist') },
    { value: 'neurology', label: t('neurologist') },
    { value: 'other', label: t('other') },
  ];

  const mainUses = [
    { value: 'reports', label: t('generateReports') },
    { value: 'prescriptions', label: t('writePrescriptions') },
    { value: 'imaging', label: t('analyzeExams') },
    { value: 'management', label: t('patientManagement') },
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    // Salvar dados do quiz no perfil do usuário
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: formData.fullName,
            crm: formData.crm,
            specialty: formData.specialty,
            main_use: formData.mainUse,
            additional_needs: formData.additionalNeeds,
            onboarding_completed: true,
            updated_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Erro ao salvar dados do quiz:', error);
    }

    onComplete(formData);
    onClose();
  };

  const canProceed = () => {
    if (step === 1) return formData.fullName && formData.crm;
    if (step === 2) return formData.specialty;
    if (step === 3) return formData.mainUse;
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{t('quizTitle')}</h2>
              <p className="text-white/60 text-sm mt-1">{t('quizSubtitle')}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-all ${
                  s <= step ? 'bg-gradient-to-r from-[#FF6F00] to-[#FFD600]' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-white/40 mt-2">
            {t('quizStep')} {step} {t('quizOf')} {totalSteps}
          </p>
        </div>

        <div className="p-6">
          {/* Step 1: Dados Pessoais */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  {t('fullName')} *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Dr. João Silva"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  {t('crm')} *
                </label>
                <input
                  type="text"
                  value={formData.crm}
                  onChange={(e) => setFormData({ ...formData, crm: e.target.value })}
                  placeholder="CRM 12345/SP"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00] transition-all"
                />
              </div>
            </div>
          )}

          {/* Step 2: Especialidade */}
          {step === 2 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-white/80 mb-2">
                {t('specialty')} *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {specialties.map((specialty) => (
                  <button
                    key={specialty.value}
                    onClick={() => setFormData({ ...formData, specialty: specialty.value })}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      formData.specialty === specialty.value
                        ? 'border-[#FF6F00] bg-[#FF6F00]/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{specialty.label}</span>
                      {formData.specialty === specialty.value && (
                        <CheckCircle2 className="w-5 h-5 text-[#FF6F00]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Uso Principal */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  {t('mainUse')} *
                </label>
                <div className="space-y-3">
                  {mainUses.map((use) => (
                    <button
                      key={use.value}
                      onClick={() => setFormData({ ...formData, mainUse: use.value })}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        formData.mainUse === use.value
                          ? 'border-[#FF6F00] bg-[#FF6F00]/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{use.label}</span>
                        {formData.mainUse === use.value && (
                          <CheckCircle2 className="w-5 h-5 text-[#FF6F00]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  {t('additionalNeeds')}
                </label>
                <textarea
                  value={formData.additionalNeeds}
                  onChange={(e) => setFormData({ ...formData, additionalNeeds: e.target.value })}
                  placeholder={t('tellUsMore')}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00] transition-all resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          {step > 1 && (
            <button
              onClick={handlePrevious}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-white transition-all flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              {t('previous')}
            </button>
          )}
          
          {step < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-semibold text-[#0D0D0D] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {t('next')}
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!canProceed()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-semibold text-[#0D0D0D] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              {t('finish')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
