
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { addLog } from '@/services/localStorage';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import emailjs from 'emailjs-com';

const EmailTester = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isConfigured, setIsConfigured] = useState(false);
  
  // EmailJS configuration
  const EMAILJS_SERVICE_ID = 'service_iqv96th';
  const EMAILJS_TEMPLATE_ID = 'template_2pd5z1i';
  const EMAILJS_USER_ID = 'QSWNF6DxGrTMaC3CI';
  
  useEffect(() => {
    // Check if EmailJS is configured
    if (EMAILJS_USER_ID && 
        EMAILJS_SERVICE_ID && 
        EMAILJS_TEMPLATE_ID) {
      setIsConfigured(true);
    }
  }, []);
  
  const handleSendTestEmail = async () => {
    if (!email) {
      toast.error("Vnesite e-poštni naslov");
      return;
    }
    
    if (!isConfigured) {
      toast.error("EmailJS ni konfiguriran. Prosimo, nastavite pravilne ID-je.");
      setLogs(prev => [...prev, 
        `[${new Date().toISOString()}] ERROR: EmailJS ni pravilno konfiguriran. Prosimo, posodobite ID-je v kodi.`
      ]);
      return;
    }
    
    setLoading(true);
    setLogs([`[${new Date().toISOString()}] Pošiljanje testne e-pošte na ${email}...`]);
    
    try {
      // Current timestamp for the test
      const currentTime = new Date().toLocaleTimeString();
      const currentDateTime = new Date().toLocaleString();
      
      // Create HTML test message
      const htmlMessage = `
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://www.lcc.si/wp-content/uploads/2020/03/Logo-COREL-Brez-ozadja-2-1024x462-1.png" alt="LCC" style="max-width: 200px; height: auto;">
          </div>
          <h2 style="color: #1D6EC1;">Test Email</h2>
          <p>To je testna e-pošta poslana ob ${currentDateTime}.</p>
          <ul style="list-style-type: circle; padding-left: 20px;">
            <li>To sporočilo je v HTML formatu</li>
            <li>Preverjamo, če se pravilno prikaže</li>
            <li>Vsebuje <strong>poudarjen tekst</strong> in <em>ležeč tekst</em></li>
          </ul>
          <p><a href="https://lcc.si" style="color: #1D6EC1;">Povezava do spletne strani</a></p>
          <p style="font-size: 14px; color: #666; margin-top: 20px;">Za dodatne informacije nas kontaktirajte na <a href="mailto:info@lcc.si" style="color: #1D6EC1;">info@lcc.si</a> ali po telefonu na +386 7 393 07 00.</p>
        </div>
      `;
      
      // Prepare template parameters
      const templateParams = {
        to_email: email,
        title: `Test Email ${currentTime}`,
        message: htmlMessage,
        from_name: 'LCC Naročilo razreza',
        reply_to: 'info@lcc.si',
        html_content: true, // Add a flag to indicate HTML content
        hideFooter: true // Add parameter to hide EmailJS footer
      };
      
      setLogs(prev => [...prev, `[${new Date().toISOString()}] Vzpostavljanje povezave z EmailJS...`]);
      
      // Send email
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_USER_ID
      );
      
      const emailId = `email_${Date.now()}`;
      
      setLogs(prev => [
        ...prev, 
        `[${new Date().toISOString()}] E-pošta uspešno poslana (ID: ${emailId})`,
        `[${new Date().toISOString()}] Odgovor strežnika: ${result.text}`,
        `[${new Date().toISOString()}] Status: ${result.status}`,
        `[${new Date().toISOString()}] Zadeva: ${templateParams.title}`,
        `[${new Date().toISOString()}] Vsebina poslana kot HTML format`
      ]);
      
      addLog('info', 'Test email sent', {
        recipient: email,
        emailId: emailId,
        status: result.status,
        response: result.text,
        isHtml: true
      });
      
      toast.success("E-pošta poslana", {
        description: `E-pošta je bila uspešno poslana na ${email}`
      });
    } catch (error) {
      console.error('Error sending email:', error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      setLogs(prev => [...prev, `[${new Date().toISOString()}] NAPAKA: ${errorMessage}`]);
      
      addLog('error', 'Test email sending failed', {
        recipient: email,
        error: errorMessage
      });
      
      toast.error("Napaka pri pošiljanju", {
        description: "Preverite konzolo za podrobnosti."
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <h2 className="text-xl font-bold">Test pošiljanja e-pošte</h2>
      
      {!isConfigured && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>EmailJS ni konfiguriran</AlertTitle>
          <AlertDescription>
            Za pošiljanje e-pošte je potrebno nastaviti EmailJS. Potrebujete Service ID, Template ID in User ID iz EmailJS nadzorne plošče.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex gap-2">
        <Input
          placeholder="E-poštni naslov"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button onClick={handleSendTestEmail} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Pošlji testno e-pošto
        </Button>
      </div>
      
      <div className="mt-4">
        <h3 className="font-medium mb-2">Rezultati pošiljanja</h3>
        <div className="bg-gray-100 p-2 rounded h-[300px] overflow-y-auto font-mono text-xs">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="pb-1">
                {log}
              </div>
            ))
          ) : (
            <p className="text-gray-500">Ni rezultatov. Kliknite "Pošlji testno e-pošto" za pošiljanje testne e-pošte.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailTester;
