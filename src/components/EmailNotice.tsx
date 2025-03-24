
import React from 'react';
import { Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface EmailNoticeProps {
  className?: string;
}

const EmailNotice: React.FC<EmailNoticeProps> = ({ className = '' }) => {
  return (
    <Alert className={className}>
      <Info className="h-4 w-4" />
      <AlertTitle>Pomembno obvestilo</AlertTitle>
      <AlertDescription>
        Za pravilno delovanje pošiljanja e-pošte mora biti konfiguriran EmailJS z ustreznimi ID-ji.
        Trenutno je nastavljen Service ID: service_iqv96th, potrebujemo še pravilna Template ID in User ID.
      </AlertDescription>
    </Alert>
  );
};

export default EmailNotice;
