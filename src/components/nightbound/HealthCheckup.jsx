import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function HealthCheckup({ human, onClose }) {
  const [testResults, setTestResults] = useState(null);
  const [testing, setTesting] = useState(false);
  const [lastCheckup, setLastCheckup] = useState(null);
  const queryClient = useQueryClient();

  const runCheckup = async () => {
    setTesting(true);
    
    // Simulate testing time
    setTimeout(async () => {
      const risk = (human.danger_level || 0) / 100;
      const hasIssue = Math.random() < risk * 0.3; // Higher danger = more risk
      
      const results = {
        date: new Date().toLocaleDateString(),
        clean: !hasIssue,
        tests: [
          { name: 'HIV', result: hasIssue && Math.random() > 0.9 ? 'positive' : 'negative' },
          { name: 'Chlamydia', result: hasIssue && Math.random() > 0.7 ? 'positive' : 'negative' },
          { name: 'Gonorrhea', result: hasIssue && Math.random() > 0.7 : 'positive' : 'negative' },
          { name: 'Syphilis', result: hasIssue && Math.random() > 0.85 ? 'positive' : 'negative' },
          { name: 'Hepatitis B', result: hasIssue && Math.random() > 0.9 ? 'positive' : 'negative' },
          { name: 'Hepatitis C', result: hasIssue && Math.random() > 0.9 ? 'positive' : 'negative' }
        ]
      };

      results.clean = results.tests.every(t => t.result === 'negative');

      setTestResults(results);
      setLastCheckup(Date.now());
      setTesting(false);

      let logText = `${human.name} got STI screening - ${results.clean ? 'All clear!' : 'POSITIVE results detected'}`;
      
      if (!results.clean) {
        const positive = results.tests.filter(t => t.result === 'positive');
        logText += ` (${positive.map(t => t.name).join(', ')})`;
      }

      await base44.entities.NightLog.create({
        entry: logText,
        category: 'interaction',
        intensity: results.clean ? 'subtle' : 'significant'
      });

      queryClient.invalidateQueries();
    }, 2000);
  };

  const daysSinceCheckup = lastCheckup ? Math.floor((Date.now() - lastCheckup) / (1000 * 60 * 60 * 24)) : 999;
  const needsCheckup = daysSinceCheckup > 30;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto border border-blue-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Health Checkup</h2>
              <p className="text-gray-400 text-sm">Sexual health screening</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {needsCheckup && !testResults && (
          <div className="bg-yellow-950/40 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <p className="text-yellow-300 text-sm text-center">
              ⚠️ It's been {daysSinceCheckup > 999 ? 'never' : `${daysSinceCheckup} days`} since your last checkup
            </p>
          </div>
        )}

        {!testing && !testResults && (
          <div className="space-y-4">
            <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-4">
              <h3 className="text-white font-bold mb-2">🏥 STI Screening</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• Comprehensive STI panel</p>
                <p>• Confidential results</p>
                <p>• Free at clinic</p>
                <p>• Recommended every 3-6 months</p>
              </div>
            </div>

            <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4">
              <h4 className="text-white font-bold text-sm mb-2">Tests Include:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                <p>• HIV</p>
                <p>• Chlamydia</p>
                <p>• Gonorrhea</p>
                <p>• Syphilis</p>
                <p>• Hepatitis B</p>
                <p>• Hepatitis C</p>
              </div>
            </div>

            <button
              onClick={runCheckup}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold"
            >
              🩺 Get Tested (Free)
            </button>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3">
              <p className="text-gray-400 text-xs text-center">
                Regular testing is important for anyone sexually active, especially sex workers
              </p>
            </div>
          </div>
        )}

        {testing && (
          <div className="space-y-4">
            <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-6 text-center">
              <Activity className="w-12 h-12 text-blue-400 mx-auto mb-3 animate-pulse" />
              <p className="text-white font-bold mb-2">Running Tests...</p>
              <p className="text-gray-400 text-sm">Processing your samples</p>
            </div>
          </div>
        )}

        {testResults && (
          <div className="space-y-4">
            <div className={`rounded-xl p-6 border-2 ${
              testResults.clean 
                ? 'bg-green-950/40 border-green-500/50' 
                : 'bg-red-950/40 border-red-500/50'
            }`}>
              {testResults.clean ? (
                <>
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <h3 className="text-white font-bold text-xl text-center mb-2">All Clear! ✓</h3>
                  <p className="text-green-300 text-center text-sm">All tests came back negative</p>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <h3 className="text-white font-bold text-xl text-center mb-2">Positive Results</h3>
                  <p className="text-red-300 text-center text-sm mb-4">Some tests came back positive</p>
                </>
              )}
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <h4 className="text-white font-bold mb-3">Test Results:</h4>
              <div className="space-y-2">
                {testResults.tests.map((test, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">{test.name}</span>
                    <span className={`text-sm font-bold ${
                      test.result === 'negative' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {test.result === 'negative' ? '✓ Negative' : '✗ POSITIVE'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {!testResults.clean && (
              <div className="bg-orange-950/40 border border-orange-500/30 rounded-xl p-4">
                <h4 className="text-orange-300 font-bold text-sm mb-2">⚠️ Next Steps:</h4>
                <div className="space-y-1 text-xs text-gray-300">
                  <p>• Contact doctor immediately</p>
                  <p>• Begin treatment ASAP</p>
                  <p>• Notify recent partners</p>
                  <p>• Use protection always</p>
                  <p>• Follow up in 2 weeks</p>
                </div>
              </div>
            )}

            <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-3">
              <p className="text-blue-300 text-xs text-center">
                Tested on: {testResults.date}
              </p>
            </div>

            <button
              onClick={() => {
                setTestResults(null);
                onClose();
              }}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold"
            >
              Done
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}