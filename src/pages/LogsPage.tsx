
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, RefreshCw, Search, Trash2 } from "lucide-react";

interface LogEntry {
  timestamp: string;
  type: 'info' | 'error' | 'warn';
  message: string;
  details?: string;
}

const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to get console logs from localStorage or memory
  const fetchLogs = () => {
    setIsLoading(true);
    
    // Get logs from localStorage
    try {
      const storedLogs = localStorage.getItem('app_logs');
      const parsedLogs = storedLogs ? JSON.parse(storedLogs) : [];
      setLogs(parsedLogs);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      // Add this error to logs
      const newError: LogEntry = {
        timestamp: new Date().toISOString(),
        type: 'error',
        message: 'Failed to fetch logs',
        details: error instanceof Error ? error.message : String(error)
      };
      
      setLogs(prev => [newError, ...prev]);
    }
    
    setIsLoading(false);
  };

  // Function to clear logs
  const clearLogs = () => {
    localStorage.setItem('app_logs', JSON.stringify([]));
    setLogs([]);
  };

  // Function to download logs as JSON file
  const downloadLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `woodboard-logs-${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Filter logs based on search term
  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
    log.timestamp.includes(searchTerm)
  );

  // Fetch logs on component mount
  useEffect(() => {
    fetchLogs();
    
    // Set up console log interceptor
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    console.log = function(message, ...args) {
      const timestamp = new Date().toISOString();
      const logEntry: LogEntry = {
        timestamp,
        type: 'info',
        message: typeof message === 'string' ? message : JSON.stringify(message),
        details: args.length > 0 ? JSON.stringify(args) : undefined
      };
      
      // Store in localStorage
      const storedLogs = localStorage.getItem('app_logs');
      const parsedLogs: LogEntry[] = storedLogs ? JSON.parse(storedLogs) : [];
      parsedLogs.unshift(logEntry);
      localStorage.setItem('app_logs', JSON.stringify(parsedLogs.slice(0, 500))); // Limit to 500 entries
      
      originalConsoleLog.apply(console, [message, ...args]);
    };
    
    console.error = function(message, ...args) {
      const timestamp = new Date().toISOString();
      const logEntry: LogEntry = {
        timestamp,
        type: 'error',
        message: typeof message === 'string' ? message : JSON.stringify(message),
        details: args.length > 0 ? JSON.stringify(args) : undefined
      };
      
      const storedLogs = localStorage.getItem('app_logs');
      const parsedLogs: LogEntry[] = storedLogs ? JSON.parse(storedLogs) : [];
      parsedLogs.unshift(logEntry);
      localStorage.setItem('app_logs', JSON.stringify(parsedLogs.slice(0, 500)));
      
      originalConsoleError.apply(console, [message, ...args]);
    };
    
    console.warn = function(message, ...args) {
      const timestamp = new Date().toISOString();
      const logEntry: LogEntry = {
        timestamp,
        type: 'warn',
        message: typeof message === 'string' ? message : JSON.stringify(message),
        details: args.length > 0 ? JSON.stringify(args) : undefined
      };
      
      const storedLogs = localStorage.getItem('app_logs');
      const parsedLogs: LogEntry[] = storedLogs ? JSON.parse(storedLogs) : [];
      parsedLogs.unshift(logEntry);
      localStorage.setItem('app_logs', JSON.stringify(parsedLogs.slice(0, 500)));
      
      originalConsoleWarn.apply(console, [message, ...args]);
    };
    
    // Clean up interceptors on component unmount
    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Application Logs</h1>
        <div className="flex gap-2">
          <Button 
            onClick={fetchLogs} 
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button 
            onClick={clearLogs} 
            variant="outline"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Clear
          </Button>
          <Button 
            onClick={downloadLogs} 
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.type === 'error' ? 'bg-red-100 text-red-800' : 
                      log.type === 'warn' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {log.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.message}</div>
                      {log.details && (
                        <div className="text-sm text-muted-foreground mt-1 font-mono break-all">
                          {log.details.length > 150
                            ? `${log.details.substring(0, 150)}...`
                            : log.details}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-xs text-muted-foreground">
        Showing {filteredLogs.length} of {logs.length} logs
      </div>
    </div>
  );
};

export default LogsPage;
