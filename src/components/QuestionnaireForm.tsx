import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import type { QuestionnaireQuestion, QuestionnaireAnswer, ServiceAnswer } from '@/types/questionnaire';

interface QuestionnaireFormProps {
  questions: QuestionnaireQuestion[];
  onComplete: (answers: Record<string, QuestionnaireAnswer>) => void;
  onCancel?: () => void;
  onSkip?: () => void;
}

export const QuestionnaireForm = ({ questions, onComplete, onCancel, onSkip }: QuestionnaireFormProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionnaireAnswer>>({});
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const getAnswerValue = (questionId: string): QuestionnaireAnswer['value'] => {
    return answers[questionId]?.value || '';
  };

  const handleAnswerChange = (value: QuestionnaireAnswer['value']) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        value,
      },
    }));
  };

  const handleNext = () => {
    const currentAnswer = answers[currentQuestion.id];
    if (currentQuestion.required && (!currentAnswer || !currentAnswer.value)) {
      return; // Ne pas avancer si la question est requise et non répondue
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Toutes les questions sont répondues
      onComplete(answers);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const canGoNext = () => {
    if (!currentQuestion.required) return true;
    const answer = answers[currentQuestion.id];
    return answer && answer.value;
  };

  const renderQuestionInput = () => {
    const value = getAnswerValue(currentQuestion.id);

    // Gérer le type color séparément
    if (currentQuestion.type === 'color') {
      return (
        <div className="flex gap-3">
          <Input
            type="color"
            value={(value as string) || '#0EA5E9'}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="w-20 h-10"
          />
          <Input
            type="text"
            value={value as string || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={currentQuestion.placeholder || '#0EA5E9'}
            pattern="^#[0-9A-Fa-f]{6}$"
          />
        </div>
      );
    }

    // Gestion des services (liste dynamique)
    if (currentQuestion.type === 'services') {
      const services = (value as ServiceAnswer[]) && Array.isArray(value) ? (value as ServiceAnswer[]) : [
        { name: '', duration: 30, price: 0 },
      ];

      const updateService = (index: number, field: keyof ServiceAnswer, newValue: string) => {
        const next = services.map((s, i) =>
          i === index
            ? {
                ...s,
                [field]:
                  field === 'duration' || field === 'price'
                    ? Number(newValue) || 0
                    : newValue,
              }
            : s
        );
        handleAnswerChange(next);
      };

      const addService = () => {
        handleAnswerChange([...services, { name: '', duration: 30, price: 0 }]);
      };

      const removeService = (index: number) => {
        if (services.length <= 1) return;
        handleAnswerChange(services.filter((_, i) => i !== index));
      };

      return (
        <div className="space-y-4">
          {services.map((service, idx) => (
            <div key={idx} className="p-3 border rounded-lg space-y-2 bg-muted/30">
              <div className="flex gap-2">
                <Input
                  value={service.name}
                  onChange={(e) => updateService(idx, 'name', e.target.value)}
                  placeholder="Nom du service"
                  required={currentQuestion.required}
                />
                <Input
                  type="number"
                  value={service.duration}
                  onChange={(e) => updateService(idx, 'duration', e.target.value)}
                  placeholder="Durée (min)"
                  min={0}
                  className="w-32"
                />
                <Input
                  type="number"
                  value={service.price}
                  onChange={(e) => updateService(idx, 'price', e.target.value)}
                  placeholder="Prix (€)"
                  min={0}
                  className="w-28"
                />
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Service {idx + 1}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => removeService(idx)} disabled={services.length <= 1}>
                    Supprimer
                  </Button>
                  {idx === services.length - 1 && (
                    <Button variant="outline" size="sm" onClick={addService}>
                      + Ajouter un service
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <Button variant="outline" size="sm" onClick={addService}>
              + Ajouter un service
            </Button>
          )}
        </div>
      );
    }

    // Tous les autres champs sont en texte
    return (
      <Input
        value={(value as string) || ''}
        onChange={(e) => handleAnswerChange(e.target.value)}
        placeholder={currentQuestion.placeholder}
        required={currentQuestion.required}
        className="text-base"
      />
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>Questionnaire de Configuration</CardTitle>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <CardDescription>
          Répondez aux questions pour que je puisse créer votre site personnalisé
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor={currentQuestion.id} className="text-base">
            {currentQuestion.label}
            {currentQuestion.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {currentQuestion.description && (
            <p className="text-sm text-muted-foreground">{currentQuestion.description}</p>
          )}
        </div>

        <div className="min-h-[200px]">{renderQuestionInput()}</div>

        <div className="flex justify-between pt-4 border-t">
          <div className="flex gap-2">
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Annuler
              </Button>
            )}
            {onSkip && (
              <Button variant="ghost" onClick={onSkip}>
                Passer le questionnaire
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {currentIndex > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>
            )}
            <Button onClick={handleNext} disabled={!canGoNext()}>
              {currentIndex === questions.length - 1 ? (
                <>
                  Terminer
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Suivant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

