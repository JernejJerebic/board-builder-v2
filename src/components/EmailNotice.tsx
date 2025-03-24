
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
        EmailJS je zdaj konfiguriran z naslednjimi ID-ji:
        Service ID: service_iqv96th, Template ID: template_2pd5z1i, User ID: QSWNF6DxGrTMaC3CI.
        Elektronska pošta se bo poslala preko EmailJS storitve.
      </AlertDescription>
    </Alert>
  );
};

export default EmailNotice;
