
import React from 'react';
import { Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface EmailNoticeProps {
  className?: string;
}

const EmailNotice: React.FC<EmailNoticeProps> = ({ className = '' }) => {
  return (
    <Alert variant="info" className={className}>
      <Info className="h-4 w-4" />
      <AlertTitle>Pomembno obvestilo</AlertTitle>
      <AlertDescription>
        V tem razvojnem okolju bo naročilo zabeleženo, vendar e-poštna obvestila ne bodo dejansko poslana. 
        V produkcijskem okolju bi se e-poštna sporočila poslala na vaš e-poštni naslov in administratorja.
      </AlertDescription>
    </Alert>
  );
};

export default EmailNotice;
