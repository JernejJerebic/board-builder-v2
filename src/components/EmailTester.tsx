
import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { addLog } from '@/services/localStorage';

const EmailTester = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  
  const handleSendTestEmail = async () => {
    if (!email) {
      toast.error("Vnesite e-poštni naslov");
      return;
    }
    
    setLoading(true);
    setLogs([`[${new Date().toISOString()}] Sending test email to ${email}...`]);
    
    try {
      // Test direct endpoint
      setLogs(prev => [...prev, `[${new Date().toISOString()}] Testing direct PHP mail endpoint...`]);
      
      const response = await axios.post('/api/email/send.php', {
        to_email: email,
        subject: 'Test Email ' + new Date().toLocaleTimeString(),
        message: `<h1>Test Email</h1><p>This is a test email sent at ${new Date().toLocaleString()}</p>`,
        is_html: true
      });
      
      setLogs(prev => [...prev, `[${new Date().toISOString()}] Direct API response: ${JSON.stringify(response.data)}`]);
      
      addLog('info', 'Test email sent', {
        recipient: email,
        response: response.data
      });
      
      toast.success("E-pošta je poslana", {
        description: "Test e-pošte je bil uspešno poslan!"
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      
      const errorMessage = axios.isAxiosError(error)
        ? `${error.message}: ${JSON.stringify(error.response?.data || {})}`
        : String(error);
      
      setLogs(prev => [...prev, `[${new Date().toISOString()}] ERROR: ${errorMessage}`]);
      
      addLog('error', 'Test email failed', {
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
  
  const checkEmailLogs = async () => {
    setLoading(true);
    setLogs(prev => [...prev, `[${new Date().toISOString()}] Checking email logs...`]);
    
    try {
      const response = await axios.get('/api/email/logs.php');
      
      setLogs(prev => [
        ...prev, 
        `[${new Date().toISOString()}] Log configuration: ${JSON.stringify(response.data.mail_configuration)}`,
        `[${new Date().toISOString()}] Found logs: ${response.data.found_logs ? 'Yes' : 'No'}`
      ]);
      
      if (response.data.email_logs && response.data.email_logs.length > 0) {
        setLogs(prev => [
          ...prev,
          `[${new Date().toISOString()}] === Email Logs ===`
        ]);
        
        response.data.email_logs.forEach((log: { content: string, source: string }, index: number) => {
          setLogs(prev => [
            ...prev,
            `[${index + 1}] ${log.content} (${log.source})`
          ]);
        });
      } else {
        setLogs(prev => [...prev, `[${new Date().toISOString()}] No email logs found`]);
      }
      
      toast.success("Logs retrieved", {
        description: `Found ${response.data.email_logs.length} log entries`
      });
    } catch (error) {
      console.error('Error checking email logs:', error);
      
      const errorMessage = axios.isAxiosError(error)
        ? `${error.message}: ${JSON.stringify(error.response?.data || {})}`
        : String(error);
      
      setLogs(prev => [...prev, `[${new Date().toISOString()}] ERROR checking logs: ${errorMessage}`]);
      
      toast.error("Napaka pri preverjanju logov", {
        description: "Preverite konzolo za podrobnosti."
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    setLoading(true);
    setLogs(prev => [...prev, `[${new Date().toISOString()}] Running diagnostic test email...`]);
    
    try {
      const response = await axios.get('/api/email/test.php');
      
      setLogs(prev => [
        ...prev,
        `[${new Date().toISOString()}] Test result: ${JSON.stringify(response.data)}`
      ]);
      
      toast.success("Diagnostični test končan", {
        description: response.data.message
      });
    } catch (error) {
      console.error('Error in diagnostic test:', error);
      
      const errorMessage = axios.isAxiosError(error)
        ? `${error.message}: ${JSON.stringify(error.response?.data || {})}`
        : String(error);
      
      setLogs(prev => [...prev, `[${new Date().toISOString()}] ERROR in diagnostic: ${errorMessage}`]);
      
      // Even if there's an error, we might have useful diagnostic info in the response
      if (axios.isAxiosError(error) && error.response?.data) {
        setLogs(prev => [
          ...prev,
          `[${new Date().toISOString()}] Diagnostic data: ${JSON.stringify(error.response.data)}`
        ]);
      }
      
      toast.error("Diagnostika ni uspela", {
        description: "Informacije so zabeležene v konzoli."
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <h2 className="text-xl font-bold">Test pošiljanja e-pošte</h2>
      
      <div className="flex gap-2">
        <Input
          placeholder="E-poštni naslov"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button onClick={handleSendTestEmail} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Pošlji test
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" onClick={checkEmailLogs} disabled={loading}>
          Preveri loge
        </Button>
        <Button variant="outline" onClick={sendTestEmail} disabled={loading}>
          Diagnostični test
        </Button>
      </div>
      
      <div className="mt-4">
        <h3 className="font-medium mb-2">Rezultati</h3>
        <div className="bg-gray-100 p-2 rounded h-[300px] overflow-y-auto font-mono text-xs">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="pb-1">
                {log}
              </div>
            ))
          ) : (
            <p className="text-gray-500">Ni razultatov. Kliknite "Pošlji test" za pošiljanje testne e-pošte.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailTester;
